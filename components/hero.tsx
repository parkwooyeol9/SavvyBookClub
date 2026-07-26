import Link from "next/link";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__content">
        <p className="hero__brand">SavvyBookClub</p>
        <h1 className="hero__headline">다음에 읽을 책을, 더 분명하게.</h1>
        <p className="hero__lede">
          국내 베스트와 영문 원서 추천을 한곳에서. 읽는 사람을 위한 큐레이션.
        </p>
        <div className="hero__actions">
          <Link href="#bestsellers" className="btn btn--primary">
            이번 주 베스트 보기
          </Link>
          <Link href="/reviews" className="btn btn--ghost">
            개인 서평 읽기
          </Link>
        </div>
      </div>
    </section>
  );
}
