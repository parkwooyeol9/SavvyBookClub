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

const COMIC_PUBLISHER_PATTERNS = [
  /대원씨아이/,
  /\(만화\)/,
  /학산문화사/,
  /광음미디어/,
  /애니플러스/,
  /서울문화사/,
];

const COMIC_BUNDLE_PATTERNS = [
  /아크릴\s*스탠드/,
  /폴라로이드형\s*카드/,
  /일러스트\s*카드/,
  /양면\s*커버/,
  /\(특장판\)/,
  /한국\s*오리지널\s*일러스트/,
  /한국\s*한정\s*오리지널/,
  /미니\s*일러스트\s*보드/,
  /SNS풍\s*주인공/,
];

const CHILDREN_BOOK_SIGNALS =
  /그림책|동화|초등|어린이|우리\s*고전|처음\s*만나는|두고두고\s*보고\s*싶은/;

const JAPANESE_SCRIPT = /[ぁ-ゖァ-ヺ一-龯]/;
const JAPANESE_PUBLISHER_PATTERNS =
  /寶島社|集英社|講談社|小学館|白泉社|角川|KADOKAWA|新潮社|文藝春秋/;
const JAPANESE_MAGAZINE_PATTERNS = /月號|月号|年\d+月/;

function hasAuthorAndIllustrator(text: string): boolean {
  if (!/\(지은이\).*\(그림\)/.test(text) && !/\(글\).*\(그림\)/.test(text)) {
    return false;
  }
  return !CHILDREN_BOOK_SIGNALS.test(text);
}

function hasSerializedVolume(title: string, text: string): boolean {
  if (/\s\d+\s*-\s*/.test(title)) return true;
  if (/\s\d+\s*\(특장판\)/.test(title)) return true;
  if (/#\d+/.test(title)) return true;
  if (/\s\d+\s*$/.test(title) && !CHILDREN_BOOK_SIGNALS.test(text)) return true;
  if (/장\s*\d+/.test(title) && /\(지은이\).*\(옮긴이\)/.test(text)) return true;
  return false;
}

function isLikelyMangaOrComicFromMetadata(
  title: string,
  publisher: string,
  fullText: string,
): boolean {
  const combined = `${title} ${publisher} ${fullText}`;

  if (MANGA_TEXT_PATTERNS.some((pattern) => pattern.test(combined))) {
    return true;
  }
  if (COMIC_PUBLISHER_PATTERNS.some((pattern) => pattern.test(publisher))) {
    return true;
  }
  if (COMIC_BUNDLE_PATTERNS.some((pattern) => pattern.test(combined))) {
    return true;
  }
  if (hasAuthorAndIllustrator(fullText) && hasSerializedVolume(title, fullText)) {
    return true;
  }
  if (
    /\(지은이\).*\(옮긴이\)/.test(fullText) &&
    (hasSerializedVolume(title, fullText) || /요원전|라노벨|라이트\s*노벨/.test(title))
  ) {
    return true;
  }

  return false;
}

function aladinBoxIsManga(
  boxHtml: string,
  boxText: string,
  title: string,
  publisher: string,
): boolean {
  if (ALADIN_MANGA_CIDS.some((cid) => boxHtml.includes(`CID=${cid}`))) {
    return true;
  }
  if (MANGA_TEXT_PATTERNS.some((pattern) => pattern.test(boxText))) {
    return true;
  }
  return isLikelyMangaOrComicFromMetadata(title, publisher, boxText);
}

function yes24ItemIsManga(
  itemHtml: string,
  itemText: string,
  title: string,
  publisher: string,
): boolean {
  if (itemHtml.includes(`categoryNumber=${YES24_MANGA_CATEGORY}`)) {
    return true;
  }
  if (/\[만화\]/.test(itemText)) {
    return true;
  }
  if (MANGA_TEXT_PATTERNS.some((pattern) => pattern.test(itemText))) {
    return true;
  }
  return isLikelyMangaOrComicFromMetadata(title, publisher, itemText);
}

export function isMangaBookFromAladinBox(
  boxHtml: string,
  boxText: string,
  title = "",
  publisher = "",
): boolean {
  return aladinBoxIsManga(boxHtml, boxText, title, publisher);
}

export function isMangaBookFromYes24Item(
  itemHtml: string,
  itemText: string,
  title = "",
  publisher = "",
): boolean {
  return yes24ItemIsManga(itemHtml, itemText, title, publisher);
}

export function isJapaneseBookFromYes24Item(
  title: string,
  publisher: string,
  itemText: string,
): boolean {
  const combined = `${title} ${publisher} ${itemText}`;
  if (JAPANESE_SCRIPT.test(combined)) return true;
  if (JAPANESE_MAGAZINE_PATTERNS.test(combined)) return true;
  if (JAPANESE_PUBLISHER_PATTERNS.test(publisher)) return true;
  if (/\[일본\]/.test(itemText)) return true;
  return false;
}

export function filterOutManga(books: Book[]): Book[] {
  return books.filter((book) => !book.title.includes("[만화]"));
}
