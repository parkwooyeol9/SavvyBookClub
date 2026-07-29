import * as cheerio from "cheerio";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import type { Book } from "@/lib/books/types";

const YES24_ORIGIN = "https://www.yes24.com";

function yes24BestsellerUrl(
  categoryNumber: string,
  period: ChartPeriod,
): string {
  if (period === "daily") {
    return `${YES24_ORIGIN}/Product/Category/daybestseller?categoryNumber=${categoryNumber}`;
  }
  if (period === "monthly") {
    return `${YES24_ORIGIN}/Product/Category/monthbestseller?categoryNumber=${categoryNumber}`;
  }
  return `${YES24_ORIGIN}/Product/Category/BestSeller?categoryNumber=${categoryNumber}&pageNumber=1&pageSize=24`;
}

function parseYes24List(
  html: string,
  options: {
    language: Book["language"];
    idPrefix: string;
    chartPeriod?: ChartPeriod;
  },
): Book[] {
  const $ = cheerio.load(html);
  const books: Book[] = [];

  $("#yesBestList > li").each((index, el) => {
    if (books.length >= 12) return false;
    const root = $(el);
    const titleEl = root.find("a.gd_name").first();
    const title = cleanText(titleEl.text());
    if (!title) return;

    const href = titleEl.attr("href");
    const author = cleanText(
      root.find(".info_auth a").first().text() ||
        root.find(".info_auth").first().text().replace(/저.*$/, ""),
    );
    const img = root.find("img").first();
    const coverUrl =
      img.attr("data-original") ||
      img.attr("data-src") ||
      img.attr("src") ||
      "";

    books.push({
      id: `${options.idPrefix}-${index + 1}`,
      title,
      author: author || "저자 미상",
      coverUrl,
      link: absoluteUrl(YES24_ORIGIN, href),
      source: "yes24",
      language: options.language,
      rank: index + 1,
      publisher: cleanText(root.find(".info_pub a").first().text()),
      chartPeriod: options.chartPeriod,
    });
  });

  if (books.length === 0) {
    $("a.gd_name").each((index, el) => {
      if (books.length >= 12) return false;
      const titleEl = $(el);
      const title = cleanText(titleEl.text());
      if (!title) return;
      const root = titleEl.closest("li");
      const img = root.find("img").first();
      books.push({
        id: `${options.idPrefix}-np-${index + 1}`,
        title,
        author:
          cleanText(root.find(".info_auth a").first().text()) || "저자 미상",
        coverUrl:
          img.attr("data-original") ||
          img.attr("data-src") ||
          img.attr("src") ||
          "",
        link: absoluteUrl(YES24_ORIGIN, titleEl.attr("href")),
        source: "yes24",
        language: options.language,
        rank: index + 1,
        chartPeriod: options.chartPeriod,
      });
    });
  }

  return books;
}

export async function scrapeYes24Bestsellers(
  period: ChartPeriod = "weekly",
  categoryNumber = "001",
): Promise<Book[]> {
  const html = await fetchHtml(yes24BestsellerUrl(categoryNumber, period), {
    live: true,
  });
  if (!html) return [];
  const prefix =
    categoryNumber === "002" ? `yes24-foreign-${period}` : `yes24-${period}`;
  return parseYes24List(html, {
    language: categoryNumber === "002" ? "en" : "ko",
    idPrefix: prefix,
    chartPeriod: period,
  });
}

export async function scrapeYes24NewReleases(): Promise<Book[]> {
  const html = await fetchHtml(
    `${YES24_ORIGIN}/Product/Category/NewProduct?categoryNumber=001`,
    { live: true },
  );
  if (!html) return [];
  return parseYes24List(html, { language: "ko", idPrefix: "yes24-new" });
}

export async function scrapeYes24ForeignBestsellers(
  period: ChartPeriod = "weekly",
): Promise<Book[]> {
  return scrapeYes24Bestsellers(period, "002");
}
