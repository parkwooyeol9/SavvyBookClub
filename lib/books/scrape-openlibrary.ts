import type { Book } from "@/lib/books/types";

interface OlSearchDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  ratings_count?: number;
  subject?: string[];
}

interface OlSearchResponse {
  docs?: OlSearchDoc[];
}

const QUERIES = [
  'subject:"business" subject:"nonfiction" language:eng',
  'subject:"economics" subject:"nonfiction" language:eng',
  'subject:"management" subject:"nonfiction" language:eng',
  'subject:"biography" subject:"nonfiction" language:eng',
  'subject:"history" subject:"nonfiction" language:eng',
  'subject:"science" subject:"nonfiction" language:eng',
] as const;

const NOTABLE_AUTHORS = new Set(
  [
    "Malcolm Gladwell",
    "Walter Isaacson",
    "Michael Lewis",
    "Phil Knight",
    "Benjamin Graham",
    "Robert Greene",
    "Adam Grant",
    "Cal Newport",
    "James Clear",
    "Daniel Kahneman",
    "Yuval Noah Harari",
    "Steven Pinker",
    "Nassim Nicholas Taleb",
    "Ray Dalio",
    "Peter Thiel",
    "Tim Ferriss",
    "Ryan Holiday",
    "David Graeber",
    "John Carreyrou",
    "Ashlee Vance",
    "Ed Catmull",
    "Mark Manson",
    "Angela Duckworth",
    "Simon Sinek",
    "Stephen Covey",
    "Dale Carnegie",
    "Bill Bryson",
    "Jared Diamond",
    "Richard Thaler",
    "Charles Duhigg",
    "Robert Cialdini",
    "Daniel Pink",
    "Clayton Christensen",
    "Eric Ries",
    "Peter Drucker",
    "Thomas Piketty",
    "Paul Krugman",
    "Joseph Stiglitz",
    "Amartya Sen",
    "Noam Chomsky",
    "Michelle Obama",
    "Barack Obama",
    "Elon Musk",
    "Steve Jobs",
  ].map((name) => name.toLowerCase()),
);

const TITLE_BLOCK =
  /\b(art of war|pride and prejudice|alice|fairy|poetry|bible|king lear|great gatsby|harry potter|to kill a mockingbird|1984|brave new world|catcher in the rye|lord of the rings|hobbit|midnight library|iron flame|fourth wing|wonder|coraline|scythe|terabithia|wimpy kid|matilda|stargirl|frindle|magician's elephant|wild robot|project hail mary|giver)\b/i;

const MIN_RATINGS_COUNT = 12;

function hasFictionSignal(doc: OlSearchDoc): boolean {
  const subjects = (doc.subject ?? []).join(" ");
  if (/\bfiction\b/i.test(subjects) && !/\bnon[\s-]?fiction\b/i.test(subjects)) {
    return true;
  }
  if (/\bjuvenile\b/i.test(subjects) && !/\bbiograph/i.test(subjects)) {
    return true;
  }
  if (/\bchildren\b/i.test(subjects) && !/\bbiograph/i.test(subjects)) {
    return true;
  }
  return false;
}

function isNotableAuthor(doc: OlSearchDoc): boolean {
  return (doc.author_name ?? []).some((name) =>
    NOTABLE_AUTHORS.has(name.toLowerCase()),
  );
}

function scoreDoc(doc: OlSearchDoc): number {
  const ratings = doc.ratings_count ?? 0;
  const editions = doc.edition_count ?? 0;
  const notable = isNotableAuthor(doc) ? 500 : 0;
  return notable + ratings + editions * 0.5;
}

function mapDoc(doc: OlSearchDoc, index: number): Book | null {
  if (!doc.title || !doc.key) return null;
  if (TITLE_BLOCK.test(doc.title) || hasFictionSignal(doc)) return null;

  const ratings = doc.ratings_count ?? 0;
  if (ratings < MIN_RATINGS_COUNT && !isNotableAuthor(doc)) return null;

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
    url.searchParams.set("sort", "rating");
    url.searchParams.set("limit", "32");
    url.searchParams.set(
      "fields",
      "key,title,author_name,cover_i,first_publish_year,ratings_count,edition_count,subject",
    );

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

/** English nonfiction from notable authors or well-reviewed titles. */
export async function scrapeOpenLibraryTrending(): Promise<Book[]> {
  const batches = await Promise.all(QUERIES.map((q) => search(q)));
  const ranked = batches
    .flat()
    .filter((doc) => doc.key)
    .sort((a, b) => scoreDoc(b) - scoreDoc(a));

  const seen = new Set<string>();
  const books: Book[] = [];

  for (const doc of ranked) {
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
