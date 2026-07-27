import type { Review } from "@/lib/books/types";

/** Brunch reviews open the original article (same behavior as the reference site). */
export function getReviewHref(review: Review): string {
  if (review.source === "brunch" && review.brunchUrl) {
    return review.brunchUrl;
  }
  return `/reviews/${review.slug}`;
}

export function isExternalReviewHref(review: Review): boolean {
  return review.source === "brunch" && Boolean(review.brunchUrl);
}
