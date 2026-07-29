import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { absoluteUrl, cleanText, fetchHtml } from "@/lib/books/fetch-html";
import type { BookNewsItem } from "@/lib/books/types";

const MAX_PER_SOURCE = 3;
const NEWS_LIMIT = 18;

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

/** Cap each press/source and round-robin so one outlet cannot dominate. */
export function diversifyNewsBySource(
  items: BookNewsItem[],
  maxPerSource = MAX_PER_SOURCE,
  limit = NEWS_LIMIT,
): BookNewsItem[] {
  const unique = uniqByLink(items);
  const buckets = new Map<string, BookNewsItem[]>();

  for (const item of unique) {
    const key = cleanText(item.source) || "기타";
    const bucket = buckets.get(key) ?? [];
    if (bucket.length >= maxPerSource) continue;
    bucket.push(item);
    buckets.set(key, bucket);
  }

  const queues = [...buckets.values()].map((list) => [...list]);
  const mixed: BookNewsItem[] = [];
  let progressed = true;

  while (mixed.length < limit && progressed) {
    progressed = false;
    for (const queue of queues) {
      if (queue.length === 0 || mixed.length >= limit) continue;
      mixed.push(queue.shift()!);
      progressed = true;
    }
  }

  return mixed;
}

export async function scrapeHaniBookNews(): Promise<BookNewsItem[]> {
  const html = await fetchHtml("https://www.hani.co.kr/arti/culture/book/", {
    live: true,
  });
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
    return articles.slice(0, MAX_PER_SOURCE).map((article, index) => ({
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

async function scrapeGoogleQuery(
  query: string,
  idPrefix: string,
): Promise<BookNewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const xml = await fetchHtml(url, { live: true });
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

    return items.slice(0, 12).map((item, index) => {
      const sourceName =
        typeof item.source === "string"
          ? item.source
          : item.source?.["#text"] || "Google 뉴스";
      return {
        id: `${idPrefix}-${index}`,
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
    console.error("Google News RSS parse failed", query, error);
    return [];
  }
}

export async function scrapeGoogleBookNews(): Promise<BookNewsItem[]> {
  const queries = [
    { q: "서평 OR 북리뷰 when:7d", id: "g-review" },
    { q: "신간 도서 OR 새로 나온 책 when:7d", id: "g-new" },
    { q: "베스트셀러 책 when:7d", id: "g-best" },
  ];

  const batches = await Promise.all(
    queries.map(({ q, id }) => scrapeGoogleQuery(q, id)),
  );
  return batches.flat();
}

export async function scrapeChosunBookNews(): Promise<BookNewsItem[]> {
  const html = await fetchHtml("https://www.chosun.com/culture-life/book/", {
    live: true,
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: BookNewsItem[] = [];
  const seen = new Set<string>();

  $("a[href*='/culture-life/book/']").each((_, el) => {
    if (items.length >= MAX_PER_SOURCE) return false;
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

/** Naver 생활/문화 · 책 관련 섹션 — 언론사가 다양함. */
export async function scrapeNaverBookNews(): Promise<BookNewsItem[]> {
  const urls = [
    "https://news.naver.com/main/list.naver?mode=LS2D&mid=shm&sid1=103&sid2=243",
    "https://news.naver.com/main/list.naver?mode=LS2D&mid=shm&sid1=103&sid2=245",
  ];

  const batches = await Promise.all(
    urls.map(async (url, pageIndex) => {
      const html = await fetchHtml(url, { live: true });
      if (!html) return [] as BookNewsItem[];

      const $ = cheerio.load(html);
      const items: BookNewsItem[] = [];

      $("a.sa_text_title").each((index, el) => {
        if (items.length >= 12) return false;
        const anchor = $(el);
        const title = cleanText(anchor.text());
        const href = anchor.attr("href");
        if (!title || !href) return;

        let press = "";
        anchor.parents().each((_, node) => {
          if (press) return;
          const found = cleanText($(node).find(".sa_text_press").first().text());
          if (found) press = found;
        });

        items.push({
          id: `naver-${pageIndex}-${index}`,
          title,
          excerpt: cleanText(
            anchor.closest("li, .sa_item").find(".sa_text_lede").first().text(),
          ).slice(0, 160),
          link: href,
          source: press || "네이버뉴스",
          sourceKey: "naver",
        });
      });

      return items;
    }),
  );

  return batches.flat();
}

export async function scrapeBookNews(): Promise<BookNewsItem[]> {
  const [hani, google, chosun, naver] = await Promise.all([
    scrapeHaniBookNews(),
    scrapeGoogleBookNews(),
    scrapeChosunBookNews(),
    scrapeNaverBookNews(),
  ]);

  // Prefer Naver/Google diversity first, then Chosun/Hani.
  return diversifyNewsBySource([...naver, ...google, ...chosun, ...hani]);
}
