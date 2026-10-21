import economicsData from "@/data/nobel-economics.json";
import reviewData from "@/data/nobel-review.json";
import shelfData from "@/data/nobel-shelf.json";
import { withAffiliateParams } from "@/lib/books/affiliate";
import { eachCatalogBook, type BookHit } from "@/lib/books/catalog-index";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import { bookHref, workKey } from "@/lib/books/identity";
import type { BookCatalog } from "@/lib/books/types";

export interface NobelBook {
  id: string;
  laureate: string;
  year: number;
  /** 과학상 서가에서만 씀: 물리학·화학·생리의학 */
  field?: string;
  title: string;
  author: string;
  publisher?: string;
  koreanEdition?: string;
  isbn?: string;
  aladinItemId: string;
  coverUrl: string;
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

function aladinProductUrl(itemId: string): string {
  return withAffiliateParams(
    `https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=${itemId}`,
    "aladin",
  );
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
        href: hit ? bookHref(hit.book) : aladinProductUrl(book.aladinItemId),
        external: !hit,
        coverUrl: hit?.book.coverUrl || book.coverUrl,
        bestLabel: hit?.book.rank ? `${hit.sectionLabel}${period} ${hit.book.rank}위` : undefined,
        rankDelta: hit?.book.rankDelta,
      };
    }),
  }));
}

export const nobelShelfNote = shelfData.note;

export type EconCategory = "A" | "B" | "C";

export interface EconLaureate {
  ko: string;
  en: string;
  born: string;
  died: string | null;
  birthCountry: string;
  affiliation: string[];
  portion: string;
  female: boolean;
  bio: string;
  url: string;
}

export interface EconPrize {
  year: number;
  field: string;
  cat: EconCategory;
  motivation: string;
  laureates: EconLaureate[];
}

export interface EconBookLink {
  title: string;
  href: string;
  external: boolean;
}

export interface EconPrizeView extends EconPrize {
  books: EconBookLink[];
}

export const econCategoryName = economicsData.catName as Record<EconCategory, string>;
export const econCharts = {
  lag: economicsData.lag,
  decades: economicsData.decades as {
    title: string;
    cats: string[];
    series: { id: EconCategory; name: string; values: number[] }[];
  },
};
export const econSource = economicsData.source;
export const nobelReview = reviewData;

/** 역대 경제학상 + 같은 수상자의 서가 도서 링크. */
export function buildEconPrizes(shelves: NobelShelfView[]): EconPrizeView[] {
  const econBooks = shelves.find((shelf) => shelf.id === "economics")?.books ?? [];
  return (economicsData.prizes as EconPrize[]).map((prize) => ({
    ...prize,
    books: econBooks
      .filter(
        (book) =>
          book.year === prize.year &&
          prize.laureates.some((person) => book.laureate.includes(person.ko)),
      )
      .map((book) => ({ title: book.title, href: book.href, external: book.external })),
  }));
}
