"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

const links = [
  { href: "/", label: "홈" },
  { href: "/map", label: "지식 지도" },
  { href: "/reviews", label: "서평" },
  { href: "/about", label: "소개" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="site-nav site-nav--desktop" aria-label="주요 메뉴">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="site-nav__link">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="site-nav-mobile">
        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "닫기" : "메뉴"}
        </button>
        {open ? (
          <nav id={panelId} className="site-nav-drawer" aria-label="모바일 메뉴">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-nav-drawer__link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </>
  );
}
