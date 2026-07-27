import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReviewBySlug, getReviewSlugs } from "@/lib/reviews";

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
  return {
    title: review.title,
    description: review.excerpt,
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) notFound();

  const externalUrl = review.brunchUrl || review.purchaseUrl;

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
          {externalUrl ? (
            <p style={{ marginTop: "1.75rem" }}>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                {review.source === "brunch" ? "브런치 원문 읽기" : "책 보러 가기"}
              </a>
            </p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
