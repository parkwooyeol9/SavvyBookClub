import Image from "next/image";
import Link from "next/link";
import { withAffiliateParams } from "@/lib/books/affiliate";
import { formatKstDate } from "@/lib/books/freshness";
import type { DailyPick } from "@/lib/daily-picks";
import { getReviewHref } from "@/lib/review-links";

export function DailyPicks({ picks }: { picks: DailyPick[] }) {
  const today = formatKstDate(new Date());

  return (
    <section className="daily-picks" aria-labelledby="daily-picks-heading">
      <div className="daily-picks__header">
        <div>
          <p className="daily-picks__eyebrow">TODAY&apos;S PICKS</p>
          <h2 id="daily-picks-heading">오늘의 추천 {picks.length}선</h2>
          <p className="daily-picks__lede">
            {today} 기준 — 알라딘·Yes24·신간·서평에서 매일 다른 조합을 보여줍니다.
          </p>
        </div>
      </div>

      <div className="daily-picks__grid">
        {picks.map((pick, index) => {
          if (pick.kind === "book") {
            const href = withAffiliateParams(pick.book.link, pick.book.source);
            return (
              <a
                key={`book-${pick.book.id}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="daily-pick-card"
              >
                <span className="daily-pick-card__rank">{index + 1}</span>
                <div className="daily-pick-card__cover">
                  {pick.book.coverUrl ? (
                    <Image
                      src={pick.book.coverUrl}
                      alt={`${pick.book.title} 표지`}
                      width={120}
                      height={180}
                      unoptimized
                    />
                  ) : (
                    <div className="book-cover__placeholder">{pick.book.title.slice(0, 1)}</div>
                  )}
                </div>
                <div className="daily-pick-card__body">
                  <span className="daily-pick-card__tag">{pick.label}</span>
                  <h3>{pick.book.title}</h3>
                  <p>{pick.book.author}</p>
                </div>
              </a>
            );
          }

          const review = pick.review;
          return (
            <Link
              key={`review-${review.slug}`}
              href={getReviewHref(review)}
              className="daily-pick-card daily-pick-card--review"
            >
              <span className="daily-pick-card__rank">{index + 1}</span>
              <div className="daily-pick-card__cover">
                {review.coverUrl ? (
                  <Image
                    src={review.coverUrl}
                    alt={`${review.title} 표지`}
                    width={120}
                    height={180}
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="daily-pick-card__body">
                <span className="daily-pick-card__tag">{pick.label}</span>
                <h3>{review.title}</h3>
                <p>
                  {review.author}
                  {typeof review.rating === "number"
                    ? ` · ★ ${review.rating.toFixed(1)}`
                    : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
