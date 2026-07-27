import Link from "next/link";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__brand">SavvyBookClub</p>
        <h1 className="hero__headline">
          데이터에 기반한 경제, 경영 추천 도서 분석
        </h1>
        <div className="hero__actions">
          <Link href="#my-reviews" className="btn btn--primary">
            내 서평 보기
          </Link>
          <Link href="#bestsellers" className="btn btn--ghost">
            오늘의 베스트
          </Link>
        </div>
      </div>
    </section>
  );
}
