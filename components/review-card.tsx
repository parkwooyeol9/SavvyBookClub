import Image from "next/image";
import Link from "next/link";
import type { Review } from "@/lib/books/types";
import { getReviewHref, isExternalReviewHref } from "@/lib/review-links";

export function ReviewCard({ review }: { review: Review }) {
  const href = getReviewHref(review);
  const external = isExternalReviewHref(review);
  const className = "review-card";
  const body = (
    <>
      <div className="review-card__cover">
        {review.coverUrl ? (
          <Image
            src={review.coverUrl}
            alt={`${review.title} 표지`}
            width={160}
            height={240}
            className="review-card__image"
            unoptimized
          />
        ) : null}
      </div>
      <div className="review-card__body">
        <div className="review-card__tags">
          <span>{review.year}</span>
          <span>{review.language === "en" ? "English" : "한국어"}</span>
          {typeof review.rating === "number" ? (
            <span>★ {review.rating.toFixed(1)}</span>
          ) : null}
          {review.source === "brunch" ? <span>서평</span> : null}
        </div>
        <h2 className="review-card__title">{review.title}</h2>
        <p className="review-card__author">{review.author}</p>
        <p className="review-card__excerpt">{review.whyRead || review.excerpt}</p>
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
