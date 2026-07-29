import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

function newsletterHref(): string | null {
  return (
    process.env.NEXT_PUBLIC_NEWSLETTER_URL ||
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ||
    null
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          SavvyBookClub
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const newsletter = newsletterHref();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">SavvyBookClub</p>
        <p className="site-footer__note">
          경제·경영 서평 원문:{" "}
          <a
            href="https://brunch.co.kr/@econbook"
            target="_blank"
            rel="noopener noreferrer"
          >
            brunch.co.kr/@econbook
          </a>
        </p>
        {newsletter ? (
          <p className="site-footer__note">
            <a href={newsletter} target="_blank" rel="noopener noreferrer">
              주간 추천 받아보기 →
            </a>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
