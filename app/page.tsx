import { ChartBookRail } from "@/components/chart-book-rail";
import { CatalogStatus } from "@/components/catalog-status";
import { DailyPicks } from "@/components/daily-picks";
import { FeaturedReviews } from "@/components/featured-reviews";
import { Hero } from "@/components/hero";
import { KnowledgeMapExplorer } from "@/components/knowledge-map";
import { NewsletterCta } from "@/components/newsletter-cta";
import { NewsRail } from "@/components/news-rail";
import { BookRail } from "@/components/book-rail";
import { Reveal } from "@/components/reveal";
import { pickChartBooks } from "@/lib/books/chart-periods";
import { getBookCatalog } from "@/lib/books/cache";
import { buildDailyPicks } from "@/lib/daily-picks";
import { groupReviewsByDomain } from "@/lib/knowledge-map";
import { getAllReviews, getFeaturedReviews } from "@/lib/reviews";

/** Daily ISR; Cron at 09:00 KST also revalidates. */
export const revalidate = 86400;

function catalogBookCount(
  catalog: Awaited<ReturnType<typeof getBookCatalog>>,
): number {
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

export default async function HomePage() {
  const [catalog, featured, reviews] = await Promise.all([
    getBookCatalog(),
    getFeaturedReviews(8),
    getAllReviews(),
  ]);
  const knowledgeGrouped = groupReviewsByDomain(reviews);
  const dailyPicks = buildDailyPicks(catalog, reviews, 6);
  const bookCount = catalogBookCount(catalog);

  return (
    <>
      <Hero
        reviewCount={reviews.length}
        bookCount={bookCount}
        newsCount={catalog.bookNews.length}
        updatedAtKst={catalog.updatedAtKst}
      />
      <div id="bestsellers" className="page-shell section-stack">
        <CatalogStatus catalog={catalog} />

        <Reveal>
          <section id="daily-picks">
            <DailyPicks picks={dailyPicks} />
          </section>
        </Reveal>

        <section id="knowledge-map" className="home-kmap">
          <div className="book-rail__heading">
            <p className="home-kmap__eyebrow">KNOWLEDGE MAP</p>
            <h2>지식 지도</h2>
            <p>
              4개 분야로 서평을 묶어 보세요. 분야 카드를 누르면 연결된 책이
              아래에 펼쳐집니다.
            </p>
          </div>
          <KnowledgeMapExplorer grouped={knowledgeGrouped} />
        </section>

        <Reveal>
          <FeaturedReviews reviews={featured} />
        </Reveal>

        <Reveal>
          <NewsRail
            title="오늘의 신간·서평 뉴스"
            subtitle={`${catalog.updatedAtKst} 기준`}
            items={catalog.bookNews}
          />
        </Reveal>

        <Reveal>
          <ChartBookRail
            title="알라딘 국내 베스트"
            subtitle="일간·주간·월간 차트 전환"
            charted={catalog.sections.domesticBestsellers}
            defaultPeriod="daily"
          />
        </Reveal>

        <Reveal>
          <ChartBookRail
            title="Yes24 국내 베스트"
            subtitle="알라딘과 다른 순위도 함께"
            charted={catalog.sections.yes24Bestsellers}
            defaultPeriod="daily"
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="주목할 신간"
            subtitle="알라딘·Yes24 신간"
            books={catalog.sections.newReleases}
          />
        </Reveal>

        {pickChartBooks(catalog.sections.foreignBestsellers, "weekly").length >
        0 ? (
          <Reveal>
            <ChartBookRail
              title="Yes24 외국도서 베스트"
              charted={catalog.sections.foreignBestsellers}
              defaultPeriod="weekly"
            />
          </Reveal>
        ) : null}

        <Reveal>
          <BookRail
            title="영문 트렌딩 · 경제·경영·논픽션"
            books={catalog.sections.englishBestsellers}
            limit={6}
          />
        </Reveal>

        <Reveal>
          <NewsletterCta />
        </Reveal>
      </div>
    </>
  );
}
