import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { fetchBrunchReviews } from "@/lib/brunch";
import type { Review, ReviewLanguage } from "@/lib/books/types";

const REVIEWS_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "content",
  "reviews",
);
const BRUNCH_CACHE = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "cache",
  "brunch-reviews.json",
);
const BRUNCH_TMP = path.join("/tmp", "savvy-book-club", "brunch-reviews.json");

interface ReviewFrontmatter {
  title: string;
  author: string;
  year: number;
  language: ReviewLanguage;
  isOriginalEnglish?: boolean;
  coverUrl: string;
  excerpt: string;
  whyRead: string;
  purchaseUrl?: string;
  tags?: string[];
}

async function listReviewFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(REVIEWS_DIR);
    return entries.filter((name) => name.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function parseReview(slug: string, raw: string): Review {
  const { data, content } = matter(raw);
  const fm = data as ReviewFrontmatter;

  return {
    slug,
    title: fm.title,
    author: fm.author,
    year: fm.year,
    language: fm.language,
    isOriginalEnglish: Boolean(fm.isOriginalEnglish),
    coverUrl: fm.coverUrl,
    excerpt: fm.excerpt,
    whyRead: fm.whyRead,
    body: content.trim(),
    purchaseUrl: fm.purchaseUrl,
    tags: fm.tags ?? [],
    source: "local",
  };
}

async function readBrunchCache(): Promise<Review[] | null> {
  for (const filePath of [BRUNCH_TMP, BRUNCH_CACHE]) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as Review[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // continue
    }
  }
  return null;
}

export async function writeBrunchCache(reviews: Review[]): Promise<void> {
  const payload = JSON.stringify(reviews, null, 2);
  const targets = process.env.VERCEL
    ? [BRUNCH_TMP]
    : [BRUNCH_CACHE, BRUNCH_TMP];

  for (const target of targets) {
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, payload, "utf8");
      break;
    } catch (error) {
      console.error("Failed to write brunch cache", target, error);
    }
  }
}

export async function syncBrunchReviews(): Promise<Review[]> {
  const reviews = await fetchBrunchReviews();
  if (reviews.length > 0) {
    await writeBrunchCache(reviews);
  }
  return reviews;
}

export async function getLocalReviews(): Promise<Review[]> {
  const files = await listReviewFiles();
  return Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(REVIEWS_DIR, file), "utf8");
      return parseReview(slug, raw);
    }),
  );
}

export async function getBrunchReviews(): Promise<Review[]> {
  const cached = await readBrunchCache();
  if (cached) return cached;

  try {
    return await syncBrunchReviews();
  } catch (error) {
    console.error("Brunch sync failed", error);
    return [];
  }
}

/** Brunch reviews first, then local samples that are not duplicates by title. */
export async function getAllReviews(): Promise<Review[]> {
  const [brunch, local] = await Promise.all([
    getBrunchReviews(),
    getLocalReviews(),
  ]);

  const titles = new Set(brunch.map((r) => r.title.replace(/\s+/g, "")));
  const extras = local.filter(
    (r) => !titles.has(r.title.replace(/\s+/g, "")),
  );

  return [...brunch, ...extras].sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title, "ko"),
  );
}

export async function getReviewBySlug(slug: string): Promise<Review | null> {
  const all = await getAllReviews();
  return all.find((review) => review.slug === slug) ?? null;
}

export async function getReviewSlugs(): Promise<string[]> {
  const all = await getAllReviews();
  return all.map((review) => review.slug);
}

export async function getFeaturedReviews(limit = 8): Promise<Review[]> {
  const reviews = await getAllReviews();
  const withCovers = reviews.filter((r) => r.coverUrl);
  return (withCovers.length >= limit ? withCovers : reviews).slice(0, limit);
}
