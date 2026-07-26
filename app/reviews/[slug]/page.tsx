import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReviewBySlug, getReviewSlugs } from "@/lib/reviews";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getReviewSlugs();
  return slugs.map((slug) => ({ slug }));
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
          </p>
          <h1 className="page-title">{review.title}</h1>
          <p className="page-lede">{review.author}</p>
          <p className="review-detail__why">
            <strong>왜 읽나요. </strong>
            {review.whyRead}
          </p>
          <div className="review-detail__body">{review.body}</div>
          {review.purchaseUrl ? (
            <p style={{ marginTop: "1.75rem" }}>
              <a
                href={review.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                책 보러 가기
              </a>
            </p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
