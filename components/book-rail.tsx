import Image from "next/image";
import Link from "next/link";
import { bookHref } from "@/lib/books/identity";
import type { Book } from "@/lib/books/types";

const sourceLabel: Record<Book["source"], string> = {
  aladin: "알라딘",
  yes24: "Yes24",
  openlibrary: "Open Library",
  news: "뉴스",
  seed: "미리보기",
};

export function BookCover({ book }: { book: Book }) {
  const delta = book.rankDelta;
  const deltaLabel =
    delta && delta !== 0 ? (delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`) : null;

  return (
    <Link href={bookHref(book)} className="book-cover">
      <div className="book-cover__frame">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`${book.title} 표지`}
            width={200}
            height={300}
            className="book-cover__image"
            unoptimized
          />
        ) : (
          <div className="book-cover__placeholder" aria-hidden>
            {book.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="book-cover__meta">
        {book.rank ? (
          <span className="book-cover__rank">
            {book.rank}위
            {deltaLabel ? (
              <span className={`book-cover__delta${delta && delta > 0 ? " is-up" : " is-down"}`}>
                {deltaLabel}
              </span>
            ) : null}
          </span>
        ) : null}
        <h3 className="book-cover__title">{book.title}</h3>
        <p className="book-cover__author">{book.author}</p>
        <p className="book-cover__source">{sourceLabel[book.source]}</p>
      </div>
    </Link>
  );
}

export function BookRail({
  title,
  subtitle,
  books,
  limit = 8,
  embedded = false,
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  limit?: number;
  embedded?: boolean;
}) {
  const visible = books.slice(0, limit);

  return (
    <section className={`book-rail${embedded ? " book-rail--embedded" : ""}`}>
      <div className="book-rail__heading">
        {embedded ? null : <h2>{title}</h2>}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="book-rail__track">
        {visible.map((book) => (
          <BookCover key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
