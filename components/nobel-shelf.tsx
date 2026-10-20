"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { NobelShelfView } from "@/lib/nobel";

const difficultyLabel = {
  1: "가볍게",
  2: "보통",
  3: "천천히",
} as const;

export function NobelShelf({
  shelves,
  note,
}: {
  shelves: NobelShelfView[];
  note: string;
}) {
  const [active, setActive] = useState(shelves[0]?.id ?? "literature");
  const shelf = shelves.find((item) => item.id === active) ?? shelves[0];
  if (!shelf) return null;

  return (
    <section id="nobel-shelf" className="nobel-shelf" aria-labelledby="nobel-shelf-heading">
      <div className="book-rail__heading">
        <p className="home-kmap__eyebrow">NOBEL SHELF</p>
        <h2 id="nobel-shelf-heading">노벨상 서가</h2>
        <p>{note}</p>
      </div>
      <div className="store-tabs" role="tablist" aria-label="노벨상 분야">
        {shelves.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === shelf.id}
            className={`store-tab${item.id === shelf.id ? " is-active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="nobel-shelf__track">
        {shelf.books.map((book) => {
          const inner = (
            <>
              <div className="nobel-card__cover">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={`${book.title} 표지`}
                    width={120}
                    height={180}
                    unoptimized
                  />
                ) : (
                  <span aria-hidden>{book.title.slice(0, 1)}</span>
                )}
              </div>
              <div className="nobel-card__body">
                <p className="nobel-card__meta">
                  {book.year} · {book.laureate} · {difficultyLabel[book.difficulty]}
                </p>
                <h3>{book.title}</h3>
                <p>{book.reason}</p>
                {book.bestLabel ? (
                  <span className="nobel-card__badge">
                    지금 베스트 · {book.bestLabel}
                    {book.rankDelta
                      ? book.rankDelta > 0
                        ? ` ▲${book.rankDelta}`
                        : ` ▼${Math.abs(book.rankDelta)}`
                      : ""}
                  </span>
                ) : (
                  <span className="nobel-card__quiet">차트 밖 · 서점에서 찾기</span>
                )}
              </div>
            </>
          );

          if (book.external) {
            return (
              <a
                key={book.id}
                href={book.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nobel-card"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={book.id} href={book.href} className="nobel-card">
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
