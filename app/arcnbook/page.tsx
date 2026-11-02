import type { Metadata } from "next";
import { ArcnbookInventory, type ArcnbookBook } from "@/components/arcnbook-inventory";
import inventory from "@/data/arcnbook/inventory.json";
import summary from "@/data/arcnbook/summary.json";

export const metadata: Metadata = {
  title: "아크앤북",
  description:
    "여의도 TP타워 지하 2층 아크앤북을 3D로 옮긴 서점 지도와 소장 도서 목록. 피난안내도로 평면을 잡고, 서가 사진에서 읽은 책을 제자리에 꽂았습니다.",
};

const TWIN_SRC = "/twins/arcnbook-yeouido.html";
const CSV_SRC = "/twins/arcnbook-yeouido-books.csv";
const FRAME_ID = "arcnbook-twin";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function ArcnbookPage() {
  const books = inventory as ArcnbookBook[];
  const categories = new Set(books.map((book) => book.cat)).size;

  return (
    <div className="page-shell arcnbook-page">
      <p className="map-page__eyebrow">ARC·N·BOOK YEOUIDO</p>
      <h1 className="page-title">아크앤북</h1>
      <p className="page-lede arcnbook-page__lede">
        여의도 TP타워 지하 2층 아크앤북을 3D로 옮겼습니다. 피난안내도로 평면을
        잡고, 서가 사진에서 읽은 책을 제자리에 꽂았습니다. 아래 목록에서 책을
        누르면 지도에서 그 서가로 이동합니다.
      </p>
      <p className="trends-stamp">
        {formatDate(summary.photoDate)} 촬영분 · 매장과 무관한 비공식 시안
      </p>

      <ul className="trends-kpis arcnbook-page__kpis">
        <li className="trends-kpi">
          <p className="trends-kpi__label">매장 면적</p>
          <p className="trends-kpi__value">{summary.areaM2.toLocaleString("ko-KR")}㎡</p>
          <p className="trends-kpi__note">피난안내도 환산 · 기사 약 320평</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">소장 도서</p>
          <p className="trends-kpi__value">{summary.books}권</p>
          <p className="trends-kpi__note">사진에서 식별한 책</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">분류</p>
          <p className="trends-kpi__value">{categories}개</p>
          <p className="trends-kpi__note">철학부터 재테크까지</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">서가</p>
          <p className="trends-kpi__value">{summary.shelves.length}면</p>
          <p className="trends-kpi__note">상단·중단 진열, 하단 서가, 평대</p>
        </li>
      </ul>

      <div className="arcnbook-frame">
        <iframe
          id={FRAME_ID}
          src={TWIN_SRC}
          title="아크앤북 여의도점 3D 서점 지도"
          className="arcnbook-frame__iframe"
          allow="fullscreen"
        />
      </div>
      <p className="arcnbook-page__hint">
        드래그로 돌리고, 휠로 확대하고, WASD로 걸어 다닐 수 있습니다.{" "}
        <a href={TWIN_SRC} target="_blank" rel="noopener noreferrer">
          전체 화면으로 열기 →
        </a>
      </p>

      <section className="arcnbook-page__section" aria-labelledby="arcnbook-books">
        <div className="arcnbook-page__head">
          <h2 id="arcnbook-books" className="arcnbook-page__h2">
            소장 도서 목록
          </h2>
          <a href={CSV_SRC} download className="arcnbook-page__csv">
            CSV 받기
          </a>
        </div>
        <ArcnbookInventory books={books} frameId={FRAME_ID} />
      </section>

      <section className="arcnbook-page__section" aria-labelledby="arcnbook-method">
        <h2 id="arcnbook-method" className="arcnbook-page__h2">
          어떻게 만들었나
        </h2>
        <ul className="arcnbook-page__list">
          <li>외곽선, 구역 경계, 공용복도, 기둥, 출입구는 매장 피난안내도를 따랐습니다.</li>
          <li>서가 사진에서 표지와 책등의 제목을 읽어 목록을 만들었습니다.</li>
          <li>서가의 매장 내 위치와 좌석·집기 배치는 추정입니다.</li>
        </ul>
      </section>
    </div>
  );
}
