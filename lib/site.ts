/** Canonical site origin for sitemap, OG, and absolute URLs. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://savvybookclub.vercel.app";
}

export const siteName = "SavvyBookClub";

export const siteDescription =
  "데이터에 기반한 경제·경영·과학 도서 분석. 브런치 @econbook 서평, 지식 지도, 국내·해외 베스트를 한곳에.";
