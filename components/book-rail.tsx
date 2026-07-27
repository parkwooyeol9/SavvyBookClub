import Image from "next/image";
import type { Book } from "@/lib/books/types";

const sourceLabel: Record<Book["source"], string> = {
  aladin: "알라딘",
  yes24: "Yes24",
  openlibrary: "Open Library",
  news: "뉴스",
  seed: "미리보기",
};

export function BookCover({ book }: { book: Book }) {
  return (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
      className="book-cover"
    >
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
          <span className="book-cover__rank">{book.rank}</span>
        ) : null}
        <h3 className="book-cover__title">{book.title}</h3>
        <p className="book-cover__author">{book.author}</p>
        <p className="book-cover__source">{sourceLabel[book.source]}</p>
      </div>
    </a>
  );
}

export function BookRail({
  title,
  subtitle,
  books,
  limit = 8,
}: {
  title: string;
  subtitle?: string;
  books: Book[];
  limit?: number;
}) {
  const visible = books.slice(0, limit);

  return (
    <section className="book-rail">
      <div className="book-rail__heading">
        <h2>{title}</h2>
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
