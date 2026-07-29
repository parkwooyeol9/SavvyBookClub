import type { BookCatalog } from "@/lib/books/types";
import { pickChartBooks } from "@/lib/books/chart-periods";
import { isCatalogStale } from "@/lib/books/freshness";

function catalogBookCount(catalog: BookCatalog): number {
  const charted = [
    catalog.sections.domesticBestsellers,
    catalog.sections.yes24Bestsellers,
    catalog.sections.foreignBestsellers,
  ];
  const chartCount = charted.reduce(
    (sum, section) => sum + pickChartBooks(section, "daily").length,
    0,
  );
  return (
    chartCount +
    catalog.sections.newReleases.length +
    catalog.sections.englishBestsellers.length
  );
}

export function CatalogStatus({ catalog }: { catalog: BookCatalog }) {
  const stale = isCatalogStale(catalog.updatedAt);
  const bookCount = catalogBookCount(catalog);

  return (
    <section
      className={`catalog-status${stale ? " catalog-status--stale" : ""}`}
      aria-label="목록 갱신 상태"
    >
      <div className="catalog-status__main">
        <span className="catalog-status__dot" aria-hidden />
        <div>
          <p className="catalog-status__title">
            {stale ? "목록 갱신이 지연되고 있습니다" : "오늘의 서점·뉴스 목록이 반영되었습니다"}
          </p>
          <p className="catalog-status__meta">
            마지막 갱신 (한국시간) <strong>{catalog.updatedAtKst}</strong>
            {" · "}
            추천 도서 {bookCount}권 · 뉴스 {catalog.bookNews.length}건
            {" · "}
            매일 오전 9시 자동 업데이트
          </p>
        </div>
      </div>
      <p className="catalog-status__note">
        서평 원문{" "}
        <a
          href="https://brunch.co.kr/@econbook"
          target="_blank"
          rel="noopener noreferrer"
        >
          brunch.co.kr/@econbook
        </a>
      </p>
    </section>
  );
}
