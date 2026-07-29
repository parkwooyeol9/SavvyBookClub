import Link from "next/link";
import { formatKstDate } from "@/lib/books/freshness";

type HeroProps = {
  reviewCount: number;
  bookCount: number;
  newsCount: number;
  updatedAtKst: string;
};

export function Hero({
  reviewCount,
  bookCount,
  newsCount,
  updatedAtKst,
}: HeroProps) {
  const today = formatKstDate(new Date());

  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__brand">SavvyBookClub</p>
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
        <div className="hero__stats" aria-label="오늘의 요약">
          <div className="hero__stat">
            <span className="hero__stat-value">{reviewCount}</span>
            <span className="hero__stat-label">서평</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">{bookCount}</span>
            <span className="hero__stat-label">추천 도서</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">{newsCount}</span>
            <span className="hero__stat-label">뉴스</span>
          </div>
        </div>
        <p className="hero__updated">목록 갱신 {updatedAtKst}</p>
        <div className="hero__actions">
          <Link href="#daily-picks" className="btn btn--primary">
            오늘의 추천
          </Link>
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
