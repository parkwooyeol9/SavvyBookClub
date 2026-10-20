import { DailyPicks } from "@/components/daily-picks";
import type { DailyPick } from "@/lib/daily-picks";

export function HomeSpotlight({ picks }: { picks: DailyPick[] }) {
  return (
    <section id="daily-picks" className="spotlight" aria-label="메인 추천">
      <DailyPicks picks={picks} embedded />
    </section>
  );
}
