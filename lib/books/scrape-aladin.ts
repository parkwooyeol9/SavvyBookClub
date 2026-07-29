import * as cheerio from "cheerio";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import type { Book } from "@/lib/books/types";

const ALADIN_ORIGIN = "https://www.aladin.co.kr";

function parseAladinBoxes(
  html: string,
  options: { language: Book["language"]; idPrefix: string },
): Book[] {
  const $ = cheerio.load(html);
  const books: Book[] = [];

  $("div.ss_book_box").each((index, el) => {
    if (books.length >= 12) return false;
    const root = $(el);
    const linkEl = root
      .find('a[href*="wproduct.aspx"]')
      .filter((_, a) => cleanText($(a).text()).length > 1)
      .first();
    const title = cleanText(linkEl.text());
    if (!title) return;

    const author = cleanText(
      root.find('a[href*="AuthorSearch"]').first().text(),
    );
    let coverUrl = "";
    root.find("img").each((_, img) => {
      const src = $(img).attr("src") || "";
      if (/cover/i.test(src)) coverUrl = src;
    });
    if (!coverUrl) coverUrl = root.find("img").first().attr("src") || "";

    books.push({
      id: `${options.idPrefix}-${index + 1}`,
      title,
      author: author || "저자 미상",
      coverUrl,
      link: absoluteUrl(ALADIN_ORIGIN, linkEl.attr("href")),
      source: "aladin",
      language: options.language,
      rank: index + 1,
    });
  });

  return books;
}

export async function scrapeAladinBestsellers(): Promise<Book[]> {
  const html = await fetchHtml(
    `${ALADIN_ORIGIN}/shop/common/wbest.aspx?BestType=Bestseller&BranchType=1&CID=0`,
    { live: true },
  );
  if (!html) return [];
  return parseAladinBoxes(html, { language: "ko", idPrefix: "aladin-best" });
}

export async function scrapeAladinNewReleases(): Promise<Book[]> {
  const html = await fetchHtml(
    `${ALADIN_ORIGIN}/shop/common/wnew.aspx?BranchType=1`,
    { live: true },
  );
  if (!html) return [];
  return parseAladinBoxes(html, { language: "ko", idPrefix: "aladin-new" });
}
