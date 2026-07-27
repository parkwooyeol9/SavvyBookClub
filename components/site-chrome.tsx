import Link from "next/link";

const links = [
  { href: "/", label: "홈" },
  { href: "/reviews", label: "서평" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          SavvyBookClub
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav__link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
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
      </div>
    </footer>
  );
}
