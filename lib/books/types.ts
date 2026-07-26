export type BookSource = "aladin" | "yes24" | "nyt" | "seed";

export type BookLanguage = "ko" | "en";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  link: string;
  source: BookSource;
  language: BookLanguage;
  rank?: number;
  publisher?: string;
  description?: string;
  isbn?: string;
}

export type CatalogSection =
  | "domesticBestsellers"
  | "newReleases"
  | "foreignBestsellers"
  | "yes24Bestsellers"
  | "englishBestsellers";

export interface BookCatalog {
  updatedAt: string;
  sections: Record<CatalogSection, Book[]>;
}

export type ReviewLanguage = "ko" | "en";

export interface Review {
  slug: string;
  title: string;
  author: string;
  year: number;
  language: ReviewLanguage;
  isOriginalEnglish: boolean;
  coverUrl: string;
  excerpt: string;
  whyRead: string;
  body: string;
  purchaseUrl?: string;
  tags: string[];
}
