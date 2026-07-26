import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import type { BookNewsItem } from "@/lib/books/types";

interface HaniArticle {
  title?: string;
  id?: number;
  url?: string;
  image?: string;
  prologue?: string;
  date?: string;
}

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
}

function uniqByLink(items: BookNewsItem[]): BookNewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

export async function scrapeHaniBookNews(): Promise<BookNewsItem[]> {
  const html = await fetchHtml("https://www.hani.co.kr/arti/culture/book/");
  if (!html) return [];

  try {
    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
    );
    if (!match) return [];

    const data = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          listData?: { articleList?: HaniArticle[] };
        };
      };
    };

    const articles = data.props?.pageProps?.listData?.articleList ?? [];
    return articles.slice(0, 12).map((article, index) => ({
      id: `hani-${article.id ?? index}`,
      title: cleanText(article.title ?? "제목 없음"),
      excerpt: cleanText(article.prologue ?? ""),
      link: absoluteUrl("https://www.hani.co.kr", article.url),
      source: "한겨레",
      sourceKey: "hani" as const,
      imageUrl: article.image,
      publishedAt: article.date,
    }));
  } catch (error) {
    console.error("Hani parse failed", error);
    return [];
  }
}

export async function scrapeGoogleBookNews(): Promise<BookNewsItem[]> {
  const url =
    "https://news.google.com/rss/search?q=%EC%84%9C%ED%8F%89+OR+%EC%8B%A0%EA%B0%84+%EC%B1%85+OR+%EB%8F%84%EC%84%9C+%EB%A6%AC%EB%B7%B0&hl=ko&gl=KR&ceid=KR:ko";
  const xml = await fetchHtml(url);
  if (!xml) return [];

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: RssItem | RssItem[] } };
    };
    const raw = parsed.rss?.channel?.item;
    const items = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items.slice(0, 15).map((item, index) => {
      const sourceName =
        typeof item.source === "string"
          ? item.source
          : item.source?.["#text"] || "Google 뉴스";
      return {
        id: `gnews-${index}`,
        title: cleanText(item.title ?? "제목 없음"),
        excerpt: cleanText(
          (item.description ?? "").replace(/<[^>]+>/g, "").slice(0, 180),
        ),
        link: item.link || "https://news.google.com/",
        source: cleanText(sourceName),
        sourceKey: "google-news" as const,
        publishedAt: item.pubDate,
      };
    });
  } catch (error) {
    console.error("Google News RSS parse failed", error);
    return [];
  }
}

export async function scrapeChosunBookNews(): Promise<BookNewsItem[]> {
  const html = await fetchHtml("https://www.chosun.com/culture-life/book/");
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: BookNewsItem[] = [];
  const seen = new Set<string>();

  $("a[href*='/culture-life/book/']").each((_, el) => {
    if (items.length >= 10) return false;
    const href = $(el).attr("href") || "";
    if (!/\/culture-life\/book\/\d{4}\//.test(href)) return;
    const title = cleanText($(el).text());
    if (title.length < 8) return;
    const link = absoluteUrl("https://www.chosun.com", href);
    if (seen.has(link)) return;
    seen.add(link);
    items.push({
      id: `chosun-${items.length + 1}`,
      title,
      excerpt: "",
      link,
      source: "조선일보",
      sourceKey: "chosun",
    });
  });

  return items;
}

export async function scrapeBookNews(): Promise<BookNewsItem[]> {
  const [hani, google, chosun] = await Promise.all([
    scrapeHaniBookNews(),
    scrapeGoogleBookNews(),
    scrapeChosunBookNews(),
  ]);

  return uniqByLink([...hani, ...chosun, ...google]).slice(0, 20);
}
