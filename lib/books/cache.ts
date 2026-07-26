import { promises as fs } from "fs";
import path from "path";
import { seedCatalog } from "@/lib/books/seed";
import { scrapeAladinBestsellers, scrapeAladinNewReleases } from "@/lib/books/scrape-aladin";
import { scrapeBookNews } from "@/lib/books/scrape-news";
import { scrapeOpenLibraryTrending } from "@/lib/books/scrape-openlibrary";
import {
  scrapeYes24Bestsellers,
  scrapeYes24ForeignBestsellers,
  scrapeYes24NewReleases,
} from "@/lib/books/scrape-yes24";
import type { Book, BookCatalog, BookNewsItem, CatalogSection } from "@/lib/books/types";

const CACHE_FILENAME = "catalog.json";

function cachePaths(): string[] {
  const repoPath = path.join(process.cwd(), "data", "cache", CACHE_FILENAME);
  const tmpPath = path.join("/tmp", "savvy-book-club", CACHE_FILENAME);
  return [tmpPath, repoPath];
}

function formatKst(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function readJsonFile(filePath: string): Promise<BookCatalog | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as BookCatalog;
    if (!parsed.sections) return null;
    if (!parsed.bookNews) parsed.bookNews = seedCatalog.bookNews;
    if (!parsed.updatedAtKst) parsed.updatedAtKst = formatKst(new Date(parsed.updatedAt));
    return parsed;
  } catch {
    return null;
  }
}

export async function readCatalogCache(): Promise<BookCatalog | null> {
  for (const filePath of cachePaths()) {
    const catalog = await readJsonFile(filePath);
    if (catalog) return catalog;
  }
  return null;
}

export async function writeCatalogCache(catalog: BookCatalog): Promise<string> {
  const [tmpPath, repoPath] = cachePaths();
  const payload = JSON.stringify(catalog, null, 2);
  const targets = process.env.VERCEL ? [tmpPath] : [repoPath, tmpPath];

  let written = "";
  for (const target of targets) {
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, payload, "utf8");
      written = target;
      break;
    } catch (error) {
      console.error("Failed to write catalog cache", target, error);
    }
  }

  return written;
}

function withFallback<T>(live: T[], fallback: T[]): T[] {
  return live.length > 0 ? live : fallback;
}

export async function syncBookCatalog(): Promise<BookCatalog> {
  const [
    aladinBest,
    yes24Best,
    aladinNew,
    yes24New,
    yes24Foreign,
    openLibrary,
    bookNews,
  ] = await Promise.all([
    scrapeAladinBestsellers(),
    scrapeYes24Bestsellers(),
    scrapeAladinNewReleases(),
    scrapeYes24NewReleases(),
    scrapeYes24ForeignBestsellers(),
    scrapeOpenLibraryTrending(),
    scrapeBookNews(),
  ]);

  const now = new Date();
  const catalog: BookCatalog = {
    updatedAt: now.toISOString(),
    updatedAtKst: formatKst(now),
    sections: {
      domesticBestsellers: withFallback(
        aladinBest,
        seedCatalog.sections.domesticBestsellers,
      ),
      yes24Bestsellers: withFallback(
        yes24Best,
        seedCatalog.sections.yes24Bestsellers,
      ),
      newReleases: withFallback(
        aladinNew.length > 0 ? aladinNew : yes24New,
        seedCatalog.sections.newReleases,
      ),
      foreignBestsellers: withFallback(
        yes24Foreign,
        seedCatalog.sections.foreignBestsellers,
      ),
      englishBestsellers: withFallback(
        openLibrary,
        seedCatalog.sections.englishBestsellers,
      ),
    },
    bookNews: withFallback(bookNews, seedCatalog.bookNews) as BookNewsItem[],
  };

  await writeCatalogCache(catalog);
  return catalog;
}

/** Prefer cached crawl results so page views do not re-scrape every time. */
export async function getBookCatalog(): Promise<BookCatalog> {
  const cached = await readCatalogCache();
  if (cached) return cached;

  try {
    return await syncBookCatalog();
  } catch (error) {
    console.error("Catalog sync failed, using seed", error);
    return seedCatalog;
  }
}

export function getSection(
  catalog: BookCatalog,
  section: CatalogSection,
): Book[] {
  return catalog.sections[section] ?? [];
}
