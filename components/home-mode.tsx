"use client";

import { useEffect, useState, type ReactNode } from "react";
import { YeouidoScreen } from "@/components/yeouido-screen";
import { isYeouidoHash } from "@/lib/yeouido";

export function HomeMode({ home }: { home: ReactNode }) {
  const [yeouido, setYeouido] = useState(false);

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash;
      if (hash === "#yeouido" || hash === "#yeoido") {
        window.history.replaceState(null, "", "#yeoidoMyongDang");
      }
      const active = isYeouidoHash(window.location.hash);
      setYeouido(active);
      if (active) window.scrollTo(0, 0);
    };
    apply();
    window.addEventListener("hashchange", apply);
    // Same-page hash links sometimes update the URL without a hashchange event.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      const href = link?.getAttribute("href") ?? "";
      if (!href.includes("#")) return;
      window.setTimeout(apply, 0);
    };
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", apply);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (yeouido) return <YeouidoScreen />;
  return home;
}
