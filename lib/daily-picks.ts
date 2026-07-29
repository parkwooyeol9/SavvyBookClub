import type { Book, BookCatalog, Review } from "@/lib/books/types";
import { pickChartBooks } from "@/lib/books/chart-periods";
import { kstDaySeed } from "@/lib/books/freshness";

export type DailyPick =
  | { kind: "book"; book: Book; label: string }
  | { kind: "review"; review: Review; label: string };

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueBooks(books: Book[]): Book[] {
  const seen = new Set<string>();
  const out: Book[] = [];
  for (const book of books) {
    const key = `${book.title}::${book.author}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(book);
  }
  return out;
}

export function buildDailyPicks(
  catalog: BookCatalog,
  reviews: Review[],
  limit = 6,
): DailyPick[] {
  const seed = kstDaySeed();
  const pools: DailyPick[] = [
    ...pickChartBooks(catalog.sections.domesticBestsellers, "daily")
      .slice(0, 8)
      .map((book) => ({
        kind: "book" as const,
        book,
        label: "알라딘 일간",
      })),
    ...pickChartBooks(catalog.sections.yes24Bestsellers, "daily")
      .slice(0, 8)
      .map((book) => ({
        kind: "book" as const,
        book,
        label: "Yes24 일간",
      })),
    ...catalog.sections.newReleases.slice(0, 8).map((book) => ({
      kind: "book" as const,
      book,
      label: "신간",
    })),
    ...pickChartBooks(catalog.sections.foreignBestsellers, "weekly")
      .slice(0, 6)
      .map((book) => ({
        kind: "book" as const,
        book,
        label: "외국도서",
      })),
    ...catalog.sections.englishBestsellers.slice(0, 6).map((book) => ({
      kind: "book" as const,
      book,
      label: "영문 트렌딩",
    })),
    ...reviews
      .filter((r) => r.coverUrl && r.rating)
      .slice(0, 12)
      .map((review) => ({
        kind: "review" as const,
        review,
        label: "서평",
      })),
  ];

  const bookPicks = shuffle(
    pools.filter((p): p is Extract<DailyPick, { kind: "book" }> => p.kind === "book"),
    seed,
  );
  const reviewPicks = shuffle(
    pools.filter((p): p is Extract<DailyPick, { kind: "review" }> => p.kind === "review"),
    seed + 17,
  );

  const dedupedBooks = uniqueBooks(bookPicks.map((p) => p.book)).map((book) => {
    const found = bookPicks.find((p) => p.book.id === book.id);
    return found ?? { kind: "book" as const, book, label: "추천" };
  });

  const mixed: DailyPick[] = [];
  let bi = 0;
  let ri = 0;
  while (mixed.length < limit && (bi < dedupedBooks.length || ri < reviewPicks.length)) {
    if (bi < dedupedBooks.length) {
      mixed.push(dedupedBooks[bi]);
      bi += 1;
    }
    if (mixed.length < limit && ri < reviewPicks.length) {
      mixed.push(reviewPicks[ri]);
      ri += 1;
    }
  }

  return mixed.slice(0, limit);
}
