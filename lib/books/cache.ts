import { unstable_cache } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { readSharedText, writeSharedText } from "@/lib/books/persist";
import {
  applyRankDeltas,
  readRankHistory,
  snapshotRanks,
  writeRankHistory,
} from "@/lib/books/rank-history";
import { seedCatalog } from "@/lib/books/seed";
import { isCatalogStale } from "@/lib/books/freshness";
import {
  ALADIN_CATEGORIES,
  scrapeAladinBestsellers,
  scrapeAladinCategoryBestsellers,
  scrapeAladinNewReleases,
} from "@/lib/books/scrape-aladin";
import { scrapeBookNews } from "@/lib/books/scrape-news";
import { scrapeOpenLibraryTrending } from "@/lib/books/scrape-openlibrary";
import {
  scrapeYes24Bestsellers,
  scrapeYes24ForeignBestsellers,
  scrapeYes24NewReleases,
} from "@/lib/books/scrape-yes24";
import type { Book, BookCatalog, BookNewsItem, CatalogSection, CategoryBestsellers } from "@/lib/books/types";
import {
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
  // /tmp is per-instance. The committed snapshot is the cold-start fallback.
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

function normalizeCatalog(parsed: BookCatalog): BookCatalog | null {
  if (!parsed?.sections) return null;
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

  if (!parsed.sections.categoryBestsellers) {
    parsed.sections.categoryBestsellers = {};
  }

  return parsed;
}

async function readJsonFile(filePath: string): Promise<BookCatalog | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return normalizeCatalog(JSON.parse(raw) as BookCatalog);
  } catch {
    return null;
  }
}

export async function readCatalogCache(): Promise<BookCatalog | null> {
  const shared = await readSharedText(CACHE_FILENAME);
  if (shared) {
    try {
      const catalog = normalizeCatalog(JSON.parse(shared) as BookCatalog);
      if (catalog) return catalog;
    } catch (error) {
      console.error("Failed to parse shared catalog", error);
    }
  }

  for (const filePath of cacheReadPaths()) {
    const catalog = await readJsonFile(filePath);
    if (catalog) return catalog;
  }
  return null;
}

export async function writeCatalogCache(catalog: BookCatalog): Promise<string> {
  const payload = JSON.stringify(catalog, null, 2);
  const shared = await writeSharedText(CACHE_FILENAME, payload);
  let written = shared ? "blob" : "";

  for (const target of cacheWritePaths()) {
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, payload, "utf8");
      if (!written) written = target;
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

async function scrapeCategoryBestsellers(): Promise<CategoryBestsellers> {
  const nonAllCategories = ALADIN_CATEGORIES.filter((c) => c.id !== "all");
  const results: CategoryBestsellers = {};

  const entries = await Promise.all(
    nonAllCategories.map(async (cat) => {
      const charted = await scrapeCharted((period) =>
        scrapeAladinCategoryBestsellers(cat.id, period),
      );
      return [cat.id, charted] as const;
    }),
  );

  for (const [id, charted] of entries) {
    results[id] = charted;
  }
  return results;
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
    categoryCharts,
  ] = await Promise.all([
    scrapeCharted(scrapeAladinBestsellers),
    scrapeCharted(scrapeYes24Bestsellers),
    scrapeAladinNewReleases(),
    scrapeYes24NewReleases(),
    scrapeCharted(scrapeYes24ForeignBestsellers),
    scrapeOpenLibraryTrending(),
    scrapeBookNews(),
    scrapeCategoryBestsellers(),
  ]);

  const now = new Date();
  const previousRanks = await readRankHistory();
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
      categoryBestsellers: categoryCharts,
    },
    bookNews: withFallback(bookNews, seedCatalog.bookNews) as BookNewsItem[],
  };

  applyRankDeltas(catalog, previousRanks);
  await writeRankHistory(snapshotRanks(catalog));
  await writeCatalogCache(catalog);
  return catalog;
}

/**
 * Return fresh catalog data. Re-crawls when cache is missing or older than ~22h
 * so production does not keep serving a stale bundled JSON forever.
 */
async function loadBookCatalog(): Promise<BookCatalog> {
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

/**
 * Data Cache shares one catalog across Vercel instances. Cron expires the tag
 * after writing Blob (or /tmp on the cron instance).
 */
const loadCachedBookCatalog = unstable_cache(loadBookCatalog, ["book-catalog-v1"], {
  tags: ["books"],
  revalidate: 86400,
});

export async function getBookCatalog(): Promise<BookCatalog> {
  return loadCachedBookCatalog();
}

export function getSection(
  catalog: BookCatalog,
  section: CatalogSection,
): Book[] | ChartedBooks | CategoryBestsellers {
  return catalog.sections[section] ?? [];
}
