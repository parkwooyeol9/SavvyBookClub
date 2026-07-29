import Link from "next/link";

type HeroProps = {
  reviewCount: number;
};

export function Hero({ reviewCount }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__brand">SavvyBookClub</p>
        <h1 className="hero__headline">
          데이터에 기반한 경제, 경영 추천 도서 분석
        </h1>
        <p className="hero__proof">
          데이터분석가 · 서평 {reviewCount}편 · 별점·한줄평 · 매일 09:00 베스트
          갱신
        </p>
        <div className="hero__actions">
          <Link href="/map" className="btn btn--primary">
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
