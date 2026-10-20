import { promises as fs } from "fs";
import path from "path";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import { workKey } from "@/lib/books/identity";
import { readSharedText, writeSharedText } from "@/lib/books/persist";
import type { Book, BookCatalog } from "@/lib/books/types";

const HISTORY_FILENAME = "rank-history.json";
const TMP_PATH = path.join("/tmp", "savvy-book-club", HISTORY_FILENAME);
const REPO_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "cache",
  HISTORY_FILENAME,
);

export interface RankHistory {
  updatedAt: string;
  entries: Record<string, number>;
}

export function rankEntryKey(
  section: string,
  period: string,
  book: Pick<Book, "title" | "author">,
): string {
  return `${section}:${period}:${workKey(book.title)}:${book.author.replace(/\s+/g, "")}`;
}

function parseHistory(raw: string): RankHistory | null {
  try {
    const parsed = JSON.parse(raw) as RankHistory;
    if (!parsed || typeof parsed.entries !== "object" || !parsed.entries) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readRankHistory(): Promise<RankHistory | null> {
  const shared = await readSharedText(HISTORY_FILENAME);
  if (shared) {
    const parsed = parseHistory(shared);
    if (parsed) return parsed;
  }

  for (const filePath of [TMP_PATH, REPO_PATH]) {
    try {
      const parsed = parseHistory(await fs.readFile(filePath, "utf8"));
      if (parsed) return parsed;
    } catch {
      // try the next location
    }
  }
  return null;
}

export async function writeRankHistory(history: RankHistory): Promise<void> {
  const payload = JSON.stringify(history);
  await writeSharedText(HISTORY_FILENAME, payload);
  const targets = process.env.VERCEL ? [TMP_PATH] : [REPO_PATH, TMP_PATH];
  for (const target of targets) {
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, payload, "utf8");
      break;
    } catch (error) {
      console.error("Failed to write rank history", target, error);
    }
  }
}

function visitChart(
  entries: Record<string, number>,
  section: string,
  period: string,
  books: Book[],
  apply: boolean,
  history: RankHistory | null,
): number {
  let changes = 0;
  for (const book of books) {
    if (book.rank == null) continue;
    const key = rankEntryKey(section, period, book);
    if (apply && history) {
      const previous = history.entries[key];
      if (typeof previous === "number" && previous !== book.rank) {
        book.rankDelta = previous - book.rank;
        changes += 1;
      }
    }
    entries[key] = book.rank;
  }
  return changes;
}

function walk(
  catalog: BookCatalog,
  apply: boolean,
  history: RankHistory | null,
): { entries: Record<string, number>; changes: number } {
  const entries: Record<string, number> = {};
  let changes = 0;
  const periods: ChartPeriod[] = ["daily", "weekly", "monthly"];
  const charted = [
    ["domestic", catalog.sections.domesticBestsellers],
    ["yes24", catalog.sections.yes24Bestsellers],
    ["foreign", catalog.sections.foreignBestsellers],
  ] as const;

  for (const [section, books] of charted) {
    for (const period of periods) {
      changes += visitChart(entries, section, period, books[period], apply, history);
    }
  }

  changes += visitChart(entries, "new", "list", catalog.sections.newReleases, apply, history);
  changes += visitChart(
    entries,
    "english",
    "list",
    catalog.sections.englishBestsellers,
    apply,
    history,
  );

  for (const [categoryId, books] of Object.entries(catalog.sections.categoryBestsellers)) {
    for (const period of periods) {
      changes += visitChart(
        entries,
        `category:${categoryId}`,
        period,
        books[period] ?? [],
        apply,
        history,
      );
    }
  }

  return { entries, changes };
}

/** Compare store ranks with the previous snapshot and set `rankDelta` (positive = climbed). */
export function applyRankDeltas(catalog: BookCatalog, history: RankHistory | null): number {
  return walk(catalog, true, history).changes;
}

export function snapshotRanks(catalog: BookCatalog): RankHistory {
  return {
    updatedAt: catalog.updatedAt,
    entries: walk(catalog, false, null).entries,
  };
}

export function countRankDeltas(catalog: BookCatalog): number {
  let count = 0;
  const note = (books: Book[]) => {
    for (const book of books) {
      if (book.rankDelta) count += 1;
    }
  };
  note(catalog.sections.newReleases);
  note(catalog.sections.englishBestsellers);
  for (const period of ["daily", "weekly", "monthly"] as const) {
    note(catalog.sections.domesticBestsellers[period]);
    note(catalog.sections.yes24Bestsellers[period]);
    note(catalog.sections.foreignBestsellers[period]);
  }
  for (const books of Object.values(catalog.sections.categoryBestsellers)) {
    for (const period of ["daily", "weekly", "monthly"] as const) {
      note(books[period] ?? []);
    }
  }
  return count;
}
