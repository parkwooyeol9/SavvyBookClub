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
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  if (yeouido) return <YeouidoScreen />;
  return home;
}
