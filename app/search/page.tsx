import type { Metadata } from "next";
import { BookCover } from "@/components/book-rail";
import { BookSearchForm } from "@/components/book-search-form";
import { getBookCatalog } from "@/lib/books/cache";
import { searchBooks } from "@/lib/books/catalog-index";

export const metadata: Metadata = {
  title: "도서 검색",
  description: "제목이나 저자로 오늘의 서점 목록을 찾습니다.",
};

export const revalidate = 86400;

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const catalog = await getBookCatalog();
  const hits = query ? searchBooks(catalog, query) : [];

  return (
    <div className="page-shell section-stack">
      <div className="book-rail__heading">
        <p className="home-kmap__eyebrow">SEARCH</p>
        <h1 className="page-title">도서 검색</h1>
        <p>오늘의 알라딘·Yes24·신간·영문 목록에서 제목과 저자를 찾습니다.</p>
      </div>
      <BookSearchForm initial={query} id="search-page-q" />
      {query ? (
        <p className="catalog-meta">
          “{query}” {hits.length}권
        </p>
      ) : (
        <p className="catalog-meta">검색어를 입력하면 목록이 열립니다.</p>
      )}
      {hits.length > 0 ? (
        <div className="book-grid">
          {hits.map((hit) => (
            <BookCover key={hit.book.id} book={hit.book} />
          ))}
        </div>
      ) : query ? (
        <p className="empty-state">해당하는 책이 없습니다. 제목의 일부만 입력해도 됩니다.</p>
      ) : null}
    </div>
  );
}
