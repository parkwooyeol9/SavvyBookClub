import type { Book, BookCatalog, Review } from "@/lib/books/types";
import { pickChartBooks } from "@/lib/books/chart-periods";
import { kstDaySeed } from "@/lib/books/freshness";
import { workKey } from "@/lib/books/identity";
import { ALADIN_CATEGORIES } from "@/lib/books/scrape-aladin";

export type DailyPick =
  | { kind: "book"; book: Book; label: string }
  | { kind: "review"; review: Review; label: string };

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Weighted sampling without replacement (Efraimidis–Spirakis), deterministic per seed. */
function weightedSample<T>(items: T[], weight: (item: T) => number, seed: number): T[] {
  const rand = mulberry32(seed);
  return items
    .map((item) => ({ item, key: -Math.log(rand() || 1e-12) / Math.max(weight(item), 1e-6) }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

/** Chart family: entries from the same store count once toward consensus. */
type ChartFamily = "aladin" | "yes24" | "foreign" | "new" | "english";

interface ChartEntry {
  book: Book;
  label: string;
  family: ChartFamily;
  score: number;
}

interface WorkGroup {
  entries: ChartEntry[];
  families: Set<ChartFamily>;
  languages: Set<Book["language"]>;
}

function authorKey(author: string): string | null {
  const key = author.replace(/\s+/g, "");
  // Placeholder names would merge unrelated Korean/English books.
  if (!key || key === "저자미상" || key === "편집부") return null;
  return key;
}

function collectChartEntries(catalog: BookCatalog): ChartEntry[] {
  const { sections } = catalog;
  // [books, label, family, source weight, depth]
  const sources: [Book[], string, ChartFamily, number, number][] = [
    [pickChartBooks(sections.domesticBestsellers, "daily"), "알라딘 일간", "aladin", 1, 10],
    [pickChartBooks(sections.yes24Bestsellers, "daily"), "Yes24 일간", "yes24", 1, 10],
    [pickChartBooks(sections.foreignBestsellers, "weekly"), "외국도서", "foreign", 0.8, 6],
    [sections.newReleases, "신간", "new", 0.6, 8],
    [sections.englishBestsellers, "영문 트렌딩", "english", 0.5, 6],
    ...ALADIN_CATEGORIES.filter((c) => c.id !== "all").map(
      (cat): [Book[], string, ChartFamily, number, number] => [
        pickChartBooks(
          sections.categoryBestsellers[cat.id] ?? { daily: [], weekly: [], monthly: [] },
          "daily",
        ),
        cat.label,
        "aladin",
        0.7,
        8,
      ],
    ),
  ];

  return sources.flatMap(([books, label, family, weight, depth]) =>
    books.slice(0, depth).map((book, index) => ({
      book,
      label,
      family,
      score: weight / Math.sqrt(index + 1),
    })),
  );
}

/**
 * Group chart entries into works. Titles group volumes/editions; a Korean and an
 * English group by the same author are merged (번역판 ↔ 원서, e.g. 이민진).
 */
function groupWorks(entries: ChartEntry[]): WorkGroup[] {
  const byTitle = new Map<string, WorkGroup>();
  for (const entry of entries) {
    const key = workKey(entry.book.title) || entry.book.id;
    const group = byTitle.get(key) ?? { entries: [], families: new Set(), languages: new Set() };
    group.entries.push(entry);
    group.families.add(entry.family);
    group.languages.add(entry.book.language);
    byTitle.set(key, group);
  }

  const groups = [...byTitle.values()];
  const byAuthor = new Map<string, WorkGroup>();
  const merged: WorkGroup[] = [];
  for (const group of groups) {
    const author = authorKey(group.entries[0].book.author);
    const other = author ? byAuthor.get(author) : undefined;
    const crossLanguage =
      other && [...group.languages].some((lang) => !other.languages.has(lang));
    if (other && crossLanguage) {
      other.entries.push(...group.entries);
      group.families.forEach((family) => other.families.add(family));
      group.languages.forEach((lang) => other.languages.add(lang));
      continue;
    }
    if (author && !other) byAuthor.set(author, group);
    merged.push(group);
  }
  return merged;
}

/** Best rank per chart family, summed, then boosted when several stores agree. */
function groupWeight(group: WorkGroup): number {
  const best = new Map<ChartFamily, number>();
  for (const entry of group.entries) {
    best.set(entry.family, Math.max(best.get(entry.family) ?? 0, entry.score));
  }
  const base = [...best.values()].reduce((sum, score) => sum + score, 0);
  return base * (1 + 0.6 * (best.size - 1));
}

function representative(group: WorkGroup): DailyPick & { kind: "book" } {
  // Prefer the Korean edition; within it, the best-ranked entry.
  const pool = group.entries.some((e) => e.book.language === "ko")
    ? group.entries.filter((e) => e.book.language === "ko")
    : group.entries;
  const best = pool.reduce((a, b) => (b.score > a.score ? b : a));
  // One label per family, strongest first.
  const labels = [...group.entries]
    .sort((a, b) => b.score - a.score)
    .filter((e, i, all) => all.findIndex((x) => x.family === e.family) === i)
    .map((e) => e.label);
  const label = labels.length > 1 ? `${labels.slice(0, 2).join("·")} 동시 상위` : best.label;
  return { kind: "book", book: best.book, label };
}

/**
 * Sampling sharpness: P(pick) ∝ weight^k. k=2 keeps the daily mix varied while
 * top cross-store works show up on most days (60-day sim: ~30 distinct titles).
 */
const PICK_SHARPNESS = 2;

export function buildDailyPicks(
  catalog: BookCatalog,
  reviews: Review[],
  limit = 6,
): DailyPick[] {
  const seed = kstDaySeed();

  const works = groupWorks(collectChartEntries(catalog));
  const bookPicks = weightedSample(
    works,
    (group) => groupWeight(group) ** PICK_SHARPNESS,
    seed,
  ).map(representative);

  const reviewPicks: DailyPick[] = shuffle(
    reviews
      .filter((r) => r.coverUrl && r.rating)
      .slice(0, 12)
      .map((review) => ({ kind: "review" as const, review, label: "서평" })),
    seed + 17,
  );

  const mixed: DailyPick[] = [];
  let bi = 0;
  let ri = 0;
  while (mixed.length < limit && (bi < bookPicks.length || ri < reviewPicks.length)) {
    if (bi < bookPicks.length) {
      mixed.push(bookPicks[bi]);
      bi += 1;
    }
    if (mixed.length < limit && ri < reviewPicks.length) {
      mixed.push(reviewPicks[ri]);
      ri += 1;
    }
  }

  return mixed.slice(0, limit);
}
