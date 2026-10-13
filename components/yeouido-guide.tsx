"use client";

import { useState } from "react";
import {
  placesForView,
  yeouidoChecked,
  yeouidoGuideUrl,
  yeouidoMapHref,
  yeouidoRoutes,
  yeouidoViews,
  type YeouidoView,
} from "@/lib/yeouido";

export function YeouidoGuide() {
  const [view, setView] = useState<YeouidoView>("book");
  const places = placesForView(view);
  const active = yeouidoViews.find((item) => item.id === view);

  return (
    <div className="yeouido">
      <div className="yeouido__intro">
        <p className="daily-picks__eyebrow">THE YEOUIDO NEIGHBORHOOD GUIDE</p>
        <p className="daily-picks__lede">
          익숙한 빌딩 사이, 아직 몰랐던 여의도. 북카페와 주요 맛집, 카페와
          산책 장소를 모았습니다. 자료 확인 {yeouidoChecked}.
        </p>
      </div>

      <div className="category-tabs" role="tablist" aria-label="여의도 명당 분류">
        {yeouidoViews.map((item) => {
          const count = placesForView(item.id).length;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              className={`category-tab${view === item.id ? " is-active" : ""}`}
              onClick={() => setView(item.id)}
            >
              {item.label} {count}
            </button>
          );
        })}
      </div>

      <div
        className="yeouido__grid"
        role="tabpanel"
        aria-label={active?.label}
      >
        {places.map((place) => (
          <article key={place.id} className="yeouido-card">
            <div className="yeouido-card__top">
              <span className="daily-pick-card__tag">
                {place.bookCafe
                  ? "북카페"
                  : place.cat === "hidden"
                    ? "숨은 맛집 후보"
                    : place.tags[0]}
              </span>
              <h3>{place.name}</h3>
              <p className="yeouido-card__where">
                {place.area} · {place.building}
              </p>
            </div>
            <p className="yeouido-card__desc">{place.desc}</p>
            <p className="yeouido-card__shelf">
              {place.menu}
              {place.shelf ? ` · 서가 ${place.shelf}` : ""}
            </p>
            <p className="yeouido-card__note">{place.note}</p>
            <div className="yeouido-card__links">
              <a href={yeouidoMapHref(place)} target="_blank" rel="noopener noreferrer">
                지도
              </a>
              <a href={place.source} target="_blank" rel="noopener noreferrer">
                {place.sourceName}
              </a>
            </div>
          </article>
        ))}
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
          {yeouidoRoutes.map((route) => (
            <article key={route.id} className="yeouido-route">
              <p>{route.eyebrow}</p>
              <h4>{route.title}</h4>
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
