import type { Metadata } from "next";
import { NobelLaureates } from "@/components/nobel-laureates";
import { NobelShelf } from "@/components/nobel-shelf";
import { getBookCatalog } from "@/lib/books/cache";
import {
  buildEconPrizes,
  buildNobelShelves,
  econCategoryName,
  econCharts,
  econSource,
  nobelReview,
  nobelShelfNote,
} from "@/lib/nobel";

export const metadata: Metadata = {
  title: "노벨상 서가",
  description:
    "2026 노벨상 요약, 역대 노벨 경제학상 수상자 58회·101명의 이력, 시대 환경에 따른 수상 기조 변화, 분야별 읽을 책.",
};

export const revalidate = 86400;

const sections = [
  { id: "nobel-2026", label: "2026 수상" },
  { id: "nobel-shelf", label: "서가" },
  { id: "nobel-laureates", label: "역대 경제학상" },
  { id: "nobel-eras", label: "수상 기조" },
  { id: "nobel-fields", label: "분야 검토" },
];

const scoreLabel = ["", "●○○", "●●○", "●●●"];

function DecadeChart() {
  const { title, cats, series } = econCharts.decades;
  const totals = cats.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0));
  const max = Math.max(...totals);
  return (
    <figure className="nobel-chart">
      <figcaption>{title}</figcaption>
      <div className="nobel-chart__legend">
        {series.map((s) => (
          <span key={s.id}>
            <i className={`swatch swatch--${s.id}`} aria-hidden />
            {s.name}
          </span>
        ))}
      </div>
      <div className="decade-bars">
        {cats.map((label, i) => (
          <div key={label} className="decade-bars__row">
            <span className="decade-bars__label">{label}</span>
            <div
              className="decade-bars__track"
              role="img"
              aria-label={`${label}: ${series.map((s) => `${s.name} ${s.values[i]}회`).join(", ")}`}
            >
              {series.map((s) => (
                <span
                  key={s.id}
                  className={`decade-bars__seg swatch--${s.id}`}
                  style={{ width: `${(s.values[i] / max) * 100}%` }}
                >
                  {s.values[i]}
                </span>
              ))}
            </div>
            <span className="decade-bars__total">{totals[i]}회</span>
          </div>
        ))}
      </div>
      <p className="nobel-chart__note">회차 기준, 작성자 분류. 1969~79년은 11회, 2020~26년은 7회입니다.</p>
    </figure>
  );
}

function LagChart() {
  const { title, cats, values } = econCharts.lag;
  const rows = cats.map((label, i) => ({ label, value: values[i] })).sort((a, b) => b.value - a.value);
  const max = 50;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return (
    <figure className="nobel-chart">
      <figcaption>{title}</figcaption>
      <div className="lag-bars">
        {rows.map((row) => (
          <div key={row.label} className={`lag-bars__row${row.label.endsWith("2026)") ? " is-current" : ""}`}>
            <span className="lag-bars__label">{row.label}</span>
            <div className="lag-bars__track">
              <span style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <span className="lag-bars__value">{row.value}년</span>
          </div>
        ))}
      </div>
      <p className="nobel-chart__note">
        대표 논문·저서 발표 연도 기준. 진한 막대가 2026년 수상자이며 14건 평균은 {avg.toFixed(1)}년입니다.
      </p>
    </figure>
  );
}

