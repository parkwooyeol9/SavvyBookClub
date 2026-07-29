import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SimilarReviews } from "@/components/similar-reviews";
import { aladinSearchUrl } from "@/lib/books/affiliate";
import { getReviewBySlug, getReviewSlugs, getAllReviews } from "@/lib/reviews";
import { getSimilarReviews } from "@/lib/similar-reviews";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getReviewSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) return { title: "서평" };

  const title = review.title;
  const description = review.whyRead || review.excerpt;
  const url = `${getSiteUrl()}/reviews/${review.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: review.coverUrl ? [{ url: review.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: review.coverUrl ? [review.coverUrl] : undefined,
    },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params;
  const [review, allReviews] = await Promise.all([
    getReviewBySlug(slug),
    getAllReviews(),
  ]);
  if (!review) notFound();

  const similar = getSimilarReviews(review, allReviews, 4);
  const brunchUrl = review.brunchUrl;
  const bookstoreUrl = aladinSearchUrl(
    review.title.split("—")[0]?.trim() || review.title,
  );

  return (
    <div className="page-shell">
      <Link href="/reviews" className="catalog-meta">
        ← 서평 목록
      </Link>
      <article className="review-detail">
        <div className="review-detail__cover">
          {review.coverUrl ? (
            <Image
              src={review.coverUrl}
              alt={`${review.title} 표지`}
              width={440}
              height={660}
              unoptimized
            />
          ) : null}
        </div>
        <div>
          <p className="catalog-meta">
            {review.year} · {review.language === "en" ? "English" : "한국어"}
            {review.isOriginalEnglish ? " · 원서" : ""}
            {review.source === "brunch" ? " · 브런치" : ""}
            {typeof review.rating === "number"
              ? ` · ★ ${review.rating.toFixed(1)}`
              : ""}
          </p>
          <h1 className="page-title">{review.title}</h1>
          <p className="page-lede">{review.author}</p>
          <p className="review-detail__why">
            <strong>한줄평. </strong>
            {review.whyRead}
          </p>
          <div className="review-detail__body">{review.body}</div>
          <div className="review-detail__actions">
            {brunchUrl ? (
              <a
                href={brunchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                브런치에서 전체 읽기
              </a>
            ) : null}
            <a
              href={bookstoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost-ink"
            >
              서점에서 찾기
            </a>
          </div>
        </div>
      </article>
      <SimilarReviews reviews={similar} />
    </div>
  );
}
