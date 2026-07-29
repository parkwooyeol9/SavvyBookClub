import Link from "next/link";

/**
 * Audience capture CTA. Wire a form/Kakao URL via env:
 * NEXT_PUBLIC_NEWSLETTER_URL or NEXT_PUBLIC_KAKAO_CHANNEL_URL
 */
export function NewsletterCta() {
  const href =
    process.env.NEXT_PUBLIC_NEWSLETTER_URL ||
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ||
    "https://brunch.co.kr/@econbook";

  const isBrunchFallback = href.includes("brunch.co.kr");

  return (
    <section className="newsletter-cta" aria-labelledby="newsletter-heading">
      <div className="newsletter-cta__inner">
        <p className="newsletter-cta__eyebrow">WEEKLY PICKS</p>
        <h2 id="newsletter-heading">주간 추천을 받아보세요</h2>
        <p>
          {isBrunchFallback
            ? "새 서평과 베스트 변화가 올라오면 브런치에서 바로 이어 읽을 수 있습니다."
            : "경제·경영 서평과 베스트 변화를 한 주에 한 번, 요약으로 받아보세요."}
        </p>
        <div className="newsletter-cta__actions">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            {isBrunchFallback ? "브런치 구독·팔로우" : "받아보기"}
          </a>
          <Link href="/reviews" className="btn btn--ghost-ink">
            서평 둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}
