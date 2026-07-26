import type { Book } from "@/lib/books/types";

const ALADIN_LIST_URL = "https://www.aladin.co.kr/ttb/api/ItemList.aspx";

interface AladinItem {
  itemId?: number;
  title?: string;
  author?: string;
  publisher?: string;
  cover?: string;
  link?: string;
  description?: string;
  isbn13?: string;
  isbn?: string;
}

interface AladinListResponse {
  item?: AladinItem[];
}

type AladinQueryType =
  | "Bestseller"
  | "ItemNewSpecial"
  | "ItemEditorChoice"
  | "BlogBest";

function getTtbKey(): string | undefined {
  return process.env.ALADIN_TTB_KEY;
}

function mapItem(
  item: AladinItem,
  index: number,
  language: Book["language"],
): Book {
  const id = String(item.itemId ?? item.isbn13 ?? item.isbn ?? `aladin-${index}`);
  return {
    id: `aladin-${id}`,
    title: (item.title ?? "제목 없음").replace(/\(.*\)\s*$/, "").trim(),
    author: (item.author ?? "저자 미상").split(",")[0]?.trim() || "저자 미상",
    coverUrl: item.cover || "",
    link: item.link || "https://www.aladin.co.kr/",
    source: "aladin",
    language,
    rank: index + 1,
    publisher: item.publisher,
    description: item.description,
    isbn: item.isbn13 || item.isbn,
  };
}

export async function fetchAladinList(options: {
  queryType: AladinQueryType;
  searchTarget?: "Book" | "Foreign";
  maxResults?: number;
  categoryId?: number;
}): Promise<Book[]> {
  const ttbkey = getTtbKey();
  if (!ttbkey) return [];

  const params = new URLSearchParams({
    ttbkey,
    QueryType: options.queryType,
    MaxResults: String(options.maxResults ?? 12),
    start: "1",
    SearchTarget: options.searchTarget ?? "Book",
    output: "js",
    Version: "20131101",
    Cover: "Big",
  });

  if (options.categoryId) {
    params.set("CategoryId", String(options.categoryId));
  }

  // ItemEditorChoice requires a category
  if (options.queryType === "ItemEditorChoice" && !options.categoryId) {
    params.set("CategoryId", "1"); // 국내도서
  }

  const res = await fetch(`${ALADIN_LIST_URL}?${params.toString()}`, {
    next: { revalidate: 21600, tags: ["books"] },
  });

  if (!res.ok) {
    console.error("Aladin API error", res.status);
    return [];
  }

  const text = await res.text();
  let data: AladinListResponse;
  try {
    data = JSON.parse(text) as AladinListResponse;
  } catch {
    // Aladin sometimes returns JSONP-like payload; strip wrapper if present
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return [];
    data = JSON.parse(match[0]) as AladinListResponse;
  }

  const language = options.searchTarget === "Foreign" ? "en" : "ko";
  return (data.item ?? []).map((item, i) => mapItem(item, i, language));
}

export async function fetchAladinDomesticBestsellers(): Promise<Book[]> {
  return fetchAladinList({ queryType: "Bestseller", searchTarget: "Book" });
}

export async function fetchAladinNewReleases(): Promise<Book[]> {
  return fetchAladinList({ queryType: "ItemNewSpecial", searchTarget: "Book" });
}

export async function fetchAladinForeignBestsellers(): Promise<Book[]> {
  return fetchAladinList({ queryType: "Bestseller", searchTarget: "Foreign" });
}
