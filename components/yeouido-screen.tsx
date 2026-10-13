"use client";

import { useMemo, useState } from "react";
import { SpotlightTabs } from "@/components/home-spotlight";
import { YeouidoMap } from "@/components/yeouido-map";
import {
  placesForView,
  yeouidoChecked,
  yeouidoHash,
  yeouidoIntents,
  yeouidoKind,
  yeouidoMapHref,
  yeouidoRoutes,
  yeouidoTone,
  type YeouidoPlace,
  type YeouidoView,
} from "@/lib/yeouido";

function matchesQuery(place: YeouidoPlace, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    place.name,
    place.menu,
    place.building,
    place.area,
    place.address,
    place.desc,
    ...place.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function YeouidoScreen() {
  const [view, setView] = useState<YeouidoView>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const places = useMemo(
    () => placesForView(view).filter((place) => matchesQuery(place, query)),
    [query, view],
  );

  function selectIntent(next: Exclude<YeouidoView, "all">) {
    setView((current) => (current === next ? "all" : next));
    setSelectedId(null);
    setOpenId(null);
  }

  function selectPlace(id: string) {
    setSelectedId(id);
    setOpenId(id);
    document.getElementById(`yeouido-place-${id}`)?.scrollIntoView({
      block: "nearest",
    });
  }

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}${yeouidoHash}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="yeouido-screen">
      <SpotlightTabs active="yeouido" />
      <div className="yeouido__intro">
        <p className="daily-picks__eyebrow">THE YEOUIDO NEIGHBORHOOD GUIDE</p>
        <h2>오늘 여의도에서 무엇을 할까요?</h2>
        <p className="daily-picks__lede">
          목적에 맞춰 장소를 고르고 지도에서 위치를 확인하세요. 자료 확인{" "}
          {yeouidoChecked}. 같은 건물의 핀은 겹치지 않게 조금 벌려 두었습니다.
        </p>
      </div>

      <div className="yeouido-share">
        <code>{yeouidoHash}</code>
        <button type="button" onClick={copyLink}>
          {copied ? "주소 복사됨" : "주소 복사"}
        </button>
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

      <div className="yeouido-workspace">
        <div className="yeouido-sidebar">
          <label className="yeouido-search">
            <span className="sr-only">장소 검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="가게, 메뉴, 건물 이름 검색"
            />
          </label>
          <div className="yeouido-list-head">
            <strong>
              여의도 장소 <span>{places.length}</span>
            </strong>
            <span>{view === "all" && !query ? "전체" : "골라 보는 중"}</span>
          </div>
          <div className="yeouido-list">
            {places.map((place, index) => {
              const open = openId === place.id;
              const selected = selectedId === place.id;
              return (
                <article
                  key={place.id}
                  id={`yeouido-place-${place.id}`}
                  className={`yeouido-card${selected ? " is-selected" : ""}`}
                >
                  <button
                    type="button"
                    className="yeouido-card__top"
                    onClick={() => selectPlace(place.id)}
                  >
                    <span className={`yeouido-num yeouido-num--${yeouidoTone(place)}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <h3>{place.name}</h3>
                      <p className="yeouido-card__meta">
                        {place.area} · {yeouidoKind(place)}
                      </p>
                    </span>
                  </button>
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
            {places.length === 0 ? (
              <p className="yeouido-empty">조건에 맞는 장소가 없습니다.</p>
            ) : null}
          </div>
        </div>
        <YeouidoMap
          places={places}
          selectedId={
            places.some((place) => place.id === selectedId) ? selectedId : null
          }
          onSelect={selectPlace}
        />
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
    </div>
  );
}
