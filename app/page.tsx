import { BookRail } from "@/components/book-rail";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { getBookCatalog } from "@/lib/books/cache";

export const revalidate = 21600;

export default async function HomePage() {
  const catalog = await getBookCatalog();
  const updated = new Date(catalog.updatedAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <Hero />
      <div id="bestsellers" className="page-shell section-stack">
        <p className="catalog-meta">목록 갱신: {updated}</p>

        <Reveal>
          <BookRail
            title="국내 베스트셀러"
            subtitle="알라딘 기준 국내 도서 베스트. 키가 없으면 미리보기 데이터를 보여줍니다."
            books={catalog.sections.domesticBestsellers}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="주목할 신간"
            subtitle="새로 나온 책 중에서 눈에 띄는 목록입니다."
            books={catalog.sections.newReleases}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="Yes24 베스트"
            subtitle="Yes24 공식 RSS로 가져온 보조 베스트 피드입니다."
            books={catalog.sections.yes24Bestsellers}
          />
        </Reveal>

        <Reveal>
          <BookRail
            title="외서 · 영문 베스트"
            subtitle="알라딘 외서와 NYT/Open Library 영문 베스트를 함께 모았습니다."
            books={[
              ...catalog.sections.foreignBestsellers.slice(0, 6),
              ...catalog.sections.englishBestsellers.slice(0, 6),
            ]}
          />
        </Reveal>
      </div>
    </>
  );
}
