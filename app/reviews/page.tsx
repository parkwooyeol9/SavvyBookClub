import type { Metadata } from "next";
import { ReviewFilters } from "@/components/review-filters";
import { getAllReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "서평",
  description: "연간 개인 추천 도서와 서평. 한국어 도서와 영문 원서를 함께 소개합니다.",
};

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className="page-shell">
      <h1 className="page-title">서평</h1>
      <p className="page-lede">
        한 해 약 30권을 목표로, 개인적으로 권하는 책과 짧은 서평을 모읍니다.
        국내서와 영문 원서를 함께 읽습니다.
      </p>
      <ReviewFilters reviews={reviews} />
    </div>
  );
}
