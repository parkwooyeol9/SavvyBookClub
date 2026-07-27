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
        brunch.co.kr/@econbook 서평만 모았습니다. 표지·별점·한줄평은 브런치
        원문을 따릅니다.
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
