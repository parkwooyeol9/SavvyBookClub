/** Same work across volumes/editions: "아메리칸 학원 1" ≈ "아메리칸 학원 2". */
export function workKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\)/g, "")
    .split(/\s[:\-–]\s|\s*:\s/)[0]
    .replace(/\s*\d+\s*(?:~\s*\d+)?\s*(?:권|세트)?\s*$/, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function bookSlug(title: string, author: string): string {
  const basis = `${workKey(title)}|${author.replace(/\s+/g, "").toLowerCase()}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < basis.length; i += 1) {
    hash ^= basis.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function bookHref(book: { title: string; author: string }): string {
  return `/books/${bookSlug(book.title, book.author)}`;
}
