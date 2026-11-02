"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatFilmValue,
  formatSignedPercent,
  marketLabel,
  trendBookNote,
  trendBooks,
  trendConcentration,
  trendFilmMeta,
  trendFilms,
  trendGrowth,
  trendKpis,
  trendMethods,
  trendReadingNote,
  trendReadingObservation,
  trendSignals,
  trendSources,
  trendStatus,
  trendTabFromHash,
  trendTabs,
  trendsObservatoryUrl,
  trendsUpdated,
  vintageLabel,
  type TrendMarket,
  type TrendTabId,
  type TrendVintage,
} from "@/lib/trends";

function openTab(id: TrendTabId) {
  const hash = trendTabs.find((tab) => tab.id === id)?.hash ?? id;
  const url = `${window.location.pathname}${window.location.search}#${hash}`;
  window.history.pushState(null, "", url);
  window.requestAnimationFrame(() => {
    document.querySelector(".trends-tabs")?.scrollIntoView({ block: "start" });
  });
}

export function TrendsScreen() {
  const [tab, setTab] = useState<TrendTabId>("glance");
  const [market, setMarket] = useState<"all" | TrendMarket>("all");
  const [filmMarket, setFilmMarket] = useState<TrendMarket>("US");
  const [selectedFilm, setSelectedFilm] = useState(0);
  const [vintage, setVintage] = useState<"all" | TrendVintage>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sync = () => {
      const next = trendTabFromHash(window.location.hash);
      if (next) setTab(next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  function selectTab(id: TrendTabId) {
    setTab(id);
    openTab(id);
  }

  const growth = trendGrowth.filter((row) => market === "all" || row.market === market);
  const films = trendFilms[filmMarket];
  const film = films[selectedFilm] ?? films[0];
  const filmMeta = trendFilmMeta[filmMarket];

  const books = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trendBooks.filter((book) => {
      if (market !== "all" && book.market !== market) return false;
      if (vintage !== "all" && book.vintage !== vintage) return false;
      if (!q) return true;
      return [book.title, book.author, book.theme, book.signal].join(" ").toLowerCase().includes(q);
    });
  }, [market, query, vintage]);

  function downloadBooks() {
    const header = ["작품", "저자", "시장", "신간구분", "발행정보", "판매신호", "분석주제"];
    const rows = books.map((book) => [
      book.title,
      book.author,
      marketLabel(book.market),
      vintageLabel(book.vintage),
      book.published,
      book.signal,
      book.theme,
    ]);
    const csv =
      "\uFEFF" +
      [header, ...rows]
        .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "culture-signals-books-2026.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="page-shell section-stack trends-page">
      <header className="book-rail__heading trends-hero">
        <p className="home-kmap__eyebrow">CULTURAL OBSERVATORY / 2026</p>
        <h1 className="page-title">올해의 트렌드 (2026년)</h1>
        <p>
          미국과 한국의 문화 소비에서 발견하는 사회 변화의 신호. 판매·흥행 데이터와 해석을 분리해, 숫자 너머의
          흐름을 살펴봅니다.
        </p>
        <p className="trends-stamp">
          자료 확인 {trendsUpdated} · 연중 잠정 집계 · 고정 스냅샷
        </p>
      </header>

      <div className="store-tabs trends-tabs" role="tablist" aria-label="올해의 트렌드 구역">
        {trendTabs.map((item) => (
          <a
            key={item.id}
            href={`#${item.hash}`}
            role="tab"
            aria-selected={tab === item.id}
            className={`store-tab${tab === item.id ? " is-active" : ""}`}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
              event.preventDefault();
              selectTab(item.id);
            }}
          >
            {item.label}
            <span className="store-tab__count">{item.hint}</span>
          </a>
        ))}
      </div>

      <div id="trends-panel" role="tabpanel" className="trends-panel">
        {tab === "glance" ? (
          <section aria-labelledby="trends-glance-heading">
            <div className="book-rail__heading">
              <p className="home-kmap__eyebrow">AT A GLANCE</p>
              <h2 id="trends-glance-heading">2026년, 네 개의 숫자</h2>
            </div>
            <ul className="trends-kpis">
              {trendKpis.map((kpi) => (
                <li key={kpi.label} className={`trends-kpi is-${kpi.tone}`}>
                  <p className="trends-kpi__label">{kpi.label}</p>
                  <p className="trends-kpi__value">{kpi.value}</p>
                  <p className="trends-kpi__note">{kpi.note}</p>
                </li>
              ))}
            </ul>
            <article className="trends-callout">
              <p className="home-kmap__eyebrow">관찰 01</p>
              <h3>{trendReadingObservation.title}</h3>
              <p>{trendReadingObservation.body}</p>
            </article>
            <ol className="trends-signals">
              {trendSignals.map((signal, index) => (
                <li key={signal.title}>
                  <p className="trends-signals__num">0{index + 1}</p>
                  <div>
                    <h3>{signal.title}</h3>
                    <p>{signal.observation}</p>
                    <p className={`trends-badge is-${signal.level}`}>{signal.strength}</p>
                    <p className="trends-signals__limit">{signal.limit}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {tab === "reading" ? (
          <section aria-labelledby="trends-reading-heading">
            <div className="book-rail__heading">
              <p className="home-kmap__eyebrow">WHERE READING MOVED</p>
              <h2 id="trends-reading-heading">독서 수요는 어디로 이동하나</h2>
              <p>분야별 종이책 판매량 변화 · 전년 동기 대비. 국가 필터는 도서 탭에도 함께 적용됩니다.</p>
            </div>
            <MarketTabs market={market} onChange={setMarket} />
            <figure className="nobel-chart">
              <figcaption>분야별 종이책 판매량 변화</figcaption>
              <div className="trends-bars">
                {growth.map((row) => (
                  <div key={`${row.market}-${row.name}`} className="trends-bars__row">
                    <span className="trends-bars__label">
                      {row.name} <small>{row.market}</small>
                    </span>
                    <div className="trends-bars__track" role="img" aria-label={`${row.name} ${formatSignedPercent(row.change)}`}>
                      <span
                        className={`trends-bars__fill${row.change < 0 ? " is-neg" : ""}${row.market === "KR" ? " is-kr" : ""}`}
                        style={{
                          left: row.change < 0 ? `${50 + row.change * 0.5}%` : "50%",
                          width: `${Math.min(50, Math.abs(row.change) * 0.5)}%`,
                        }}
                      />
                    </div>
                    <b>{formatSignedPercent(row.change)}</b>
                  </div>
                ))}
              </div>
              <p className="nobel-chart__note">{trendReadingNote}</p>
            </figure>
            <article className="trends-callout">
              <h3>{trendReadingObservation.title}</h3>
              <p>{trendReadingObservation.body}</p>
            </article>
          </section>
        ) : null}

        {tab === "cinema" ? (
          <section aria-labelledby="trends-cinema-heading">
            <div className="book-rail__heading">
              <p className="home-kmap__eyebrow">01 / CINEMA</p>
              <h2 id="trends-cinema-heading">극장은 익숙한 이야기에 반응한다</h2>
              <p>작품을 누르면 분류와 개봉일을 볼 수 있습니다. 분류는 분석용이며 흥행의 원인으로 확정한 것이 아닙니다.</p>
            </div>
            <div className="store-tabs" role="tablist" aria-label="영화 시장">
              {(
                [
                  ["US", "북미 매출"],
                  ["KR", "한국 관객"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filmMarket === id}
                  className={`store-tab${filmMarket === id ? " is-active" : ""}`}
                  onClick={() => {
                    setFilmMarket(id);
                    setSelectedFilm(0);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="trends-cinema">
              <figure className="nobel-chart">
                <figcaption>{filmMeta.title}</figcaption>
                <p className="trends-unit">{filmMeta.unit}</p>
                <div className="trends-films">
                  {films.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      className={`trends-films__row${index === selectedFilm ? " is-selected" : ""}`}
                      onClick={() => setSelectedFilm(index)}
                    >
                      <span>{item.title}</span>
                      <span className="trends-films__track" aria-hidden>
                        <i style={{ width: `${(item.value / films[0].value) * 100}%` }} />
                      </span>
                      <b>{formatFilmValue(item.value)}</b>
                    </button>
                  ))}
                </div>
                <p className="nobel-chart__note">{filmMeta.note}</p>
              </figure>
              {film ? (
                <article className="trends-film-detail">
                  <p className="home-kmap__eyebrow">{filmMarket === "US" ? "NORTH AMERICA" : "KOREA"}</p>
                  <h3>{film.title}</h3>
                  <p className="trends-film-detail__kind">{film.kind}</p>
                  <p className="trends-film-detail__value">{formatFilmValue(film.value)}</p>
                  <p>
                    {filmMarket === "US" ? "백만 달러" : "만 명"} · 2026년 현지 개봉 {film.released}
                  </p>
                  <p className="trends-signals__limit">
                    {trendsUpdated} 확인 스냅샷. 콘텐츠 유형은 분석용 분류이며 흥행의 인과적 원인으로 확정한 것이
                    아닙니다.
                  </p>
                  <a href={trendSources[filmMeta.sourceIndex].url} target="_blank" rel="noopener noreferrer">
                    원천 데이터 보기 →
                  </a>
                </article>
              ) : null}
            </div>
            <article className="trends-callout">
              <p className="home-kmap__eyebrow">MARKET CONCENTRATION</p>
              <h3>한국 극장시장, 상위 3편의 존재감</h3>
              <p className="trends-film-detail__value">{trendConcentration.total.toFixed(2)}%</p>
              <p>2026년 누적 매출 점유율 · 상위 3편 합산</p>
              <div className="trends-share" aria-hidden>
                {trendConcentration.parts.map((part) => (
                  <span key={part.label} style={{ width: `${part.share}%` }} title={`${part.label} ${part.share}%`} />
                ))}
              </div>
              <ul className="trends-share__legend">
                {trendConcentration.parts.map((part) => (
                  <li key={part.label}>
                    {part.label} {part.share.toFixed(2)}%
                  </li>
                ))}
              </ul>
              <h3>{trendConcentration.headline}</h3>
              <p>{trendConcentration.body}</p>
            </article>
          </section>
        ) : null}

        {tab === "books" ? (
          <section aria-labelledby="trends-books-heading">
            <div className="book-rail__heading">
              <p className="home-kmap__eyebrow">02 / BOOKS</p>
              <h2 id="trends-books-heading">신간과 재발견, 두 개의 흐름</h2>
              <p>선정 사례 목록 · 전체 시장 순위표가 아닙니다.</p>
            </div>
            <MarketTabs market={market} onChange={setMarket} />
            <div className="trends-book-tools">
              <label className="trends-search">
                <span className="sr-only">도서 검색</span>
                <input
                  type="search"
                  value={query}
                  placeholder="작품명·저자·주제 검색"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="store-tabs" role="tablist" aria-label="신간 구분">
                {(
                  [
                    ["all", "신간·구간 전체"],
                    ["new", "2026년 현지 신간"],
                    ["old", "이전 출간·재발견"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={vintage === id}
                    className={`store-tab${vintage === id ? " is-active" : ""}`}
                    onClick={() => setVintage(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="trends-export" onClick={downloadBooks}>
                CSV 내려받기
              </button>
            </div>
            <p className="trends-count">{books.length}개 작품</p>
            {books.length ? (
              <ul className="trends-books">
                {books.map((book) => (
                  <li key={`${book.market}-${book.title}`}>
                    <div>
                      <h3>
                        {book.href ? (
                          <a href={book.href} target="_blank" rel="noopener noreferrer">
                            {book.title}
                          </a>
                        ) : (
                          book.title
                        )}
                      </h3>
                      <p>{book.author}</p>
                    </div>
                    <p>
                      <span className={`trends-badge${book.vintage === "old" ? " is-hyp" : " is-seen"}`}>
                        {marketLabel(book.market)} · {vintageLabel(book.vintage)}
                      </span>
                      <span className="trends-books__date">{book.published}</span>
                    </p>
                    <p>{book.signal}</p>
                    <p className="trends-books__theme">{book.theme}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="trends-empty">조건에 맞는 작품이 없습니다. 검색어나 필터를 변경하세요.</p>
            )}
            <p className="nobel-chart__note">{trendBookNote}</p>
          </section>
        ) : null}

        {tab === "notes" ? (
          <section aria-labelledby="trends-notes-heading">
            <div className="book-rail__heading">
              <p className="home-kmap__eyebrow">03 / RESEARCH NOTES</p>
              <h2 id="trends-notes-heading">사회 변화로 읽기 전에</h2>
            </div>
            <ol className="trends-methods">
              {trendMethods.map((item, index) => (
                <li key={item.title}>
                  <p className="trends-signals__num">0{index + 1}</p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="trends-status">데이터 상태: {trendStatus}</p>
            <footer className="nobel-sources">
              <h2>원문 자료</h2>
              <ul>
                <li>
                  <a href={trendsObservatoryUrl} target="_blank" rel="noopener noreferrer">
                    Culture Signals · 2026 Research Edition
                  </a>
                </li>
                {trendSources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p>관찰은 명료하게, 해석은 신중하게. 최종 확인 {trendsUpdated}.</p>
            </footer>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function MarketTabs({
  market,
  onChange,
}: {
  market: "all" | TrendMarket;
  onChange: (market: "all" | TrendMarket) => void;
}) {
  return (
    <div className="store-tabs" role="tablist" aria-label="국가 필터">
      {(
        [
          ["all", "전체 시장"],
          ["US", "미국"],
          ["KR", "한국"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={market === id}
          className={`store-tab${market === id ? " is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
