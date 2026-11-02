"use client";

import { useEffect, useMemo, useState } from "react";

/** brighton-data.json의 books 한 행: [제목, 저자, 발행자, 발행연도, 청구기호, 서가, 단, x, 두께, 높이, KDC 주류] */
type BookRow = [string, string, string, string, string, number, number, number, number, number, number];

type TwinData = {
  rooms: { name: string }[];
  faces: [number, number, number, number, string][];
  kdcNames: string[];
  books: BookRow[];
};

const PAGE_SIZE = 50;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s·,.:!?'"()-]/g, "");
}

function focusInTwin(frameId: string, index: number) {
  const frame = document.getElementById(frameId) as HTMLIFrameElement | null;
  if (!frame?.contentWindow) return;
  frame.scrollIntoView({ behavior: "smooth", block: "center" });
  frame.contentWindow.postMessage({ type: "brighton:focus", i: index }, window.location.origin);
}

export function BrightonCatalog({ dataSrc, frameId }: { dataSrc: string; frameId: string }) {
  const [data, setData] = useState<TwinData | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [room, setRoom] = useState(-1);
  const [kdc, setKdc] = useState(-1);
  const [sort, setSort] = useState<"call" | "new">("call");
  const [page, setPage] = useState(0);

  /** 거르는 조건이 바뀌면 첫 쪽으로 돌아간다. */
  function refilter<T>(set: (value: T) => void) {
    return (value: T) => {
      set(value);
      setPage(0);
    };
  }

  useEffect(() => {
    let alive = true;
    fetch(dataSrc)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((json: TwinData) => alive && setData(json))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [dataSrc]);

  const index = useMemo(
    () => data?.books.map((book) => normalize(`${book[0]} ${book[1]}`)) ?? [],
    [data],
  );

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = normalize(query);
    const out: number[] = [];
    data.books.forEach((book, i) => {
      if (room >= 0 && data.faces[book[5]]?.[3] !== room) return;
      if (kdc >= 0 && book[10] !== kdc) return;
      if (needle.length >= 2 && !index[i].includes(needle)) return;
      out.push(i);
    });
    if (sort === "new") out.sort((a, b) => (data.books[b][3] || "0").localeCompare(data.books[a][3] || "0"));
    return out;
  }, [data, index, query, room, kdc, sort]);

  if (failed) return <p className="arcnbook-page__note">소장 도서 목록을 불러오지 못했습니다. 새로고침해 주세요.</p>;
  if (!data) return <p className="arcnbook-page__note">소장 도서 목록을 불러오는 중…</p>;

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="arcnbook-inv">
      <div className="arcnbook-inv__controls">
        <div className="brighton-cat__bar">
          <input
            id="brighton-q"
            type="search"
            className="arcnbook-inv__search"
            placeholder="제목·저자로 찾기"
            aria-label="소장 도서 검색"
            value={query}
            onChange={(event) => refilter(setQuery)(event.target.value)}
          />
          <select
            id="brighton-sort"
            className="brighton-cat__select"
            aria-label="정렬"
            value={sort}
            onChange={(event) => refilter(setSort)(event.target.value as "call" | "new")}
          >
            <option value="call">서가 순(청구기호)</option>
            <option value="new">최신 출판순</option>
          </select>
        </div>
        <div className="arcnbook-inv__chips" role="group" aria-label="자료실">
          <button type="button" className="arcnbook-inv__chip" aria-pressed={room < 0} onClick={() => refilter(setRoom)(-1)}>
            전체 자료실
          </button>
          {data.rooms.map((r, i) => (
            <button key={r.name} type="button" className="arcnbook-inv__chip" aria-pressed={room === i} onClick={() => refilter(setRoom)(i)}>
              {r.name}
            </button>
          ))}
        </div>
        <div className="arcnbook-inv__chips" role="group" aria-label="주제">
          <button type="button" className="arcnbook-inv__chip" aria-pressed={kdc < 0} onClick={() => refilter(setKdc)(-1)}>
            전체 주제
          </button>
          {data.kdcNames.map((name, i) => (
            <button key={name} type="button" className="arcnbook-inv__chip" aria-pressed={kdc === i} onClick={() => refilter(setKdc)(i)}>
              {i} {name}
            </button>
          ))}
        </div>
      </div>

      <div className="arcnbook-inv__scroll">
        <table className="arcnbook-inv__table brighton-cat__table">
          <thead>
            <tr>
              <th scope="col">제목</th>
              <th scope="col">저자</th>
              <th scope="col">발행자</th>
              <th scope="col">연도</th>
              <th scope="col">청구기호</th>
              <th scope="col">자료실</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((i) => {
              const book = data.books[i];
              return (
                <tr key={i}>
                  <td>
                    <button type="button" className="arcnbook-inv__title" onClick={() => focusInTwin(frameId, i)}>
                      {book[0]}
                    </button>
                  </td>
                  <td>{book[1]}</td>
                  <td>{book[2]}</td>
                  <td className="brighton-cat__num">{book[3]}</td>
                  <td className="brighton-cat__call">{book[4]}</td>
                  <td>{data.rooms[data.faces[book[5]]?.[3]]?.name}</td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="arcnbook-inv__empty">
                  찾는 책이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="brighton-cat__pager">
        <span className="arcnbook-page__note">
          {rows.length.toLocaleString("ko-KR")}권 중 {(page * PAGE_SIZE + (visible.length ? 1 : 0)).toLocaleString("ko-KR")}–
          {(page * PAGE_SIZE + visible.length).toLocaleString("ko-KR")}
        </span>
        <div className="brighton-cat__pages">
          <button type="button" className="arcnbook-inv__chip" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            이전
          </button>
          <span className="brighton-cat__num">
            {page + 1} / {pages}
          </span>
          <button type="button" className="arcnbook-inv__chip" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
            다음
          </button>
        </div>
      </div>
      <p className="arcnbook-page__note">제목을 누르면 위 3D 지도에서 그 책이 꽂힌 서가로 이동합니다.</p>
    </div>
  );
}
