import Image from "next/image";
import Link from "next/link";
import type { Review } from "@/lib/books/types";
import { getReviewHref, isExternalReviewHref } from "@/lib/review-links";

function ReviewLink({
  review,
  className,
  children,
}: {
  review: Review;
  className?: string;
  children: React.ReactNode;
}) {
  const href = getReviewHref(review);
  const external = isExternalReviewHref(review);

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function FeaturedReviews({ reviews }: { reviews: Review[] }) {
  return (
    <section className="featured-reviews" id="my-reviews">
      <div className="book-rail__heading">
        <h2>브런치 서평 · 경제·경영·과학</h2>
        <p>brunch.co.kr/@econbook 원문으로 바로 연결됩니다.</p>
      </div>
      <div className="featured-grid">
        {reviews.map((review) => (
          <ReviewLink
            key={review.slug}
            review={review}
            className="featured-card"
          >
            <div className="featured-card__cover">
              {review.coverUrl ? (
                <Image
                  src={review.coverUrl}
                  alt={`${review.title} 표지`}
                  width={240}
                  height={340}
                  className="featured-card__image"
                  unoptimized
                />
              ) : (
                <div className="book-cover__placeholder">
                  {review.title.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="featured-card__body">
              <div className="featured-card__meta">
                <span>{review.year}</span>
                {typeof review.rating === "number" ? (
                  <span>★ {review.rating.toFixed(1)}</span>
                ) : null}
                {review.source === "brunch" ? <span>브런치 ↗</span> : null}
              </div>
              <h3 className="featured-card__title">{review.title}</h3>
              <p className="featured-card__why">{review.whyRead}</p>
            </div>
          </ReviewLink>
        ))}
      </div>
      <p className="featured-more">
        <Link href="/reviews">서평 전체 보기 →</Link>
        {" · "}
        <a
          href="https://brunch.co.kr/@econbook"
          target="_blank"
          rel="noopener noreferrer"
        >
          브런치 원문 →
        </a>
      </p>
    </section>
  );
}
