import type { Book } from "@/lib/books/types";

/**
 * Append affiliate / partner query params when env IDs are set.
 * Without IDs, links pass through unchanged (still useful for UX).
 */
export function withAffiliateParams(url: string, source: Book["source"]): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (source === "aladin") {
      const partner = process.env.NEXT_PUBLIC_ALADIN_PARTNER_ID;
      if (partner) parsed.searchParams.set("partner", partner);
      return parsed.toString();
    }

    if (source === "yes24") {
      const code = process.env.NEXT_PUBLIC_YES24_AFFILIATE_CODE;
      if (code) parsed.searchParams.set("pid", code);
      return parsed.toString();
    }

    return url;
  } catch {
    return url;
  }
}

/** Aladin title search — useful when a review has no bookstore product URL. */
export function aladinSearchUrl(query: string): string {
  const url = new URL("https://www.aladin.co.kr/search/wsearchresult.aspx");
  url.searchParams.set("SearchTarget", "Book");
  url.searchParams.set("SearchWord", query);
  return withAffiliateParams(url.toString(), "aladin");
}
