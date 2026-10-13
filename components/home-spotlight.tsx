"use client";

import { DailyPicks } from "@/components/daily-picks";
import { yeouidoHash } from "@/lib/yeouido";
import type { DailyPick } from "@/lib/daily-picks";

export function SpotlightTabs({ active }: { active: "daily" | "yeouido" }) {
  return (
    <div
      className="spotlight-tabs"
      role="tablist"
      aria-label="오늘의 추천과 여의도 명당"
    >
      <a
        id="tab-daily-picks"
        href="#daily-picks"
        role="tab"
        aria-selected={active === "daily"}
        className={`spotlight-tab${active === "daily" ? " is-active" : ""}`}
      >
        오늘의 추천
      </a>
      <a
        id="yeoidoMyongDang"
        href={yeouidoHash}
        role="tab"
        aria-selected={active === "yeouido"}
        className={`spotlight-tab${active === "yeouido" ? " is-active" : ""}`}
      >
        여의도 명당
      </a>
    </div>
  );
}

export function HomeSpotlight({ picks }: { picks: DailyPick[] }) {
  return (
    <section id="daily-picks" className="spotlight" aria-label="메인 추천">
      <SpotlightTabs active="daily" />
      <DailyPicks picks={picks} embedded />
    </section>
  );
}
