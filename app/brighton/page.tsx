import type { Metadata } from "next";
import { BrightonCatalog } from "@/components/brighton-catalog";
import summary from "@/data/brighton/summary.json";

export const metadata: Metadata = {
  title: "브라이튼도서관",
  description:
    "영등포구립 여의도브라이튼도서관을 3D로 옮긴 도서관 지도와 소장 도서 목록. 공식 층별안내도로 평면을 잡고, 소장 자료를 청구기호 순서대로 서가에 꽂았습니다.",
};

const TWIN_SRC = "/twins/brighton.html";
const DATA_SRC = "/twins/brighton-data.json";
const CSV_SRC = "/twins/brighton-books.csv";
const FRAME_ID = "brighton-twin";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function BrightonPage() {
  return (
    <div className="page-shell arcnbook-page">
      <p className="map-page__eyebrow">YEOUIDO BRIGHTON LIBRARY</p>
      <h1 className="page-title">브라이튼도서관</h1>
      <p className="page-lede arcnbook-page__lede">
        여의도 브라이튼 아파트 지하 1층의 영등포구립 도서관을 3D로 옮겼습니다.
        도서관 층별안내도로 평면을 잡고, 소장 도서를 자료실별 청구기호 순서대로
        서가에 꽂았습니다. 아래 목록에서 책을 누르면 지도에서 그 서가로
        이동합니다.
      </p>
      <p className="trends-stamp">
        {formatDate(summary.collectedAt)} 도서관 자료검색 기준 · 2026년 4월 개관
      </p>

      <ul className="trends-kpis arcnbook-page__kpis">
        <li className="trends-kpi">
          <p className="trends-kpi__label">면적</p>
          <p className="trends-kpi__value">{Math.round(summary.areaM2).toLocaleString("ko-KR")}㎡</p>
          <p className="trends-kpi__note">지하 1층 단일 층</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">소장 도서</p>
          <p className="trends-kpi__value">{summary.books.toLocaleString("ko-KR")}권</p>
          <p className="trends-kpi__note">
            도서관 공시 {summary.officialBooks.toLocaleString("ko-KR")}권
          </p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">자료실</p>
          <p className="trends-kpi__value">{summary.rooms.length}곳</p>
          <p className="trends-kpi__note">일반·영어·어린이·컬렉션</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">좌석</p>
          <p className="trends-kpi__value">{summary.seats}석</p>
          <p className="trends-kpi__note">키즈카페·북카페 별도</p>
        </li>
      </ul>

      <div className="arcnbook-frame">
        <iframe
          id={FRAME_ID}
          src={TWIN_SRC}
          title="여의도브라이튼도서관 3D 도서관 지도"
          className="arcnbook-frame__iframe"
          allow="fullscreen"
        />
      </div>
      <p className="arcnbook-page__hint">
        드래그로 돌리고, 휠로 확대하고, WASD로 걸어 다닐 수 있습니다. 색상은
        주제·출판연도·자료실로 바꿔 볼 수 있습니다.{" "}
        <a href={TWIN_SRC} target="_blank" rel="noopener noreferrer">
          전체 화면으로 열기 →
        </a>
      </p>

      <section className="arcnbook-page__section" aria-labelledby="brighton-books">
        <div className="arcnbook-page__head">
          <h2 id="brighton-books" className="arcnbook-page__h2">
            소장 도서 목록
          </h2>
          <a href={CSV_SRC} download className="arcnbook-page__csv">
            CSV 받기
          </a>
        </div>
        <BrightonCatalog dataSrc={DATA_SRC} frameId={FRAME_ID} />
      </section>

      <section className="arcnbook-page__section" aria-labelledby="brighton-method">
        <h2 id="brighton-method" className="arcnbook-page__h2">
          어떻게 만들었나
        </h2>
        <ul className="arcnbook-page__list">
          <li>평면은 도서관 홈페이지 층별안내도를 공식 면적 3,488㎡에 맞춰 환산했습니다.</li>
          <li>소장 도서는 영등포구립도서관 자료검색에서 브라이튼 소장분만 모았습니다.</li>
          <li>서가 개수와 배열은 자료실별 소장 권수에 맞춘 추정입니다. 책은 청구기호 순서로 꽂았습니다.</li>
        </ul>
      </section>
    </div>
  );
}
