"use client";

import { useState } from "react";
import {
  placesForView,
  yeouidoChecked,
  yeouidoGuideUrl,
  yeouidoIntents,
  yeouidoKind,
  yeouidoMapHref,
  yeouidoRoutes,
  yeouidoTone,
  type YeouidoPlace,
  type YeouidoView,
} from "@/lib/yeouido";

export function YeouidoGuide() {
  const [view, setView] = useState<YeouidoView>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const places = placesForView(view);

  function selectIntent(next: Exclude<YeouidoView, "all">) {
    setView((current) => (current === next ? "all" : next));
    setOpenId(null);
  }

  async function sharePlace(place: YeouidoPlace) {
    const payload = {
      title: place.name,
      text: `${place.name}\n${place.address}`,
      url: yeouidoMapHref(place),
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
      setCopiedId(place.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="yeouido">
      <div className="yeouido__intro">
        <p className="daily-picks__eyebrow">THE YEOUIDO NEIGHBORHOOD GUIDE</p>
        <h2>오늘 여의도에서 무엇을 할까요?</h2>
        <p className="daily-picks__lede">
          목적에 맞춰 식사, 북카페, 커피, 산책, 복권 판매점을 골라 보세요.
          자료 확인 {yeouidoChecked}.
        </p>
      </div>

      <div className="yeouido-intents" role="tablist" aria-label="오늘의 목적">
        {yeouidoIntents.map((intent) => {
          const selected = view === intent.id;
          return (
            <button
              key={intent.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`yeouido-intent${selected ? " is-active" : ""}`}
              onClick={() => selectIntent(intent.id)}
            >
              <span aria-hidden>{intent.icon}</span>
              <strong>{intent.title}</strong>
              <em>{intent.hint}</em>
            </button>
          );
        })}
      </div>

      <div className="yeouido-list-head">
        <strong>
          여의도 장소 <span>{places.length}</span>
        </strong>
        <span>{view === "all" ? "전체" : "선택한 목적"}</span>
      </div>

      <div className="yeouido-list" role="tabpanel">
        {places.map((place, index) => {
          const open = openId === place.id;
          return (
            <article key={place.id} className="yeouido-card">
              <div className="yeouido-card__top">
                <span className={`yeouido-num yeouido-num--${yeouidoTone(place)}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{place.name}</h3>
                  <p className="yeouido-card__meta">
                    {place.area} · {yeouidoKind(place)}
                  </p>
                </div>
              </div>
              <p className="yeouido-card__desc">{place.desc}</p>
              {place.wins ? (
                <p className="yeouido-card__wins">
                  <span>
                    1등 <b>{place.wins.first}</b>
                  </span>
                  <span>
                    2등 <b>{place.wins.second}</b>
                  </span>
                  <small>민간 집계 · 공식 미대조</small>
                </p>
              ) : null}
              <div className="yeouido-card__tags">
                {place.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="yeouido-card__address">{place.address}</p>
              <div className="yeouido-card__actions">
                <a
                  href={yeouidoMapHref(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  지도 열기 ↗
                </a>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : place.id)}
                >
                  상세
                </button>
                <button type="button" onClick={() => sharePlace(place)}>
                  {copiedId === place.id ? "복사됨" : "공유"}
                </button>
              </div>
              {open ? (
                <div className="yeouido-card__detail">
                  <p>
                    {place.menu}
                    {place.shelf ? ` · 서가 ${place.shelf}` : ""}
                    {place.building ? ` · ${place.building}` : ""}
                  </p>
                  <p>{place.note}</p>
                  <a href={place.source} target="_blank" rel="noopener noreferrer">
                    {place.sourceName} ↗
                  </a>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {view === "lotto" ? (
        <p className="yeouido__caution">
          명당은 당첨 확률을 뜻하지 않습니다. 과거 당첨 기록은 참고 정보이며,
          공식 집계와 대조하지 않았습니다.
        </p>
      ) : null}

      <div className="yeouido-routes">
        <h3>함께 들르면 좋은 곳</h3>
        <div className="yeouido-routes__grid">
          {yeouidoRoutes.map((route, index) => (
            <article key={route.id} className="yeouido-route">
              <p>{route.eyebrow}</p>
              <h4>
                {route.title}
                <b>{String(index + 1).padStart(2, "0")}</b>
              </h4>
              <p>{route.stops.join(" → ")}</p>
            </article>
          ))}
        </div>
      </div>

      <p className="yeouido__foot">
        실시간 영업·가격·혼잡도는 제공하지 않습니다. 방문 전 매장 정보를
        확인하세요.{" "}
        <a href={yeouidoGuideUrl} target="_blank" rel="noopener noreferrer">
          지도 가이드 열기 →
        </a>
      </p>
    </div>
  );
}
