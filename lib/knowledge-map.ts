import type { Review } from "@/lib/books/types";

export type KnowledgeDomainId =
  | "technology"
  | "institutions"
  | "money"
  | "mind";

export interface KnowledgeConcept {
  id: string;
  label: string;
}

export interface KnowledgeDomain {
  id: KnowledgeDomainId;
  eyebrow: string;
  label: string;
  description: string;
  question: string;
  concepts: KnowledgeConcept[];
  keywords: RegExp;
}

export const knowledgeDomains: KnowledgeDomain[] = [
  {
    id: "technology",
    eyebrow: "TECHNOLOGY",
    label: "AI·기술",
    description:
      "인공지능, 반도체, 디지털 전환이 바꾸는 산업과 개인의 선택.",
    question: "기술 변화 앞에서 무엇을 먼저 이해해야 할까?",
    concepts: [
      { id: "ai", label: "인공지능" },
      { id: "semiconductor", label: "반도체" },
      { id: "digital", label: "디지털 전환" },
      { id: "innovation", label: "혁신 조직" },
    ],
    keywords:
      /AI|인공지능|엔비디아|젠슨|TSMC|반도체|코딩|양자|디지털|미래보고서|기술|감성 코딩/i,
  },
  {
    id: "institutions",
    eyebrow: "INSTITUTIONS",
    label: "국가·제도",
    description: "국가의 흥망, 지정학, 제도의 설계가 만드는 위기의 구조.",
    question: "제도는 언제 작동하고, 언제 무너질까?",
    concepts: [
      { id: "state", label: "국가 실패" },
      { id: "geopolitics", label: "지정학" },
      { id: "china", label: "중국·미국" },
      { id: "war", label: "전쟁사" },
    ],
    keywords:
      /국가|무너|중국|일본|전쟁|트럼프|지정학|제도|독재|자본주의|문명|WEIRD|위어드/i,
  },
  {
    id: "money",
    eyebrow: "MONEY",
    label: "화폐·경제",
    description: "투자, 버블, 통화정책, 불확실성 속에서 우위를 찾는 법.",
    question: "돈의 흐름에서 반복되는 패턴은 무엇인가?",
    concepts: [
      { id: "bubble", label: "버블" },
      { id: "investing", label: "투자 심리" },
      { id: "fed", label: "통화정책" },
      { id: "risk", label: "리스크·우위" },
    ],
    keywords:
      /투자|금융|버블|돈|연준|시장|주식|자본|불확실|우위|투기|경제|FRM|화폐/i,
  },
  {
    id: "mind",
    eyebrow: "MIND",
    label: "인간·뇌과학",
    description: "인지, 쾌락, 꿈, 합리성의 한계를 다루는 논픽션.",
    question: "우리의 판단은 얼마나 믿을 수 있을까?",
    concepts: [
      { id: "cognition", label: "인지 편향" },
      { id: "dopamine", label: "쾌락·중독" },
      { id: "brain", label: "뇌 가소성" },
      { id: "dream", label: "꿈·의식" },
    ],
    keywords:
      /뇌|꿈|쾌락|도파민|제정신|방정식|마음|인지|가소성|Livewired|순응|오리지널/i,
  },
];

export function assignReviewDomain(review: Review): KnowledgeDomainId {
  // Prefer title/whyRead — Brunch tags often include a generic "경제서" label.
  const text = `${review.title} ${review.whyRead} ${review.excerpt}`;
  for (const domain of knowledgeDomains) {
    if (domain.keywords.test(text)) return domain.id;
  }
  return "money";
}

export function groupReviewsByDomain(reviews: Review[]) {
  const grouped: Record<KnowledgeDomainId, Review[]> = {
    technology: [],
    institutions: [],
    money: [],
    mind: [],
  };

  for (const review of reviews) {
    if (review.source !== "brunch" && !review.brunchUrl) continue;
    // Skip meta annual roundups from domain clustering noise if needed
    if (/우수 도서 결산|도서 구입비/.test(review.title)) continue;
    grouped[assignReviewDomain(review)].push(review);
  }

  return grouped;
}
