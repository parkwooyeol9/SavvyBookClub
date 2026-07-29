import type { Review } from "@/lib/books/types";

/** Prefer the on-site review detail page so users stay in SavvyBookClub. */
export function getReviewHref(review: Review): string {
  return `/reviews/${review.slug}`;
}

export function isExternalReviewHref(_review: Review): boolean {
  return false;
}
