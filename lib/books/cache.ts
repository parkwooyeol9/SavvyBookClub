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
import {
  emptyChartedBooks,
  normalizeChartedBooks,
  type ChartedBooks,
  type ChartPeriod,
} from "@/lib/books/chart-periods";

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

    parsed.sections.domesticBestsellers = normalizeChartedBooks(
      parsed.sections.domesticBestsellers as Book[] | ChartedBooks,
    );
    parsed.sections.yes24Bestsellers = normalizeChartedBooks(
      parsed.sections.yes24Bestsellers as Book[] | ChartedBooks,
    );
    parsed.sections.foreignBestsellers = normalizeChartedBooks(
      parsed.sections.foreignBestsellers as Book[] | ChartedBooks,
    );

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

function withChartFallback(live: ChartedBooks, fallback: ChartedBooks): ChartedBooks {
  return {
    daily: withFallback(live.daily, fallback.daily),
    weekly: withFallback(live.weekly, fallback.weekly),
    monthly: withFallback(live.monthly, fallback.monthly),
  };
}

async function scrapeCharted(
  scrape: (period: ChartPeriod) => Promise<Book[]>,
): Promise<ChartedBooks> {
  const periods: ChartPeriod[] = ["daily", "weekly", "monthly"];
  const results = await Promise.all(periods.map((period) => scrape(period)));
  return {
    daily: results[0],
    weekly: results[1],
    monthly: results[2],
  };
}

export async function syncBookCatalog(): Promise<BookCatalog> {
  const [
    aladinCharts,
    yes24Charts,
    aladinNew,
    yes24New,
    yes24ForeignCharts,
    openLibrary,
    bookNews,
  ] = await Promise.all([
    scrapeCharted(scrapeAladinBestsellers),
    scrapeCharted(scrapeYes24Bestsellers),
    scrapeAladinNewReleases(),
    scrapeYes24NewReleases(),
    scrapeCharted(scrapeYes24ForeignBestsellers),
    scrapeOpenLibraryTrending(),
    scrapeBookNews(),
  ]);

  const now = new Date();
  const catalog: BookCatalog = {
    updatedAt: now.toISOString(),
    updatedAtKst: formatKst(now),
    sections: {
      domesticBestsellers: withChartFallback(
        aladinCharts,
        seedCatalog.sections.domesticBestsellers,
      ),
      yes24Bestsellers: withChartFallback(
        yes24Charts,
        seedCatalog.sections.yes24Bestsellers,
      ),
      newReleases: withFallback(
        aladinNew.length > 0 ? aladinNew : yes24New,
        seedCatalog.sections.newReleases,
      ),
      foreignBestsellers: withChartFallback(
        yes24ForeignCharts,
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
): Book[] | ChartedBooks {
  return catalog.sections[section] ?? [];
}
