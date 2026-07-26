import { BookRail } from "@/components/book-rail";
import { Hero } from "@/components/hero";
import { NewsRail } from "@/components/news-rail";
import { Reveal } from "@/components/reveal";
import { getBookCatalog } from "@/lib/books/cache";

/** Daily ISR; Cron at 09:00 KST also revalidates. */
export const revalidate = 86400;

export default async function HomePage() {
  const catalog = await getBookCatalog();

  return (
    <>
      <Hero />
      <div id="bestsellers" className="page-shell section-stack">
        <p className="catalog-meta">
          목록 갱신 (한국시간): {catalog.updatedAtKst} · 매일 오전 9시 자동
          업데이트
        </p>

        <Reveal>
          <NewsRail
            title="오늘의 신간·서평 뉴스"
            subtitle="한겨레·조선일보 책 섹션과 Google 뉴스에서 공개된 서평·신간 논평을 모았습니다."
            items={catalog.bookNews}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="알라딘 국내 베스트"
            subtitle="알라딘 베스트셀러 페이지를 매일 아침 크롤링합니다."
            books={catalog.sections.domesticBestsellers}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="Yes24 국내 베스트"
            subtitle="Yes24 종합 베스트셀러 HTML을 수집합니다."
            books={catalog.sections.yes24Bestsellers}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="주목할 신간"
            subtitle="알라딘 주목 신간(실패 시 Yes24 신상품) 목록입니다."
            books={catalog.sections.newReleases}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="외국도서 베스트"
            subtitle="Yes24 외국도서 베스트셀러입니다."
            books={catalog.sections.foreignBestsellers}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="영문 트렌딩"
            subtitle="Open Library 일간 트렌딩 페이지를 크롤링합니다."
            books={catalog.sections.englishBestsellers}
          />
        </Reveal>
      </div>
    </>
  );
}
