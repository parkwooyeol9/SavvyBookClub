"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EconCategory, EconPrizeView } from "@/lib/nobel";

const ERAS = [
  { id: "all", label: "전체", from: 0, to: 9999 },
  { id: "1970s", label: "1969~79", from: 1969, to: 1979 },
  { id: "1980s", label: "1980년대", from: 1980, to: 1989 },
  { id: "1990s", label: "1990년대", from: 1990, to: 1999 },
  { id: "2000s", label: "2000년대", from: 2000, to: 2009 },
  { id: "2010s", label: "2010년대", from: 2010, to: 2019 },
  { id: "2020s", label: "2020~", from: 2020, to: 9999 },
] as const;

function lifespan(born: string, died: string | null): string {
  return died ? `${born}–${died}` : `${born}–`;
}

export function NobelLaureates({
  prizes,
  categoryName,
}: {
  prizes: EconPrizeView[];
  categoryName: Record<EconCategory, string>;
}) {
  const [cat, setCat] = useState<EconCategory | "all">("all");
  const [era, setEra] = useState<(typeof ERAS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(prizes.at(-1)?.year ?? null);

  const shown = useMemo(() => {
    const range = ERAS.find((item) => item.id === era) ?? ERAS[0];
    const needle = query.trim().toLowerCase();
    return prizes
      .filter((prize) => cat === "all" || prize.cat === cat)
      .filter((prize) => prize.year >= range.from && prize.year <= range.to)
      .filter((prize) => {
        if (!needle) return true;
        const text = [
          prize.year,
          prize.field,
          prize.motivation,
          ...prize.laureates.flatMap((person) => [person.ko, person.en, person.bio]),
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(needle);
      })
      .slice()
      .reverse();
  }, [prizes, cat, era, query]);

  const people = shown.reduce((sum, prize) => sum + prize.laureates.length, 0);

  return (
    <div className="laureates">
      <div className="laureates__controls">
        <input
          type="search"
          className="laureates__search"
          placeholder="이름·분야 검색 (예: 게임, 프리드먼, Nash)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="수상자 검색"
        />
        <div className="store-tabs" role="group" aria-label="분류">
          {(["all", "A", "B", "C"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={cat === id}
              className={`store-tab${cat === id ? " is-active" : ""}`}
              onClick={() => setCat(id)}
            >
              {id === "all" ? "전 분야" : categoryName[id]}
            </button>
          ))}
        </div>
        <div className="store-tabs" role="group" aria-label="시대">
          {ERAS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={era === item.id}
              className={`store-tab${era === item.id ? " is-active" : ""}`}
              onClick={() => setEra(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="catalog-meta">
        {shown.length}회 · {people}명
      </p>
      <ol className="laureates__list">
        {shown.map((prize) => {
          const expanded = open === prize.year;
          return (
            <li key={prize.year} className={`prize-row prize-row--${prize.cat}`}>
              <button
                type="button"
                className="prize-row__head"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : prize.year)}
              >
                <span className="prize-row__year">{prize.year}</span>
                <span className="prize-row__names">
                  {prize.laureates.map((person) => person.ko).join(" · ")}
                  <small>{prize.field}</small>
                </span>
                <span className="prize-row__cat">{categoryName[prize.cat]}</span>
              </button>
              {expanded ? (
                <div className="prize-row__body">
                  <p className="prize-row__motivation">“{prize.motivation}”</p>
                  <ul className="prize-people">
                    {prize.laureates.map((person) => (
                      <li key={person.en}>
                        <p className="prize-people__name">
                          <strong>{person.ko}</strong> {person.en}
                          {person.female ? <span className="prize-people__tag">여성</span> : null}
                        </p>
                        <p className="prize-people__meta">
                          {lifespan(person.born, person.died)} · {person.birthCountry} 출생 · 수상 당시{" "}
                          {person.affiliation.length > 0 ? person.affiliation.join(", ") : "소속 없음"} · 상금 {person.portion}
                        </p>
                        <p>{person.bio}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="prize-row__links">
                    {prize.books.map((book) =>
                      book.external ? (
                        <a key={book.title} href={book.href} target="_blank" rel="noopener noreferrer">
                          『{book.title}』
                        </a>
                      ) : (
                        <Link key={book.title} href={book.href}>
                          『{book.title}』
                        </Link>
                      ),
                    )}
                    <a href={prize.laureates[0].url} target="_blank" rel="noopener noreferrer">
                      NobelPrize.org ↗
                    </a>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {shown.length === 0 ? <p className="empty-state">조건에 맞는 수상이 없습니다.</p> : null}
    </div>
  );
}
