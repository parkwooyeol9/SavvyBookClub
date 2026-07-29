import type { ChartedBooks } from "@/lib/books/chart-periods";

export type BookSource =
  | "aladin"
  | "yes24"
  | "openlibrary"
  | "news"
  | "seed";

export type BookLanguage = "ko" | "en";

export type ChartPeriod = "daily" | "weekly" | "monthly";

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
  chartPeriod?: ChartPeriod;
}

export type NewsSourceKey =
  | "hani"
  | "chosun"
  | "google-news"
  | "naver"
  | "seed";

export interface BookNewsItem {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  source: string;
  sourceKey: NewsSourceKey;
  imageUrl?: string;
  publishedAt?: string;
}

export type CatalogSection =
  | "domesticBestsellers"
  | "newReleases"
  | "yes24Bestsellers"
  | "foreignBestsellers"
  | "englishBestsellers";

export interface BookCatalog {
  updatedAt: string;
  updatedAtKst: string;
  sections: {
    domesticBestsellers: ChartedBooks;
    yes24Bestsellers: ChartedBooks;
    newReleases: Book[];
    foreignBestsellers: ChartedBooks;
    englishBestsellers: Book[];
  };
  bookNews: BookNewsItem[];
}

export type ReviewLanguage = "ko" | "en";

export type ReviewSource = "local" | "brunch";

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
  brunchUrl?: string;
  rating?: number;
  tags: string[];
  source?: ReviewSource;
}
