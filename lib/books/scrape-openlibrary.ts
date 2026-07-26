import * as cheerio from "cheerio";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import type { Book } from "@/lib/books/types";

const OL_ORIGIN = "https://openlibrary.org";

export async function scrapeOpenLibraryTrending(): Promise<Book[]> {
  const html = await fetchHtml(`${OL_ORIGIN}/trending/daily`);
  if (!html) return [];

  const $ = cheerio.load(html);
  const books: Book[] = [];
  const seen = new Set<string>();

  $("li.searchResultItem, .searchResultItem").each((index, el) => {
    if (books.length >= 12) return false;
    const root = $(el);
    const titleEl = root.find("a.resultTitle, h3 a, a[href*='/works/']").first();
    const title = cleanText(titleEl.text());
    const href = titleEl.attr("href") || "";
    if (!title || !href.includes("/works/")) return;

    const workKey = href.split("?")[0];
    if (seen.has(workKey)) return;
    seen.add(workKey);

    const author = cleanText(
      root.find("span.bookauthor a, a[href*='/authors/']").first().text(),
    );
    const img = root.find("img").first();
    const coverUrl = img.attr("src") || img.attr("data-src") || "";

    books.push({
      id: `ol-${index + 1}`,
      title,
      author: author || "Unknown",
      coverUrl: coverUrl.startsWith("//") ? `https:${coverUrl}` : coverUrl,
      link: absoluteUrl(OL_ORIGIN, workKey),
      source: "openlibrary",
      language: "en",
      rank: books.length + 1,
    });
  });

  return books;
}
