import Image from "next/image";
import Link from "next/link";
import type { Review } from "@/lib/books/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Link href={`/reviews/${review.slug}`} className="review-card">
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
          {review.isOriginalEnglish ? <span>원서</span> : null}
        </div>
        <h2 className="review-card__title">{review.title}</h2>
        <p className="review-card__author">{review.author}</p>
        <p className="review-card__excerpt">{review.excerpt}</p>
      </div>
    </Link>
  );
}
