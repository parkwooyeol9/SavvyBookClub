import type { Review } from "@/lib/books/types";

const PROFILE = "econbook";
const API_BASE = `https://api.brunch.co.kr/v1/article/@${PROFILE}`;
const BRUNCH_HOME = `https://brunch.co.kr/@${PROFILE}`;

interface BrunchImage {
  type?: string;
  url?: string;
  width?: number;
  height?: number;
  order?: number;
}

interface BrunchArticle {
  no: number;
  title?: string;
  subTitle?: string;
  contentSummary?: string;
  publishTime?: number;
  likeCount?: number;
  articleImageList?: BrunchImage[];
  magazineTitle?: string;
}

interface BrunchListResponse {
  data?: {
    list?: BrunchArticle[];
    moreList?: boolean;
    nextUrl?: string | null;
    totalCount?: number;
  };
}

function toHttps(url?: string): string {
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

function pickCover(images: BrunchImage[] | undefined): string {
  if (!images?.length) return "";
  // Prefer portrait images that look like book covers.
  const ranked = [...images].sort((a, b) => {
    const ar = (a.height ?? 1) / Math.max(a.width ?? 1, 1);
    const br = (b.height ?? 1) / Math.max(b.width ?? 1, 1);
    return br - ar;
  });
  const best = ranked.find((img) => (img.height ?? 0) > (img.width ?? 0)) ?? ranked[0];
  return toHttps(best.url);
}

function slugify(no: number, title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `brunch-${no}${base ? `-${base}` : ""}`;
}

function detectLanguage(title: string, summary: string): Review["language"] {
  const text = `${title} ${summary}`;
  if (/원서|english|livewired|weird|thinking,? fast/i.test(text)) return "en";
  // Titles that are primarily Latin script
  const latin = (title.match(/[A-Za-z]/g) || []).length;
  const hangul = (title.match(/[가-힣]/g) || []).length;
  if (latin > 8 && hangul < 4) return "en";
  return "ko";
}

function extractAuthor(title: string, subTitle: string, summary: string): string {
  const underscore = title.match(/_(.+)$/);
  if (underscore?.[1]) return underscore[1].trim();

  const comma = title.match(/,\s*([^,]+)$/);
  if (comma?.[1] && /[가-힣A-Za-z]/.test(comma[1]) && comma[1].length < 30) {
    return comma[1].trim();
  }

  const fromSummary = summary.match(
    /(?:저자|지은이|글)\s*[:：]?\s*([^\s/,]{2,30})/,
  );
  if (fromSummary?.[1]) return fromSummary[1];

  if (subTitle && subTitle.length < 40 && !/방법|시대|답이다|세계/.test(subTitle)) {
    // subtitle is usually not author; ignore
  }

  return "데이터분석가 추천";
}

function extractRating(summary: string): number | undefined {
  const m = summary.match(/별점:\s*([0-9.]+)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function extractWhyRead(summary: string, subTitle: string): string {
  const m = summary.match(/한줄평:\s*([^\n]+?)(?:\s*발간|\s*한국어|\s*읽은|$)/);
  if (m?.[1]) return m[1].replace(/\s+/g, " ").trim();
  if (subTitle) return subTitle.trim();
  return summary.replace(/\s+/g, " ").trim().slice(0, 100);
}

function cleanTitle(title: string): string {
  return title.replace(/_[^_]+$/, "").trim();
}

export function mapBrunchArticle(article: BrunchArticle): Review {
  const title = cleanTitle(article.title ?? "제목 없음");
  const subTitle = (article.subTitle ?? "").trim();
  const summary = (article.contentSummary ?? "").replace(/\s+/g, " ").trim();
  const year = article.publishTime
    ? new Date(article.publishTime).getFullYear()
    : new Date().getFullYear();
  const language = detectLanguage(title, summary);
  const displayTitle = subTitle ? `${title} — ${subTitle}` : title;

  return {
    slug: slugify(article.no, title),
    title: displayTitle,
    author: extractAuthor(article.title ?? "", subTitle, summary),
    year,
    language,
    isOriginalEnglish: language === "en",
    coverUrl: pickCover(article.articleImageList),
    excerpt: summary.slice(0, 180),
    whyRead: extractWhyRead(summary, subTitle),
    body: [
      summary,
      "",
      "원문 서평은 브런치에서 이어 읽을 수 있습니다.",
    ].join("\n"),
    purchaseUrl: `https://brunch.co.kr/@@guQj/${article.no}`,
    brunchUrl: `https://brunch.co.kr/@@guQj/${article.no}`,
    rating: extractRating(summary),
    tags: ["brunch", "econbook", article.magazineTitle ?? "경제서 비평"].filter(
      Boolean,
    ) as string[],
    source: "brunch",
  };
}

async function fetchJson(url: string): Promise<BrunchListResponse | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; SavvyBookClub/1.0; +https://savvybookclub.vercel.app)",
      },
      next: { revalidate: 86400, tags: ["brunch", "books"] },
    });
    if (!res.ok) {
      console.error("Brunch API error", url, res.status);
      return null;
    }
    return (await res.json()) as BrunchListResponse;
  } catch (error) {
    console.error("Brunch API fetch failed", error);
    return null;
  }
}

export async function fetchAllBrunchArticles(): Promise<BrunchArticle[]> {
  const articles: BrunchArticle[] = [];
  let url: string | null = `${API_BASE}?listSize=20&status=home`;
  let guard = 0;

  while (url && guard < 5) {
    guard += 1;
    const payload = await fetchJson(url);
    const list = payload?.data?.list ?? [];
    articles.push(...list);
    url = payload?.data?.moreList ? payload.data.nextUrl || null : null;
  }

  // Deduplicate by article no
  const byNo = new Map<number, BrunchArticle>();
  for (const article of articles) byNo.set(article.no, article);
  return [...byNo.values()].sort(
    (a, b) => (b.publishTime ?? 0) - (a.publishTime ?? 0),
  );
}

export async function fetchBrunchReviews(): Promise<Review[]> {
  const articles = await fetchAllBrunchArticles();
  return articles.map(mapBrunchArticle);
}

export const brunchProfile = {
  profileId: PROFILE,
  name: "데이터분석가",
  homeUrl: BRUNCH_HOME,
  description: "경제, 경영, 기업가정신에 관한 데이터 기반 접근",
} as const;
