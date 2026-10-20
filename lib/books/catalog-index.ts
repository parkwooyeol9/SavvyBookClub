import type { ChartPeriod } from "@/lib/books/chart-periods";
import { bookSlug } from "@/lib/books/identity";
import { ALADIN_CATEGORIES } from "@/lib/books/scrape-aladin";
import type { Book, BookCatalog } from "@/lib/books/types";

export interface BookHit {
  book: Book;
  section: string;
  sectionLabel: string;
  period?: ChartPeriod;
}

const categoryLabel = new Map(ALADIN_CATEGORIES.map((category) => [category.id, category.label]));

function pushChart(
  hits: BookHit[],
  section: string,
  sectionLabel: string,
  books: Book[],
  period?: ChartPeriod,
) {
  for (const book of books) {
    hits.push({ book, section, sectionLabel, period });
  }
}

export function eachCatalogBook(catalog: BookCatalog): BookHit[] {
  const hits: BookHit[] = [];
  const periods: ChartPeriod[] = ["daily", "weekly", "monthly"];
  const charts = [
    ["domestic", "알라딘", catalog.sections.domesticBestsellers],
    ["yes24", "Yes24", catalog.sections.yes24Bestsellers],
    ["foreign", "외국도서", catalog.sections.foreignBestsellers],
  ] as const;

  for (const [section, label, charted] of charts) {
    for (const period of periods) {
      pushChart(hits, section, label, charted[period], period);
    }
  }

  pushChart(hits, "new", "신간", catalog.sections.newReleases);
  pushChart(hits, "english", "영문", catalog.sections.englishBestsellers);

  for (const [categoryId, charted] of Object.entries(catalog.sections.categoryBestsellers)) {
    const label = categoryLabel.get(categoryId) ?? categoryId;
    for (const period of periods) {
      pushChart(hits, `category:${categoryId}`, `알라딘 ${label}`, charted[period] ?? [], period);
    }
  }

  return hits;
}

export function listBookSlugs(catalog: BookCatalog): string[] {
  const slugs = new Set<string>();
  for (const hit of eachCatalogBook(catalog)) {
    slugs.add(bookSlug(hit.book.title, hit.book.author));
  }
  return [...slugs];
}

function preferBook(current: Book, next: Book): Book {
  if (!current.coverUrl && next.coverUrl) return next;
  if (current.language !== "ko" && next.language === "ko") return next;
  if ((next.rank ?? 99) < (current.rank ?? 99) && next.coverUrl) return next;
  return current;
}

export function findBookGroup(
  catalog: BookCatalog,
  slug: string,
): { book: Book; placements: BookHit[] } | null {
  const placements = eachCatalogBook(catalog).filter(
    (hit) => bookSlug(hit.book.title, hit.book.author) === slug,
  );
  if (placements.length === 0) return null;

  const seen = new Set<string>();
  const unique: BookHit[] = [];
  for (const hit of placements) {
    const key = `${hit.sectionLabel}:${hit.period ?? "list"}:${hit.book.rank ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(hit);
  }

  const book = placements.reduce((best, hit) => preferBook(best, hit.book), placements[0].book);
  unique.sort((a, b) => (a.book.rank ?? 99) - (b.book.rank ?? 99));
  return { book, placements: unique };
}

export function searchBooks(catalog: BookCatalog, query: string): BookHit[] {
  const needle = query.trim().toLowerCase().replace(/\s+/g, "");
  if (needle.length < 1) return [];

  const seen = new Set<string>();
  const hits: BookHit[] = [];
  for (const hit of eachCatalogBook(catalog)) {
    const slug = bookSlug(hit.book.title, hit.book.author);
    if (seen.has(slug)) continue;
    const haystack = `${hit.book.title}${hit.book.author}`.toLowerCase().replace(/\s+/g, "");
    if (!haystack.includes(needle)) continue;
    seen.add(slug);
    hits.push(hit);
  }

  hits.sort((a, b) => {
    const aTitle = a.book.title.toLowerCase().replace(/\s+/g, "");
    const bTitle = b.book.title.toLowerCase().replace(/\s+/g, "");
    const aStart = aTitle.startsWith(needle) ? 0 : 1;
    const bStart = bTitle.startsWith(needle) ? 0 : 1;
    if (aStart !== bStart) return aStart - bStart;
    return (a.book.rank ?? 99) - (b.book.rank ?? 99);
  });

  return hits.slice(0, 48);
}

export function relatedBooks(catalog: BookCatalog, book: Book, limit = 4): Book[] {
  const slug = bookSlug(book.title, book.author);
  const author = book.author.replace(/\s+/g, "");
  const seen = new Set<string>([slug]);
  const related: Book[] = [];

  for (const hit of eachCatalogBook(catalog)) {
    const nextSlug = bookSlug(hit.book.title, hit.book.author);
    if (seen.has(nextSlug)) continue;
    if (hit.book.author.replace(/\s+/g, "") !== author) continue;
    seen.add(nextSlug);
    related.push(hit.book);
    if (related.length >= limit) break;
  }

  return related;
}
