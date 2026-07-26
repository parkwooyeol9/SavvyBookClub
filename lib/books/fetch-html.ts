const DEFAULT_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
};

export async function fetchHtml(
  url: string,
  options?: { timeoutMs?: number },
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? 15000,
  );

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      next: { revalidate: 86400, tags: ["books"] },
    });
    if (!res.ok) {
      console.error("fetchHtml failed", url, res.status);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.error("fetchHtml error", url, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function absoluteUrl(base: string, href?: string | null): string {
  if (!href) return base;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

export function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
