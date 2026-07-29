import { promises as fs } from "fs";
import path from "path";
import { seedCatalog } from "@/lib/books/seed";
import { isCatalogStale } from "@/lib/books/freshness";
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
const TMP_PATH = path.join("/tmp", "savvy-book-club", CACHE_FILENAME);
const REPO_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "cache",
  CACHE_FILENAME,
);

function cacheReadPaths(): string[] {
  // On Vercel, only /tmp is writable; bundled repo cache is often days old.
  if (process.env.VERCEL) return [TMP_PATH];
  return [TMP_PATH, REPO_PATH];
}

function cacheWritePaths(): string[] {
  if (process.env.VERCEL) return [TMP_PATH];
  return [REPO_PATH, TMP_PATH];
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
  for (const filePath of cacheReadPaths()) {
    const catalog = await readJsonFile(filePath);
    if (catalog) return catalog;
  }
  return null;
}

export async function writeCatalogCache(catalog: BookCatalog): Promise<string> {
  const payload = JSON.stringify(catalog, null, 2);
  let written = "";

  for (const target of cacheWritePaths()) {
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

/**
 * Return fresh catalog data. Re-crawls when cache is missing or older than ~22h
 * so production does not keep serving a stale bundled JSON forever.
 */
export async function getBookCatalog(): Promise<BookCatalog> {
  const cached = await readCatalogCache();

  if (cached && !isCatalogStale(cached.updatedAt)) {
    return cached;
  }

  try {
    return await syncBookCatalog();
  } catch (error) {
    console.error("Catalog sync failed", error);
    if (cached) return cached;
    return seedCatalog;
  }
}

export function getSection(
  catalog: BookCatalog,
  section: CatalogSection,
): Book[] {
  return catalog.sections[section] ?? [];
}
