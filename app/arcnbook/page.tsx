import type { Metadata } from "next";
import summary from "@/data/arcnbook/summary.json";

export const metadata: Metadata = {
  title: "아크앤북",
  description:
    "여의도 TP타워 지하 2층 아크앤북을 3D로 옮긴 서점 지도. 피난안내도로 평면을 잡고, 서가 사진에서 읽은 책을 제자리에 꽂았습니다.",
};

const TWIN_SRC = "/twins/arcnbook-yeouido.html";
const CSV_SRC = "/twins/arcnbook-yeouido-books.csv";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function ArcnbookPage() {
  const guess = summary.books - summary.sure;

  return (
    <div className="page-shell arcnbook-page">
      <p className="map-page__eyebrow">ARC·N·BOOK YEOUIDO</p>
      <h1 className="page-title">아크앤북</h1>
      <p className="page-lede arcnbook-page__lede">
        여의도 TP타워 지하 2층 아크앤북을 3D로 옮겼습니다. 피난안내도로 평면을
        잡고, 서가 사진에서 읽은 책을 제자리에 꽂았습니다. 책을 누르면 어느
        서가 몇 번째 단에 있는지 보입니다.
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
          <p className="trends-kpi__label">판독한 서가</p>
          <p className="trends-kpi__value">{summary.shelves.length}면</p>
          <p className="trends-kpi__note">나머지 서가는 자리만 표시</p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">판독한 책</p>
          <p className="trends-kpi__value">{summary.books}권</p>
          <p className="trends-kpi__note">
            확실 {summary.sure} · 추정 {guess}
          </p>
        </li>
        <li className="trends-kpi">
          <p className="trends-kpi__label">출판연도 확인</p>
          <p className="trends-kpi__value">{summary.matched}권</p>
          <p className="trends-kpi__note">알라딘 서지 매칭 결과</p>
        </li>
      </ul>

      <div className="arcnbook-frame">
        <iframe
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

      <section className="arcnbook-page__section" aria-labelledby="arcnbook-shelves">
        <h2 id="arcnbook-shelves" className="arcnbook-page__h2">
          판독한 서가
        </h2>
        <ul className="arcnbook-shelves">
          {summary.shelves.map((shelf) => (
            <li key={shelf.id} className="arcnbook-shelves__item">
              <span className="arcnbook-shelves__id">{shelf.id}</span>
              <span>{shelf.cat}</span>
              <span className="arcnbook-shelves__count">{shelf.count}권</span>
            </li>
          ))}
        </ul>
        <p className="arcnbook-page__note">
          <a href={CSV_SRC} download>
            도서 목록 CSV 받기
          </a>{" "}
          · 서가 ID, 분류, 단, 제목, 판독 신뢰도가 들어 있습니다.
        </p>
      </section>

      <section className="arcnbook-page__section" aria-labelledby="arcnbook-method">
        <h2 id="arcnbook-method" className="arcnbook-page__h2">
          어떻게 만들었나
        </h2>
        <ul className="arcnbook-page__list">
          <li>외곽선, 구역 경계, 공용복도, 기둥, 출입구는 매장 피난안내도를 따랐습니다.</li>
          <li>
            표지가 보이는 책은 거의 다 읽었고, 책등만 보이는 책은 일부가
            &lsquo;추정&rsquo;입니다. 읽지 못한 책등은 목록에서 뺐습니다.
          </li>
          <li>
            사진 서가의 매장 내 위치, 구역 안 서가 개수와 좌석 배치는 아직
            가정입니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
