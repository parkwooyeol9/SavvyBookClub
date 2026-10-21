import type { MetadataRoute } from "next";
import { getBookCatalog } from "@/lib/books/cache";
import { listBookSlugs } from "@/lib/books/catalog-index";
import { getReviewSlugs } from "@/lib/reviews";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/reviews`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/map`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/nobel`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  let bookRoutes: MetadataRoute.Sitemap = [];
  try {
    const catalog = await getBookCatalog();
    bookRoutes = listBookSlugs(catalog).map((slug) => ({
      url: `${base}/books/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }));
  } catch {
    bookRoutes = [];
  }

  let reviewRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getReviewSlugs();
    reviewRoutes = slugs.map((slug) => ({
      url: `${base}/reviews/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    reviewRoutes = [];
  }

  return [...staticRoutes, ...bookRoutes, ...reviewRoutes];
}
