import type { Book } from "@/lib/books/types";

const NYT_LIST_URL =
  "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json";

const OPEN_LIBRARY_SUBJECT =
  "https://openlibrary.org/subjects/fiction.json?limit=12";

interface NytBook {
  rank?: number;
  title?: string;
  author?: string;
  publisher?: string;
  description?: string;
  amazon_product_url?: string;
  book_image?: string;
  primary_isbn13?: string;
}

interface NytResponse {
  results?: {
    books?: NytBook[];
  };
}

interface OpenLibraryWork {
  key?: string;
  title?: string;
  authors?: { name?: string }[];
  cover_id?: number;
  first_publish_year?: number;
}

interface OpenLibrarySubjectResponse {
  works?: OpenLibraryWork[];
}

function getNytKey(): string | undefined {
  return process.env.NYT_BOOKS_API_KEY;
}

export async function fetchNytBestsellers(): Promise<Book[]> {
  const apiKey = getNytKey();
  if (!apiKey) return [];

  try {
    const res = await fetch(`${NYT_LIST_URL}?api-key=${apiKey}`, {
      next: { revalidate: 21600, tags: ["books"] },
    });

    if (!res.ok) {
      console.error("NYT Books API error", res.status);
      return [];
    }

    const data = (await res.json()) as NytResponse;
    return (data.results?.books ?? []).slice(0, 12).map((book, index) => ({
      id: `nyt-${book.primary_isbn13 ?? index}`,
      title: book.title ?? "Untitled",
      author: book.author ?? "Unknown",
      coverUrl: book.book_image ?? "",
      link: book.amazon_product_url || "https://www.nytimes.com/books/best-sellers/",
      source: "nyt" as const,
      language: "en" as const,
      rank: book.rank ?? index + 1,
      publisher: book.publisher,
      description: book.description,
      isbn: book.primary_isbn13,
    }));
  } catch (error) {
    console.error("NYT fetch failed", error);
    return [];
  }
}

/** Fallback when NYT key is absent — public Open Library subject feed. */
export async function fetchOpenLibraryFiction(): Promise<Book[]> {
  try {
    const res = await fetch(OPEN_LIBRARY_SUBJECT, {
      next: { revalidate: 21600, tags: ["books"] },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as OpenLibrarySubjectResponse;
    return (data.works ?? []).slice(0, 12).map((work, index) => {
      const olid = work.key?.replace("/works/", "") ?? String(index);
      return {
        id: `ol-${olid}`,
        title: work.title ?? "Untitled",
        author: work.authors?.[0]?.name ?? "Unknown",
        coverUrl: work.cover_id
          ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
          : "",
        link: work.key
          ? `https://openlibrary.org${work.key}`
          : "https://openlibrary.org/",
        source: "nyt" as const,
        language: "en" as const,
        rank: index + 1,
      };
    });
  } catch (error) {
    console.error("Open Library fetch failed", error);
    return [];
  }
}

export async function fetchEnglishBestsellers(): Promise<Book[]> {
  const nyt = await fetchNytBestsellers();
  if (nyt.length > 0) return nyt;
  return fetchOpenLibraryFiction();
}
