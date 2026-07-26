import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Review, ReviewLanguage } from "@/lib/books/types";

const REVIEWS_DIR = path.join(process.cwd(), "content", "reviews");

interface ReviewFrontmatter {
  title: string;
  author: string;
  year: number;
  language: ReviewLanguage;
  isOriginalEnglish?: boolean;
  coverUrl: string;
  excerpt: string;
  whyRead: string;
  purchaseUrl?: string;
  tags?: string[];
}

async function listReviewFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(REVIEWS_DIR);
    return entries.filter((name) => name.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function parseReview(slug: string, raw: string): Review {
  const { data, content } = matter(raw);
  const fm = data as ReviewFrontmatter;

  return {
    slug,
    title: fm.title,
    author: fm.author,
    year: fm.year,
    language: fm.language,
    isOriginalEnglish: Boolean(fm.isOriginalEnglish),
    coverUrl: fm.coverUrl,
    excerpt: fm.excerpt,
    whyRead: fm.whyRead,
    body: content.trim(),
    purchaseUrl: fm.purchaseUrl,
    tags: fm.tags ?? [],
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const files = await listReviewFiles();
  const reviews = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(REVIEWS_DIR, file), "utf8");
      return parseReview(slug, raw);
    }),
  );

  return reviews.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "ko"));
}

export async function getReviewBySlug(slug: string): Promise<Review | null> {
  try {
    const raw = await fs.readFile(path.join(REVIEWS_DIR, `${slug}.md`), "utf8");
    return parseReview(slug, raw);
  } catch {
    return null;
  }
}

export async function getReviewSlugs(): Promise<string[]> {
  const files = await listReviewFiles();
  return files.map((file) => file.replace(/\.md$/, ""));
}
