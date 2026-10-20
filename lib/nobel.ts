import shelfData from "@/data/nobel-shelf.json";
import { aladinSearchUrl } from "@/lib/books/affiliate";
import { eachCatalogBook, type BookHit } from "@/lib/books/catalog-index";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import { bookHref, workKey } from "@/lib/books/identity";
import type { BookCatalog } from "@/lib/books/types";

export interface NobelBook {
  id: string;
  laureate: string;
  year: number;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  difficulty: 1 | 2 | 3;
  reason: string;
}

export interface NobelShelf {
  id: string;
  label: string;
  books: NobelBook[];
}

export interface NobelBookView extends NobelBook {
  href: string;
  external: boolean;
  coverUrl?: string;
  bestLabel?: string;
  rankDelta?: number;
}

export interface NobelShelfView {
  id: string;
  label: string;
  books: NobelBookView[];
}

const periodLabel: Record<ChartPeriod, string> = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
};

function sameAuthor(a: string, b: string): boolean {
  const left = a.replace(/\s+/g, "").toLowerCase();
  const right = b.replace(/\s+/g, "").toLowerCase();
  if (left.length < 2 || right.length < 2) return false;
  return left.includes(right) || right.includes(left);
}

function hitScore(hit: BookHit): number {
  const periodScore = hit.period === "daily" ? 0 : hit.period === "weekly" ? 100 : 200;
  const sectionScore = hit.section === "domestic" ? 0 : hit.section.startsWith("category:") ? 10 : 30;
  return periodScore + sectionScore + (hit.book.rank ?? 80);
}

function bestHit(book: NobelBook, hits: BookHit[]): BookHit | undefined {
  const titleKey = workKey(book.title);
  const matches = hits.filter(
    (hit) => workKey(hit.book.title) === titleKey && sameAuthor(hit.book.author, book.author),
  );
  if (matches.length === 0) return undefined;
  return matches.reduce((best, hit) => (hitScore(hit) < hitScore(best) ? hit : best));
}

export function buildNobelShelves(catalog: BookCatalog): NobelShelfView[] {
  const hits = eachCatalogBook(catalog);
  return (shelfData.shelves as NobelShelf[]).map((shelf) => ({
    id: shelf.id,
    label: shelf.label,
    books: shelf.books.map((book) => {
      const hit = bestHit(book, hits);
      const period = hit?.period ? ` ${periodLabel[hit.period]}` : "";
      return {
        ...book,
        href: hit ? bookHref(hit.book) : aladinSearchUrl(`${book.title} ${book.author}`),
        external: !hit,
        coverUrl: hit?.book.coverUrl,
        bestLabel: hit?.book.rank ? `${hit.sectionLabel}${period} ${hit.book.rank}위` : undefined,
        rankDelta: hit?.book.rankDelta,
      };
    }),
  }));
}

export const nobelShelfNote = shelfData.note;
