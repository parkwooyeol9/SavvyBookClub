"use client";

import { useMemo, useState } from "react";

export type ArcnbookBook = {
  title: string;
  guess: boolean;
  cat: string;
  shelf: string;
  tier: string;
  tierName: string;
  idx: number;
  year: string;
  publisher: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s·,.:!?'"()-]/g, "");
}

/** 3D 지도 iframe에 해당 책 위치로 이동하라고 알린다. */
function focusInTwin(frameId: string, book: ArcnbookBook) {
  const frame = document.getElementById(frameId) as HTMLIFrameElement | null;
  if (!frame?.contentWindow) return;
  frame.scrollIntoView({ behavior: "smooth", block: "center" });
  frame.contentWindow.postMessage(
    { type: "arcnbook:focus", shelf: book.shelf, tier: book.tier, idx: book.idx },
    window.location.origin,
  );
}

export function ArcnbookInventory({
  books,
  frameId,
}: {
  books: ArcnbookBook[];
  frameId: string;
}) {
  const [cat, setCat] = useState("");
  const [query, setQuery] = useState("");

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const book of books) counts.set(book.cat, (counts.get(book.cat) ?? 0) + 1);
    return [...counts.entries()];
  }, [books]);

  const rows = useMemo(() => {
    const needle = normalize(query);
    return books.filter(
      (book) =>
        (!cat || book.cat === cat) && (!needle || normalize(book.title).includes(needle)),
    );
  }, [books, cat, query]);

  const hasYear = books.some((book) => book.year);

  return (
    <div className="arcnbook-inv">
      <div className="arcnbook-inv__controls">
        <input
          id="arcnbook-inv-q"
          type="search"
          className="arcnbook-inv__search"
          placeholder="제목으로 찾기"
          aria-label="소장 도서 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="arcnbook-inv__chips" role="group" aria-label="분류">
          <button
            type="button"
            className="arcnbook-inv__chip"
            aria-pressed={cat === ""}
            onClick={() => setCat("")}
          >
            전체 {books.length}
          </button>
          {cats.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className="arcnbook-inv__chip"
              aria-pressed={cat === name}
              onClick={() => setCat(name)}
            >
              {name} {count}
            </button>
          ))}
        </div>
      </div>

      <div className="arcnbook-inv__scroll">
        <table className="arcnbook-inv__table">
          <thead>
            <tr>
              <th scope="col">제목</th>
              <th scope="col">분류</th>
              <th scope="col">서가</th>
              <th scope="col">진열 위치</th>
              {hasYear ? <th scope="col">출판</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((book) => (
              <tr key={`${book.shelf}-${book.tier}-${book.idx}`}>
                <td>
                  <button
                    type="button"
                    className="arcnbook-inv__title"
                    onClick={() => focusInTwin(frameId, book)}
                  >
                    {book.title}
                  </button>
                  {book.guess ? <span className="arcnbook-inv__tag">추정</span> : null}
                </td>
                <td>{book.cat}</td>
                <td className="arcnbook-inv__shelf">{book.shelf}</td>
                <td>{book.tierName}</td>
                {hasYear ? (
                  <td>
                    {[book.publisher, book.year].filter(Boolean).join(" · ")}
                  </td>
                ) : null}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={hasYear ? 5 : 4} className="arcnbook-inv__empty">
                  찾는 책이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="arcnbook-page__note">
        {rows.length}권 표시 · 제목을 누르면 위 3D 지도에서 그 책이 꽂힌 서가로
        이동합니다. &lsquo;추정&rsquo;은 책등이 일부만 보여 제목을 추론한 책입니다.
      </p>
    </div>
  );
}
