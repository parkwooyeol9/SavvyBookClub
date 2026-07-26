import { XMLParser } from "fast-xml-parser";
import type { Book } from "@/lib/books/types";

/** Yes24 문학 분야 베스트셀러 RSS (공식 피드) */
const YES24_BESTSELLER_RSS =
  "https://www.yes24.com/_par_/Rss/bestseller.xml";

/** Fallback: 문학 분야 관심/베스트 계열 공개 RSS */
const YES24_LITERATURE_RSS =
  "https://www.yes24.com/_par_/Rss/KMA001017.xml";

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  author?: string;
  "dc:creator"?: string;
  enclosure?: { "@_url"?: string };
  "media:content"?: { "@_url"?: string };
}

interface RssFeed {
  rss?: {
    channel?: {
      item?: RssItem | RssItem[];
    };
  };
}

function extractCover(item: RssItem): string {
  const fromEnclosure = item.enclosure?.["@_url"];
  if (fromEnclosure) return fromEnclosure;

  const fromMedia = item["media:content"]?.["@_url"];
  if (fromMedia) return fromMedia;

  const desc = item.description ?? "";
  const imgMatch = desc.match(/src=["']([^"']+)["']/i);
  return imgMatch?.[1] ?? "";
}

function extractAuthor(item: RssItem): string {
  return (
    item.author ||
    item["dc:creator"] ||
    (item.description ?? "").match(/저자[:\s]*([^<|,]+)/)?.[1]?.trim() ||
    "저자 미상"
  );
}

function normalizeItems(raw: RssItem | RssItem[] | undefined): RssItem[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

async function fetchRss(url: string): Promise<Book[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 21600, tags: ["books"] },
      headers: {
        "User-Agent": "SavvyBookClub/1.0 (+https://savvybookclub.vercel.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) {
      console.error("Yes24 RSS error", url, res.status);
      return [];
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml) as RssFeed;
    const items = normalizeItems(parsed.rss?.channel?.item);

    return items.slice(0, 12).map((item, index) => {
      const title = (item.title ?? "제목 없음").trim();
      return {
        id: `yes24-${index}-${title.slice(0, 24)}`,
        title,
        author: extractAuthor(item),
        coverUrl: extractCover(item),
        link: item.link || "https://www.yes24.com/",
        source: "yes24" as const,
        language: "ko" as const,
        rank: index + 1,
      };
    });
  } catch (error) {
    console.error("Yes24 RSS parse failed", error);
    return [];
  }
}

export async function fetchYes24Bestsellers(): Promise<Book[]> {
  const primary = await fetchRss(YES24_BESTSELLER_RSS);
  if (primary.length > 0) return primary;
  return fetchRss(YES24_LITERATURE_RSS);
}
