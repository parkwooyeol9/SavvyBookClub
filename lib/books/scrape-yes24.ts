import * as cheerio from "cheerio";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import {
  isJapaneseBookFromYes24Item,
  isMangaBookFromYes24Item,
} from "@/lib/books/filter-books";
import type { ChartPeriod } from "@/lib/books/chart-periods";
import type { Book } from "@/lib/books/types";

const YES24_ORIGIN = "https://www.yes24.com";
const TARGET_COUNT = 12;
const MAX_SCAN = 48;

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

function pushYes24Book(
  books: Book[],
  options: {
    language: Book["language"];
    idPrefix: string;
    chartPeriod?: ChartPeriod;
  },
  data: {
    title: string;
    author: string;
    coverUrl: string;
    link: string;
    publisher?: string;
  },
): void {
  if (books.length >= TARGET_COUNT) return;
  books.push({
    id: `${options.idPrefix}-${books.length + 1}`,
    title: data.title,
    author: data.author || "저자 미상",
    coverUrl: data.coverUrl,
    link: data.link,
    source: "yes24",
    language: options.language,
    rank: books.length + 1,
    publisher: data.publisher,
    chartPeriod: options.chartPeriod,
  });
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
    if (books.length >= TARGET_COUNT || index >= MAX_SCAN) return false;
    const root = $(el);
    const itemHtml = root.html() ?? "";
    const itemText = cleanText(root.text());

    const titleEl = root.find("a.gd_name").first();
    const title = cleanText(titleEl.text());
    if (!title) return;

    const publisher = cleanText(root.find(".info_pub a").first().text());
    if (isMangaBookFromYes24Item(itemHtml, itemText, title, publisher)) {
      return;
    }
    if (
      options.language === "en" &&
      isJapaneseBookFromYes24Item(title, publisher, itemText)
    ) {
      return;
    }

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

    pushYes24Book(books, options, {
      title,
      author,
      coverUrl,
      link: absoluteUrl(YES24_ORIGIN, href),
      publisher,
    });
  });

  if (books.length === 0) {
    $("a.gd_name").each((index, el) => {
      if (books.length >= TARGET_COUNT || index >= MAX_SCAN) return false;
      const titleEl = $(el);
      const title = cleanText(titleEl.text());
      if (!title) return;
      const root = titleEl.closest("li");
      const itemHtml = root.html() ?? "";
      const itemText = cleanText(root.text());
      const publisher = cleanText(root.find(".info_pub a").first().text());
      if (isMangaBookFromYes24Item(itemHtml, itemText, title, publisher)) {
        return;
      }
      if (
        options.language === "en" &&
        isJapaneseBookFromYes24Item(title, publisher, itemText)
      ) {
        return;
      }

      const img = root.find("img").first();
      pushYes24Book(books, options, {
        title,
        author:
          cleanText(root.find(".info_auth a").first().text()) || "저자 미상",
        coverUrl:
          img.attr("data-original") ||
          img.attr("data-src") ||
          img.attr("src") ||
          "",
        link: absoluteUrl(YES24_ORIGIN, titleEl.attr("href")),
        publisher,
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
