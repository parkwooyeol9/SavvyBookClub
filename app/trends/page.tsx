import type { Metadata } from "next";
import { TrendsScreen } from "@/components/trends-screen";

export const metadata: Metadata = {
  title: "올해의 트렌드 (2026년)",
  description:
    "2026년 미국·한국 도서와 영화 소비에서 읽는 문화 신호. 판매·흥행 수치와 해석을 분리한 11월 2일 스냅샷.",
};

export default function TrendsPage() {
  return <TrendsScreen />;
}
