import type { Metadata } from "next";
import { KnowledgeMapExplorer } from "@/components/knowledge-map";
import { groupReviewsByDomain } from "@/lib/knowledge-map";
import { getAllReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "지식 지도",
  description:
    "브런치 서평을 AI·기술, 국가·제도, 화폐·경제, 인간·뇌과학 구조로 연결한 지식 지도.",
};

export const revalidate = 86400;

export default async function KnowledgeMapPage() {
  const reviews = await getAllReviews();
  const grouped = groupReviewsByDomain(reviews);

  return (
    <div className="page-shell map-page">
      <p className="map-page__eyebrow">KNOWLEDGE MAP</p>
      <h1 className="page-title">지식 지도</h1>
      <p className="page-lede map-page__lede">
        지식은 목록이 아니라 구조입니다. 분야를 고르면 핵심 개념과 연결된 서평이
        함께 펼쳐집니다.
      </p>

      <KnowledgeMapExplorer grouped={grouped} />
    </div>
  );
}
