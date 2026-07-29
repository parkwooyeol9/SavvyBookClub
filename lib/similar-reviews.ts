import type { Review } from "@/lib/books/types";
import { assignReviewDomain } from "@/lib/knowledge-map";

/**
 * Find reviews similar to the given one, ranked by:
 * 1. Same author (highest priority)
 * 2. Same knowledge-map domain
 * 3. Has a rating (prefer rated reviews)
 * 4. Higher rating
 */
export function getSimilarReviews(
  target: Review,
  allReviews: Review[],
  limit = 4,
): Review[] {
  const targetDomain = assignReviewDomain(target);
  const candidates = allReviews.filter((r) => r.slug !== target.slug);

  const scored = candidates.map((review) => {
    let score = 0;
    if (
      review.author === target.author &&
      review.author !== "저자 미상"
    ) {
      score += 100;
    }
    if (assignReviewDomain(review) === targetDomain) {
      score += 50;
    }
    if (typeof review.rating === "number") {
      score += 10 + review.rating;
    }
    return { review, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.review);
}
