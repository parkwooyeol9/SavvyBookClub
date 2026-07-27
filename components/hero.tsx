import Link from "next/link";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__brand">SavvyBookClub</p>
        <h1 className="hero__headline">경제·경영 책을, 데이터로 고르다.</h1>
        <p className="hero__lede">
          브런치 @econbook 서평과 국내·해외 베스트를 한곳에서. 다음에 읽을 책을 더
          분명하게.
        </p>
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
