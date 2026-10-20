import Link from "next/link";
import { formatKstDate } from "@/lib/books/freshness";

type HeroProps = {
  reviewCount: number;
  bookCount: number;
  newsCount: number;
  updatedAtKst: string;
  stale: boolean;
};

/** Compact hero: today's picks sit right below, so keep the first screen short. */
export function Hero({
  reviewCount,
  bookCount,
  newsCount,
  updatedAtKst,
  stale,
}: HeroProps) {
  const today = formatKstDate(new Date());

  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__date">{today}</p>
        <h1 className="hero__headline">
          오늘 읽을 경제·경영·과학 책을
          <br />
          데이터로 고르는 북클럽
        </h1>
        <p className="hero__proof">
          데이터분석가 큐레이션 · 서평 {reviewCount}편 · 서점 목록 {bookCount}권
          · 뉴스 {newsCount}건
        </p>
        <p className={`hero__updated${stale ? " hero__updated--stale" : ""}`}>
          <span className="hero__updated-dot" aria-hidden />
          {stale ? "목록 갱신 지연 · 마지막 " : "목록 갱신 "}
          {updatedAtKst} · 매일 오전 9시
        </p>
        <div className="hero__actions">
          <a href="#daily-picks" className="btn btn--primary">
            오늘의 추천
          </a>
          <a href="#yeoidoMyongDang" className="btn btn--ghost">
            여의도 명당
          </a>
          <Link href="/map" className="btn btn--ghost">
            지식 지도
          </Link>
          <Link href="#my-reviews" className="btn btn--ghost">
            서평 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
