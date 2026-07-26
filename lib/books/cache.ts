import { promises as fs } from "fs";
import path from "path";
import {
  fetchAladinDomesticBestsellers,
  fetchAladinForeignBestsellers,
  fetchAladinNewReleases,
} from "@/lib/books/aladin";
import { fetchEnglishBestsellers } from "@/lib/books/nyt";
import { seedCatalog } from "@/lib/books/seed";
import type { Book, BookCatalog, CatalogSection } from "@/lib/books/types";
import { fetchYes24Bestsellers } from "@/lib/books/yes24-rss";

const CACHE_FILENAME = "catalog.json";

function cachePaths(): string[] {
  const repoPath = path.join(process.cwd(), "data", "cache", CACHE_FILENAME);
  const tmpPath = path.join("/tmp", "savvy-book-club", CACHE_FILENAME);
  return [tmpPath, repoPath];
}

async function readJsonFile(filePath: string): Promise<BookCatalog | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as BookCatalog;
  } catch {
    return null;
  }
}

export async function readCatalogCache(): Promise<BookCatalog | null> {
  for (const filePath of cachePaths()) {
    const catalog = await readJsonFile(filePath);
    if (catalog?.sections) return catalog;
  }
  return null;
}

export async function writeCatalogCache(catalog: BookCatalog): Promise<string> {
  const [tmpPath, repoPath] = cachePaths();
  const payload = JSON.stringify(catalog, null, 2);

  // Prefer /tmp on serverless; also try repo path for local/dev.
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

function withFallback(live: Book[], fallback: Book[]): Book[] {
  return live.length > 0 ? live : fallback;
}

export async function syncBookCatalog(): Promise<BookCatalog> {
  const [
    domesticBestsellers,
    newReleases,
    foreignBestsellers,
    yes24Bestsellers,
    englishBestsellers,
  ] = await Promise.all([
    fetchAladinDomesticBestsellers(),
    fetchAladinNewReleases(),
    fetchAladinForeignBestsellers(),
    fetchYes24Bestsellers(),
    fetchEnglishBestsellers(),
  ]);

  const catalog: BookCatalog = {
    updatedAt: new Date().toISOString(),
    sections: {
      domesticBestsellers: withFallback(
        domesticBestsellers,
        seedCatalog.sections.domesticBestsellers,
      ),
      newReleases: withFallback(newReleases, seedCatalog.sections.newReleases),
      foreignBestsellers: withFallback(
        foreignBestsellers,
        seedCatalog.sections.foreignBestsellers,
      ),
      yes24Bestsellers: withFallback(
        yes24Bestsellers,
        seedCatalog.sections.yes24Bestsellers,
      ),
      englishBestsellers: withFallback(
        englishBestsellers,
        seedCatalog.sections.englishBestsellers,
      ),
    },
  };

  await writeCatalogCache(catalog);
  return catalog;
}

export async function getBookCatalog(): Promise<BookCatalog> {
  // Prefer live sources (Next.js fetch cache + tags). File cache / seed are fallbacks.
  try {
    return await syncBookCatalog();
  } catch (error) {
    console.error("Catalog sync failed, using cache/seed", error);
    return (await readCatalogCache()) ?? seedCatalog;
  }
}

export function getSection(
  catalog: BookCatalog,
  section: CatalogSection,
): Book[] {
  return catalog.sections[section] ?? [];
}
