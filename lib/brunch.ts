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

function slugify(no: number): string {
  return `brunch-${no}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function brunchArticleUrl(no: number): string {
  return `https://brunch.co.kr/@${PROFILE}/${no}`;
}

function detectLanguage(
  title: string,
  summary: string,
  subTitle: string,
): Review["language"] {
  // Korean translation note ⇒ Korean edition of a foreign book
  if (/한국어\s*번역/.test(summary)) return "ko";

  const latin = (title.match(/[A-Za-z]/g) || []).length;
  const hangul = (title.match(/[가-힣]/g) || []).length;
  if (latin > 8 && hangul < 4) return "en";

  // Structured “원서” markers only (avoid false positives in roundup essays)
  if (
    /한줄평:[^\n]{0,40}원서|원서\s*[:：]|원서로\s*읽|english\s*edition/i.test(
      summary,
    )
  ) {
    return "en";
  }

  const knownEnglish = /livewired|thinking,? fast and slow|\bweird\b/i;
  if (knownEnglish.test(`${title} ${subTitle}`) && hangul < 8) return "en";

  return "ko";
}

function looksLikePersonName(value: string): boolean {
  const name = value.trim().replace(/^[-–—]\s*/, "");
  if (name.length < 2 || name.length > 24) return false;
  if (/["""''「」『』()[\]{}]/.test(name)) return false;
  if (/\d/.test(name)) return false;
  if (/\s{2,}/.test(name)) return false;

  const wordCount = name.split(/\s+/).filter(Boolean).length;
  if (wordCount > 4) return false;

  // Particles / phrase leftovers — not a person name
  if (/(을|를|한\s*번에|어떻게|국제|제작|비교|합격)/.test(name)) {
    return false;
  }

  // Subtitle / slogan fragments, not people
  if (
    /착각|시대|방법|세계|미래|위기|로드맵|이론|역사|시장|정부|기술|답이다|대하여|유니콘|코딩|자격증|기계|예고|전쟁|사람들|미신|연준|후기|보고서|메타버스|방정식|자본주의|불확실|격변|헛소리|스토리|데이터|그림/.test(
      name,
    )
  ) {
    return false;
  }

  // Prefer names that look like person tokens (Hangul 2–6 chars, or Latin words)
  const hangulOnly = /^[가-힣]{2,6}([·.\s][가-힣]{1,6}){0,3}$/.test(name);
  const latinName = /^[A-Za-z][A-Za-z.'\-\s]{1,22}$/.test(name);
  const mixed =
    /^[가-힣A-Za-z][가-힣A-Za-z·.\s'\-]{1,22}$/.test(name) &&
    /[가-힣]/.test(name) &&
    name.length <= 18 &&
    !/[A-Z]{2,}/.test(name); // reject FRM-style acronyms

  return hangulOnly || latinName || mixed;
}

function extractAuthor(title: string, subTitle: string, summary: string): string {
  const haystacks = [title, subTitle].filter(Boolean);

  for (const text of haystacks) {
    const underscore = text.match(/_([^_]+)$/);
    if (underscore?.[1] && looksLikePersonName(underscore[1])) {
      return underscore[1].replace(/\s+/g, " ").trim();
    }
  }

  for (const text of haystacks) {
    // "Book — Author" or "Book - AuthorName"
    const dashAuthor = text.match(/[—–]\s*([^—–,]{2,24})$/);
    if (dashAuthor?.[1] && looksLikePersonName(dashAuthor[1])) {
      return dashAuthor[1].replace(/\s+/g, " ").trim();
    }
  }

  for (const text of haystacks) {
    // "…, Edward Chancellor" / "Livewired, 데이비드 이글먼"
    const comma = text.match(/,\s*([^,]{2,24})$/);
    if (comma?.[1] && looksLikePersonName(comma[1])) {
      return comma[1].replace(/\s+/g, " ").trim();
    }
  }

  for (const text of haystacks) {
    // "도파민네이션-에나 렘키"
    const hyphenName = text.match(/[-–—]([가-힣A-Za-z][가-힣A-Za-z·.\s]{1,20})$/);
    if (hyphenName?.[1] && looksLikePersonName(hyphenName[1])) {
      return hyphenName[1].replace(/\s+/g, " ").trim();
    }
  }

  const fromSummary = summary.match(
    /(?:저자|지은이|글쓴이)\s*[:：]\s*([가-힣A-Za-z.·\s]{2,24})/,
  );
  if (fromSummary?.[1] && looksLikePersonName(fromSummary[1])) {
    return fromSummary[1].replace(/\s+/g, " ").trim();
  }

  if (subTitle && looksLikePersonName(subTitle)) {
    return subTitle.trim();
  }

  return "저자 미상";
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

/** Strip trailing `_Author` from title or subtitle segments. */
function stripAuthorSuffix(text: string): string {
  return text.replace(/_[^_]+$/, "").trim();
}

function cleanTitle(title: string): string {
  return stripAuthorSuffix(title);
}

export function mapBrunchArticle(article: BrunchArticle): Review {
  const rawTitle = article.title ?? "제목 없음";
  const rawSubTitle = (article.subTitle ?? "").trim();
  const title = cleanTitle(rawTitle);
  const subTitle = stripAuthorSuffix(rawSubTitle);
  const summary = (article.contentSummary ?? "").replace(/\s+/g, " ").trim();
  const year = article.publishTime
    ? new Date(article.publishTime).getFullYear()
    : new Date().getFullYear();
  const author = extractAuthor(rawTitle, rawSubTitle, summary);
  const language = detectLanguage(title, summary, subTitle);
  let displayTitle = subTitle ? `${title} — ${subTitle}` : title;
  if (author !== "저자 미상") {
    displayTitle = displayTitle
      .replace(new RegExp(`[,，]\\s*${escapeRegExp(author)}\\s*$`), "")
      .replace(new RegExp(`[—–-]\\s*${escapeRegExp(author)}\\s*$`), "")
      .trim();
  }
  const isOriginalEnglish =
    language === "en" || /원서로\s*읽|english\s*edition/i.test(summary);

  return {
    slug: slugify(article.no),
    title: displayTitle,
    author,
    year,
    language,
    isOriginalEnglish,
    coverUrl: pickCover(article.articleImageList),
    excerpt: summary.slice(0, 180),
    whyRead: extractWhyRead(summary, subTitle),
    body: [
      summary,
      "",
      "원문 서평은 브런치에서 이어 읽을 수 있습니다.",
    ].join("\n"),
    purchaseUrl: brunchArticleUrl(article.no),
    brunchUrl: brunchArticleUrl(article.no),
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