export default async function NobelPage() {
  const catalog = await getBookCatalog();
  const shelves = buildNobelShelves(catalog);
  const prizes = buildEconPrizes(shelves);
  const people = prizes.reduce((sum, prize) => sum + prize.laureates.length, 0);
  const women = prizes.reduce((sum, prize) => sum + prize.laureates.filter((p) => p.female).length, 0);
  const review = nobelReview;

  return (
    <div className="page-shell section-stack nobel-page">
      <header className="book-rail__heading nobel-page__hero">
        <p className="home-kmap__eyebrow">NOBEL PRIZE</p>
        <h1 className="page-title">노벨상 서가</h1>
        <p>
          {review.year} 노벨상 요약, 역대 경제학상 {prizes.length}회·{people}명의 이력, 시대 환경에 따라 달라진 수상
          기조, 그리고 수상자가 직접 쓴 한국어판 도서를 한곳에 모았습니다.
        </p>
        <nav className="nobel-page__toc" aria-label="이 페이지 목차">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="nobel-2026" className="nobel-block" aria-labelledby="nobel-2026-heading">
        <div className="book-rail__heading">
          <p className="home-kmap__eyebrow">NOBEL PRIZES {review.year}</p>
          <h2 id="nobel-2026-heading">{review.year} 수상 한눈에</h2>
        </div>
        <ul className="prize-grid">
          {review.prizes.map((prize) => (
            <li key={prize.field} className={prize.field === "경제학" ? "is-econ" : undefined}>
              <p className="prize-grid__field">
                {prize.field} <span>{prize.date}</span>
              </p>
              <p className="prize-grid__names">{prize.laureates}</p>
              <p>{prize.summary}</p>
            </li>
          ))}
        </ul>
        <article className="econ-feature">
          <h3>경제학상: {review.economics.headline}</h3>
          <p className="prize-row__motivation">“{review.economics.motivation}”</p>
          {review.economics.paragraphs.map((text) => (
            <p key={text.slice(0, 16)}>{text}</p>
          ))}
          <h4>투자자가 읽을 포인트 (작성자 해석)</h4>
          <ul className="takeaways">
            {review.economics.takeaways.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <NobelShelf shelves={shelves} note={nobelShelfNote} />

      <section id="nobel-laureates" className="nobel-block" aria-labelledby="nobel-laureates-heading">
        <div className="book-rail__heading">
          <p className="home-kmap__eyebrow">ECONOMIC SCIENCES 1969–{review.year}</p>
          <h2 id="nobel-laureates-heading">역대 노벨 경제학상 수상자</h2>
          <p>
            {prizes.length}회 · {people}명(여성 {women}명). 연도를 누르면 수상자별 생몰년, 출생지, 수상 당시 소속, 이력과
            서가의 책이 열립니다. 생몰년·소속은 노벨재단 공식 API 기준입니다.
          </p>
        </div>
        <NobelLaureates prizes={prizes} categoryName={econCategoryName} />
      </section>

      <section id="nobel-eras" className="nobel-block" aria-labelledby="nobel-eras-heading">
        <div className="book-rail__heading">
          <p className="home-kmap__eyebrow">PRIZES AND THEIR TIMES</p>
          <h2 id="nobel-eras-heading">시대 환경은 어떤 사조에 상을 주게 했나</h2>
          <p>
            경제학상은 연구가 나온 시점이 아니라, 그 연구가 당대 문제를 푸는 데 쓰인 것이 확인된 시점에 주어지는 경향이
            있습니다. 위기가 질문을 만들고 20~40년 뒤 다음 위기가 답을 검증하면 수상으로 이어집니다.
          </p>
        </div>
        <div className="nobel-charts">
          <DecadeChart />
          <LagChart />
        </div>
        <ol className="era-list">
          {review.eras.map((era) => (
            <li key={era.period}>
              <p className="era-list__period">{era.period}</p>
              <h3>{era.title}</h3>
              <dl>
                <dt>시대 환경</dt>
                <dd>{era.environment}</dd>
                <dt>수상 경향</dt>
                <dd>{era.trend}</dd>
                <dt>해석</dt>
                <dd>{era.reading}</dd>
              </dl>
            </li>
          ))}
        </ol>
        <h3 className="nobel-subhead">거시 안정화 논쟁의 수상 계보</h3>
        <div className="lineage">
          {review.lineage.map((group) => (
            <div key={group.label} className="lineage__group">
              <p className="lineage__label">{group.label}</p>
              <ul>
                {group.members.map((member) => (
                  <li key={member.year}>
                    <span>{member.year}</span> {member.name}
                    <small>{member.note}</small>
                  </li>
                ))}
              </ul>
              <p className="lineage__stance">{group.stance}</p>
            </div>
          ))}
        </div>
        <h3 className="nobel-subhead">다섯 가지 패턴</h3>
        <ol className="pattern-list">
          {review.patterns.map((pattern) => (
            <li key={pattern.title}>
              <strong>{pattern.title}</strong>
              <p>{pattern.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="nobel-fields" className="nobel-block" aria-labelledby="nobel-fields-heading">
        <div className="book-rail__heading">
          <p className="home-kmap__eyebrow">BEYOND LITERATURE AND ECONOMICS</p>
          <h2 id="nobel-fields-heading">문학·경제 말고 읽을 만한 분야</h2>
          <p>{review.fieldReview.intro}</p>
        </div>
        <ul className="field-review">
          {review.fieldReview.fields.map((field) => (
            <li key={field.id}>
              <p className="field-review__head">
                <strong>{field.label}</strong>
                <span className={`field-review__verdict is-${field.score}`}>
                  {field.verdict} <span aria-hidden>{scoreLabel[field.score]}</span>
                </span>
              </p>
              <p>{field.why}</p>
              <p className="field-review__caveat">한계: {field.caveat}</p>
              <a href="#nobel-shelf">{field.shelf === "peace" ? "평화상" : "과학상"} 서가 보기 →</a>
            </li>
          ))}
        </ul>
        <p className="catalog-meta">{review.fieldReview.extra}</p>
      </section>

      <footer className="nobel-sources">
        <h2>출처</h2>
        <ul>
          {review.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p>
          {econSource}. {review.disclaimer} 최종 갱신 {review.updated}.
        </p>
      </footer>
    </div>
  );
}
