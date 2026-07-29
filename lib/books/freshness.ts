/** Re-sync if cache is older than this (cron runs daily at 09:00 KST). */
export const CATALOG_MAX_AGE_MS = 22 * 60 * 60 * 1000;

export function isCatalogStale(updatedAt: string | undefined): boolean {
  if (!updatedAt) return true;
  const age = Date.now() - new Date(updatedAt).getTime();
  return !Number.isFinite(age) || age > CATALOG_MAX_AGE_MS;
}

export function formatKstDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "long",
  }).format(date);
}

export function kstDaySeed(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value ?? 2026);
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  const day = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  return year * 10000 + month * 100 + day;
}
