import type { Book } from "@/lib/books/types";

interface OlSearchDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  subject?: string[];
}

interface OlSearchResponse {
  docs?: OlSearchDoc[];
}

const QUERIES = [
  "subject:(business OR economics OR finance OR investing OR entrepreneurship) language:eng",
  "subject:(management OR capitalism OR \"behavioral economics\") language:eng",
] as const;

const TITLE_BLOCK =
  /\b(art of war|pride and prejudice|alice|fairy|poetry|bible|king lear|great gatsby|harry potter|to kill a mockingbird|1984|brave new world|catcher in the rye|lord of the rings|hobbit|midnight library|iron flame|fourth wing)\b/i;

function hasFictionSignal(doc: OlSearchDoc): boolean {
  const subjects = (doc.subject ?? []).join(" ");
  if (/\bfiction\b/i.test(subjects) && !/\bnon[\s-]?fiction\b/i.test(subjects)) {
    return true;
  }
  return false;
}

function mapDoc(doc: OlSearchDoc, index: number): Book | null {
  if (!doc.title || !doc.key) return null;
  if (TITLE_BLOCK.test(doc.title) || hasFictionSignal(doc)) return null;
  const olid = doc.key.replace(/^\/works\//, "");
  return {
    id: `ol-${olid}`,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown",
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : "",
    link: `https://openlibrary.org${doc.key}`,
    source: "openlibrary",
    language: "en",
    rank: index + 1,
  };
}

async function search(query: string): Promise<OlSearchDoc[]> {
  try {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "readinglog");
    url.searchParams.set("limit", "24");

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SavvyBookClub/1.0 (+https://savvybookclub.vercel.app)",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as OlSearchResponse;
    return data.docs ?? [];
  } catch (error) {
    console.error("Open Library search failed", query, error);
    return [];
  }
}

/** English trending limited to business / economics / nonfiction. */
export async function scrapeOpenLibraryTrending(): Promise<Book[]> {
  const batches = await Promise.all(QUERIES.map((q) => search(q)));
  const seen = new Set<string>();
  const books: Book[] = [];

  for (const doc of batches.flat()) {
    const key = doc.key ?? doc.title ?? "";
    if (!key || seen.has(key)) continue;
    const book = mapDoc(doc, books.length);
    if (!book) continue;
    seen.add(key);
    books.push(book);
    if (books.length >= 12) break;
  }

  return books;
}
