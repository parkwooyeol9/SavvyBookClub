"use client";

import { useEffect, useState } from "react";
import { DailyPicks } from "@/components/daily-picks";
import { YeouidoGuide } from "@/components/yeouido-guide";
import type { DailyPick } from "@/lib/daily-picks";

type SpotlightTab = "daily" | "yeouido";

function tabFromHash(hash: string): SpotlightTab | null {
  if (hash === "#yeouido") return "yeouido";
  if (hash === "#daily-picks") return "daily";
  return null;
}

export function HomeSpotlight({ picks }: { picks: DailyPick[] }) {
  const [tab, setTab] = useState<SpotlightTab>("daily");

  useEffect(() => {
    const apply = () => {
      const next = tabFromHash(window.location.hash);
      if (next) setTab(next);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  function select(next: SpotlightTab) {
    setTab(next);
    const hash = next === "yeouido" ? "#yeouido" : "#daily-picks";
    window.history.replaceState(null, "", hash);
  }

  function onTabsKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next: SpotlightTab = tab === "daily" ? "yeouido" : "daily";
    select(next);
    const id = next === "daily" ? "tab-daily-picks" : "yeouido";
    document.getElementById(id)?.focus();
  }

  return (
    <section id="daily-picks" className="spotlight" aria-label="메인 추천">
      <div
        className="spotlight-tabs"
        role="tablist"
        aria-label="오늘의 추천과 여의도 명당"
        onKeyDown={onTabsKeyDown}
      >
        <button
          id="tab-daily-picks"
          type="button"
          role="tab"
          aria-selected={tab === "daily"}
          aria-controls="panel-daily-picks"
          tabIndex={tab === "daily" ? 0 : -1}
          className={`spotlight-tab${tab === "daily" ? " is-active" : ""}`}
          onClick={() => select("daily")}
        >
          오늘의 추천
        </button>
        <button
          id="yeouido"
          type="button"
          role="tab"
          aria-selected={tab === "yeouido"}
          aria-controls="panel-yeouido"
          tabIndex={tab === "yeouido" ? 0 : -1}
          className={`spotlight-tab${tab === "yeouido" ? " is-active" : ""}`}
          onClick={() => select("yeouido")}
        >
          여의도 명당
        </button>
      </div>

      <div
        id="panel-daily-picks"
        role="tabpanel"
        aria-labelledby="tab-daily-picks"
        hidden={tab !== "daily"}
      >
        <DailyPicks picks={picks} embedded />
      </div>
      <div
        id="panel-yeouido"
        role="tabpanel"
        aria-labelledby="yeouido"
        hidden={tab !== "yeouido"}
      >
        <YeouidoGuide />
      </div>
    </section>
  );
}
