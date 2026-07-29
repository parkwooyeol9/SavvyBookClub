import { BookRail } from "@/components/book-rail";
import { FeaturedReviews } from "@/components/featured-reviews";
import { Hero } from "@/components/hero";
import { KnowledgeMapExplorer } from "@/components/knowledge-map";
import { NewsletterCta } from "@/components/newsletter-cta";
import { NewsRail } from "@/components/news-rail";
import { Reveal } from "@/components/reveal";
import { getBookCatalog } from "@/lib/books/cache";
import { groupReviewsByDomain } from "@/lib/knowledge-map";
import { getAllReviews, getFeaturedReviews } from "@/lib/reviews";

/** Daily ISR; Cron at 09:00 KST also revalidates. */
export const revalidate = 86400;

export default async function HomePage() {
  const [catalog, featured, reviews] = await Promise.all([
    getBookCatalog(),
    getFeaturedReviews(8),
    getAllReviews(),
  ]);
  const knowledgeGrouped = groupReviewsByDomain(reviews);

  return (
    <>
      <Hero reviewCount={reviews.length} />
      <div id="bestsellers" className="page-shell section-stack">
        <p className="catalog-meta">
          목록 갱신 (한국시간): {catalog.updatedAtKst} · 매일 오전 9시 자동
          업데이트 · 서평 원문{" "}
          <a
            href="https://brunch.co.kr/@econbook"
            target="_blank"
            rel="noopener noreferrer"
          >
            brunch.co.kr/@econbook
          </a>
        </p>

        <section id="knowledge-map" className="home-kmap">
          <div className="book-rail__heading">
            <p className="home-kmap__eyebrow">KNOWLEDGE MAP</p>
            <h2>지식 지도</h2>
            <p>
              지식은 목록이 아니라 구조입니다. 분야를 고르면 핵심 개념과 연결된
              서평이 함께 펼쳐집니다.
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
            items={catalog.bookNews}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="알라딘 국내 베스트"
            books={catalog.sections.domesticBestsellers}
          />
        </Reveal>

        {catalog.sections.foreignBestsellers.length > 0 ? (
          <Reveal>
            <BookRail
              title="Yes24 외국도서 베스트"
              books={catalog.sections.foreignBestsellers}
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
