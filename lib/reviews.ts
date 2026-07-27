import { fetchBrunchReviews } from "@/lib/brunch";
import type { Review } from "@/lib/books/types";
import { promises as fs } from "fs";
import path from "path";

const BRUNCH_CACHE = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "cache",
  "brunch-reviews.json",
);
const BRUNCH_TMP = path.join("/tmp", "savvy-book-club", "brunch-reviews.json");

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

/** Brunch @econbook reviews only. */
export async function getAllReviews(): Promise<Review[]> {
  const brunch = await getBrunchReviews();
  return [...brunch].sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title, "ko"),
  );
}

export async function getReviewBySlug(slug: string): Promise<Review | null> {
  const all = await getAllReviews();
  const exact = all.find((review) => review.slug === slug);
  if (exact) return exact;

  // Backward-compatible: brunch-36-... → brunch-36
  const brunchNo = slug.match(/^brunch-(\d+)/);
  if (brunchNo) {
    return all.find((review) => review.slug === `brunch-${brunchNo[1]}`) ?? null;
  }

  return null;
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
