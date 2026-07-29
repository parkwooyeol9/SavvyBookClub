import * as cheerio from "cheerio";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import { isMangaBookFromAladinBox } from "@/lib/books/filter-books";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import type { Book } from "@/lib/books/types";

const ALADIN_ORIGIN = "https://www.aladin.co.kr";
const TARGET_COUNT = 12;
const MAX_SCAN = 48;

const ALADIN_BEST_TYPE: Record<ChartPeriod, string> = {
  daily: "DailyBest",
  weekly: "Bestseller",
  monthly: "MonthlyBest",
};

function parseAladinBoxes(
  html: string,
  options: {
    language: Book["language"];
    idPrefix: string;
    chartPeriod?: ChartPeriod;
  },
): Book[] {
  const $ = cheerio.load(html);
  const books: Book[] = [];

  $("div.ss_book_box").each((index, el) => {
    if (books.length >= TARGET_COUNT || index >= MAX_SCAN) return false;
    const root = $(el);
    const boxHtml = root.html() ?? "";
    const boxText = cleanText(root.text());
    if (isMangaBookFromAladinBox(boxHtml, boxText)) return;

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
      id: `${options.idPrefix}-${books.length + 1}`,
      title,
      author: author || "저자 미상",
      coverUrl,
      link: absoluteUrl(ALADIN_ORIGIN, linkEl.attr("href")),
      source: "aladin",
      language: options.language,
      rank: books.length + 1,
      chartPeriod: options.chartPeriod,
    });
  });

  return books;
}

export async function scrapeAladinBestsellers(
  period: ChartPeriod = "weekly",
): Promise<Book[]> {
  const bestType = ALADIN_BEST_TYPE[period];
  const html = await fetchHtml(
    `${ALADIN_ORIGIN}/shop/common/wbest.aspx?BestType=${bestType}&BranchType=1&CID=0`,
    { live: true },
  );
  if (!html) return [];
  return parseAladinBoxes(html, {
    language: "ko",
    idPrefix: `aladin-${period}`,
    chartPeriod: period,
  });
}

export async function scrapeAladinNewReleases(): Promise<Book[]> {
  const html = await fetchHtml(
    `${ALADIN_ORIGIN}/shop/common/wnew.aspx?BranchType=1`,
    { live: true },
  );
  if (!html) return [];
  return parseAladinBoxes(html, { language: "ko", idPrefix: "aladin-new" });
}
