import { unstable_cache } from "next/cache";
import { fetchBrunchReviews } from "@/lib/brunch";
import { readSharedText, writeSharedText } from "@/lib/books/persist";
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
const BRUNCH_NAME = "brunch-reviews.json";

function parseReviews(raw: string): Review[] | null {
  try {
    const parsed = JSON.parse(raw) as Review[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    return null;
  }
  return null;
}

async function readBrunchCache(): Promise<Review[] | null> {
  const shared = await readSharedText(BRUNCH_NAME);
  if (shared) {
    const parsed = parseReviews(shared);
    if (parsed) return parsed;
  }

  for (const filePath of [BRUNCH_TMP, BRUNCH_CACHE]) {
    try {
      const parsed = parseReviews(await fs.readFile(filePath, "utf8"));
      if (parsed) return parsed;
    } catch {
      // continue
    }
  }
  return null;
}

export async function writeBrunchCache(reviews: Review[]): Promise<void> {
  const payload = JSON.stringify(reviews, null, 2);
  await writeSharedText(BRUNCH_NAME, payload);
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

async function loadBrunchReviews(): Promise<Review[]> {
  const cached = await readBrunchCache();
  if (cached) return cached;

  try {
    return await syncBrunchReviews();
  } catch (error) {
    console.error("Brunch sync failed", error);
    return [];
  }
}

const loadCachedBrunchReviews = unstable_cache(loadBrunchReviews, ["brunch-reviews-v1"], {
  tags: ["brunch"],
  revalidate: 86400,
});

export async function getBrunchReviews(): Promise<Review[]> {
  return loadCachedBrunchReviews();
}

/**
 * Brunch @econbook book reviews only. Posts without a 별점 are essays
 * (연간 결산, 자격증 후기, 코딩 일지 등), not reviews, and are left out.
 */
export async function getAllReviews(): Promise<Review[]> {
  const brunch = await getBrunchReviews();
  return brunch.filter((review) => review.rating !== undefined).sort(
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
