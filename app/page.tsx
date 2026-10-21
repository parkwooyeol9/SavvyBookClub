import { HomeMode } from "@/components/home-mode";
import { HomeSpotlight } from "@/components/home-spotlight";
import { FeaturedReviews } from "@/components/featured-reviews";
import { Hero } from "@/components/hero";
import { KnowledgeMapExplorer } from "@/components/knowledge-map";
import { NewsletterCta } from "@/components/newsletter-cta";
import { NewsRail } from "@/components/news-rail";
import { NobelShelf } from "@/components/nobel-shelf";
import { Reveal } from "@/components/reveal";
import { StoreCharts } from "@/components/store-charts";
import { pickChartBooks } from "@/lib/books/chart-periods";
import { getBookCatalog } from "@/lib/books/cache";
import { isCatalogStale } from "@/lib/books/freshness";
import { ALADIN_CATEGORIES } from "@/lib/books/scrape-aladin";
import { buildDailyPicks } from "@/lib/daily-picks";
import { groupReviewsByDomain } from "@/lib/knowledge-map";
import { buildNobelShelves, nobelShelfNote } from "@/lib/nobel";
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
  const nobelShelves = buildNobelShelves(catalog);
  const bookCount = catalogBookCount(catalog);

  return (
    <HomeMode
      home={
        <>
      <Hero
        reviewCount={reviews.length}
        bookCount={bookCount}
        newsCount={catalog.bookNews.length}
        updatedAtKst={catalog.updatedAtKst}
        stale={isCatalogStale(catalog.updatedAt)}
      />
      <div id="bestsellers" className="page-shell section-stack">
        <Reveal>
          <HomeSpotlight picks={dailyPicks} />
        </Reveal>

        <Reveal>
          <NobelShelf shelves={nobelShelves} note={nobelShelfNote} moreHref="/nobel" />
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
          <StoreCharts
            aladin={catalog.sections.domesticBestsellers}
            aladinCategories={catalog.sections.categoryBestsellers}
            categories={ALADIN_CATEGORIES.filter((c) => c.id !== "all")}
            yes24={catalog.sections.yes24Bestsellers}
            foreign={catalog.sections.foreignBestsellers}
            english={catalog.sections.englishBestsellers}
            fresh={catalog.sections.newReleases}
          />
        </Reveal>

        <Reveal>
          <NewsletterCta />
        </Reveal>
      </div>
        </>
      }
    />
  );
}
