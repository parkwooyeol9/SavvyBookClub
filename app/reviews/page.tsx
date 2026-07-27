import type { Metadata } from "next";
import { ReviewFilters } from "@/components/review-filters";
import { getAllReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "서평",
  description:
    "브런치 @econbook 서평을 중심으로 한 경제·경영·과학 도서 추천과 별점.",
};

export const revalidate = 86400;

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className="page-shell">
      <h1 className="page-title">서평</h1>
      <p className="page-lede">
        brunch.co.kr/@econbook 의 도서 이미지·서평을 기본 데이터로 사용합니다.
        경제·경영·과학·기술 책을 중심으로, 별점과 한줄평을 함께 모았습니다.
      </p>
      <p className="catalog-meta">
        현재 {reviews.length}편 ·{" "}
        <a
          href="https://brunch.co.kr/@econbook"
          target="_blank"
          rel="noopener noreferrer"
        >
          브런치에서 원문 읽기
        </a>
      </p>
      <ReviewFilters reviews={reviews} />
    </div>
  );
}
