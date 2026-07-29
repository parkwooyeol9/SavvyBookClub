import Image from "next/image";
import Link from "next/link";
import type { Review } from "@/lib/books/types";
import { getReviewHref } from "@/lib/review-links";

export function SimilarReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="similar-reviews" aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="similar-reviews__title">
        이 책이 마음에 들었다면
      </h2>
      <div className="similar-reviews__grid">
        {reviews.map((review) => (
          <Link
            key={review.slug}
            href={getReviewHref(review)}
            className="similar-card"
          >
            <div className="similar-card__cover">
              {review.coverUrl ? (
                <Image
                  src={review.coverUrl}
                  alt=""
                  width={100}
                  height={150}
                  unoptimized
                />
              ) : (
                <div className="book-cover__placeholder">
                  {review.title.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="similar-card__body">
              <h3>{review.title}</h3>
              <p className="similar-card__author">{review.author}</p>
              {typeof review.rating === "number" ? (
                <p className="similar-card__rating">
                  ★ {review.rating.toFixed(1)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
