import type { Book } from "@/lib/books/types";

/** Aladin 만화/코믹스 CID (국내도서 > 만화 등). */
const ALADIN_MANGA_CIDS = ["2551", "2555", "7988", "11346"];

/** Yes24 만화·만화책 카테고리 prefix. */
const YES24_MANGA_CATEGORY = "001001009";

const MANGA_TEXT_PATTERNS = [
  /\[만화\]/,
  /\[코믹스\]/,
  /\[웹툰\]/,
  /ㅣ\s*만화\s*ㅣ/,
  /\|\s*만화\s*\|/,
  /\/만화\//,
  /만화\s*>\s*/,
  /코믹스/,
  /웹툰(?:\s*원작)?/,
  /그래픽\s*노블/,
];

function aladinBoxIsManga(boxHtml: string, boxText: string): boolean {
  if (ALADIN_MANGA_CIDS.some((cid) => boxHtml.includes(`CID=${cid}`))) {
    return true;
  }
  return MANGA_TEXT_PATTERNS.some((pattern) => pattern.test(boxText));
}

function yes24ItemIsManga(itemHtml: string, itemText: string): boolean {
  if (itemHtml.includes(`categoryNumber=${YES24_MANGA_CATEGORY}`)) {
    return true;
  }
  if (/\[만화\]/.test(itemText)) {
    return true;
  }
  return MANGA_TEXT_PATTERNS.some((pattern) => pattern.test(itemText));
}

export function isMangaBookFromAladinBox(
  boxHtml: string,
  boxText: string,
): boolean {
  return aladinBoxIsManga(boxHtml, boxText);
}

export function isMangaBookFromYes24Item(
  itemHtml: string,
  itemText: string,
): boolean {
  return yes24ItemIsManga(itemHtml, itemText);
}

export function filterOutManga(books: Book[]): Book[] {
  return books.filter((book) => !book.title.includes("[만화]"));
}
