import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/book-rail";
import { withAffiliateParams } from "@/lib/books/affiliate";
import { getBookCatalog } from "@/lib/books/cache";
import { findBookGroup, relatedBooks } from "@/lib/books/catalog-index";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;
export const dynamicParams = true;

const periodLabel = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getBookCatalog();
  const group = findBookGroup(catalog, slug);
  if (!group) return { title: "도서" };

  const description = `${group.book.author} · ${group.book.title}`;
  return {
    title: group.book.title,
    description,
    openGraph: {
      title: group.book.title,
      description,
      url: `${getSiteUrl()}/books/${slug}`,
      images: group.book.coverUrl ? [{ url: group.book.coverUrl }] : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getBookCatalog();
  const group = findBookGroup(catalog, slug);
  if (!group) notFound();

  const { book, placements } = group;
  const storeUrl = withAffiliateParams(book.link, book.source);
  const related = relatedBooks(catalog, book);
  const delta = book.rankDelta;

  return (
    <div className="page-shell">
      <Link href="/#store-charts" className="catalog-meta">
        ← 서점 차트
      </Link>
      <article className="review-detail">
        <div className="review-detail__cover">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`${book.title} 표지`}
              width={440}
              height={660}
              unoptimized
            />
          ) : null}
        </div>
        <div>
          <p className="catalog-meta">
            {book.author}
            {book.publisher ? ` · ${book.publisher}` : ""}
            {book.language === "en" ? " · English" : " · 한국어"}
          </p>
          <h1 className="page-title">{book.title}</h1>
          <p className="page-lede">
            {book.rank ? `서점 순위 ${book.rank}위` : "서점 목록"}
            {delta ? (delta > 0 ? ` · 전일 대비 ▲${delta}` : ` · 전일 대비 ▼${Math.abs(delta)}`) : ""}
          </p>
          <p className="review-detail__why">
            순위는 걸러낸 뒤 다시 붙인 번호가 아니라 서점 페이지의 원래 자리입니다.
            같은 책이 여러 차트에 있으면 아래에 함께 모았습니다.
          </p>
          {placements.length > 0 ? (
            <ul className="book-placements">
              {placements.map((hit) => (
                <li key={`${hit.section}-${hit.period ?? "list"}-${hit.book.rank ?? "x"}`}>
                  {hit.sectionLabel}
                  {hit.period ? ` ${periodLabel[hit.period]}` : ""}
                  {hit.book.rank ? ` ${hit.book.rank}위` : ""}
                  {hit.book.rankDelta
                    ? hit.book.rankDelta > 0
                      ? ` ▲${hit.book.rankDelta}`
                      : ` ▼${Math.abs(hit.book.rankDelta)}`
                    : ""}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="review-detail__actions">
            {storeUrl ? (
              <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                서점에서 보기
              </a>
            ) : null}
            <Link href={`/search?q=${encodeURIComponent(book.author)}`} className="btn btn--ghost-ink">
              같은 저자 검색
            </Link>
          </div>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="book-rail">
          <div className="book-rail__heading">
            <h2>같은 저자의 다른 책</h2>
          </div>
          <div className="book-grid">
            {related.map((item) => (
              <BookCover key={item.id} book={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
