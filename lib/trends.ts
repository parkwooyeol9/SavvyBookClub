export type TrendMarket = "US" | "KR";
export type TrendVintage = "new" | "old";
export type TrendTabId = "glance" | "reading" | "cinema" | "books" | "notes";

export const trendsUpdated = "2026.11.02";
export const trendsObservatoryUrl = "https://culture-observatory-2026.savvyetf.chatgpt.site/";

export const trendTabs: { id: TrendTabId; hash: string; label: string; hint: string }[] = [
  { id: "glance", hash: "glance", label: "한눈에", hint: "네 가지 신호" },
  { id: "reading", hash: "reading", label: "독서", hint: "분야별 판매" },
  { id: "cinema", hash: "cinema", label: "영화", hint: "극장 흥행" },
  { id: "books", hash: "books", label: "도서", hint: "신간·재발견" },
  { id: "notes", hash: "method", label: "주의점", hint: "출처·한계" },
];

const hashAliases: Record<string, TrendTabId> = {
  glance: "glance",
  overview: "glance",
  reading: "reading",
  cinema: "cinema",
  books: "books",
  notes: "notes",
  method: "notes",
};

export function trendTabFromHash(hash: string): TrendTabId | null {
  const id = hash.replace(/^#/, "");
  return hashAliases[id] ?? null;
}

export const trendKpis = [
  {
    label: "미국 SF 도서 판매",
    value: "+93.1%",
    note: "전년 동기 대비 · 10월 3일까지",
    tone: "up" as const,
  },
  {
    label: "한국 주식·증권 도서",
    value: "+88.1%",
    note: "교보문고 · 1월 1일–5월 31일",
    tone: "up" as const,
  },
  {
    label: "한국 극장 상위 3편",
    value: "36.6%",
    note: "연간 매출 점유율 합계 · 조회 시점",
    tone: "flat" as const,
  },
  {
    label: "미국 자기계발 도서",
    value: "−23.0%",
    note: "전년 동기 대비 · 10월 3일까지",
    tone: "down" as const,
  },
];

export const trendGrowth: { name: string; change: number; market: TrendMarket }[] = [
  { name: "SF", change: 93.1, market: "US" },
  { name: "공포·오컬트", change: 39.4, market: "US" },
  { name: "성인 소설", change: 7.7, market: "US" },
  { name: "종이책 전체", change: -0.1, market: "US" },
  { name: "경제경영", change: -12.1, market: "US" },
  { name: "자기계발", change: -23, market: "US" },
  { name: "주식·증권", change: 88.1, market: "KR" },
  { name: "경제경영", change: 12.1, market: "KR" },
];

export const trendReadingNote =
  "세로 기준선 = 0%. 미국은 BookScan, 10월 3일까지. 한국은 교보문고, 5월 31일까지. 기간·유통 범위가 달라 국가 우열을 직접 비교하기에는 적합하지 않습니다.";

export const trendReadingObservation = {
  title: "같은 실용서, 다른 방향",
  body: "한국 경제경영 +12.1%, 미국 경제경영 −12.1%. 자산시장 참여, 전년 기저효과, 정보 소비 채널 이동을 함께 검증해야 합니다.",
};

export const trendSignals = [
  {
    title: "매체를 넘어 이동하는 관심",
    strength: "관찰 근거 강함",
    level: "strong" as const,
    observation: "영화 개봉 후 원작 소설이 한국 상반기 종합 1위에 올랐습니다.",
    limit: "영화 효과의 크기는 비영상화 비교군과 개봉 전후 데이터를 통해 추정해야 합니다.",
  },
  {
    title: "투자 학습 수요의 확대",
    strength: "판매 현상 확인",
    level: "seen" as const,
    observation: "한국 주식·증권 도서 판매량이 88.1% 증가했습니다.",
    limit: "상승장 참여 욕구인지 자산 불안 때문인지는 구매 동기 조사 없이는 확정할 수 없습니다.",
  },
  {
    title: "성취에서 서사와 관계로",
    strength: "검증할 가설",
    level: "hyp" as const,
    observation: "미국 자기계발은 감소하고 성인 소설은 증가했습니다.",
    limit: "기저효과, 무료 영상·AI로의 정보 소비 이동 등 다른 설명도 가능합니다.",
  },
  {
    title: "익숙한 IP의 선택 효과",
    strength: "검증할 가설",
    level: "hyp" as const,
    observation: "북미 상위 작품에 기존 원작·캐릭터가 집중됩니다.",
    limit: "관객 취향 외에 제작비·마케팅·상영관 배정도 결과를 설명할 수 있습니다.",
  },
];

export const trendFilms: Record<
  TrendMarket,
  { title: string; value: number; kind: string; released: string }[]
> = {
  US: [
    { title: "스파이더맨: 브랜드 뉴 데이", value: 958.776568, kind: "기존 슈퍼히어로 IP", released: "7월 31일" },
    { title: "오디세이", value: 625.595435, kind: "고전 원작", released: "7월 17일" },
    { title: "토이 스토리 5", value: 480.294461, kind: "장기 시리즈", released: "6월 19일" },
    { title: "슈퍼 마리오 갤럭시", value: 429.81461, kind: "게임 IP·시리즈", released: "4월 1일" },
    { title: "마이클", value: 372.303388, kind: "실존 인물 전기", released: "4월 24일" },
    { title: "프로젝트 헤일메리", value: 344.050007, kind: "소설 원작", released: "3월 20일" },
  ],
  KR: [
    { title: "왕과 사는 남자", value: 1693.3177, kind: "국내 역사 소재", released: "2월 4일" },
    { title: "오디세이", value: 1233.5269, kind: "고전 원작", released: "8월 5일" },
    { title: "스파이더맨: 브랜드 뉴 데이", value: 905.567, kind: "글로벌 프랜차이즈", released: "7월 29일" },
    { title: "군체", value: 595.4211, kind: "국내 장르영화", released: "5월 21일" },
    { title: "호프", value: 459.6591, kind: "국내 신작", released: "7월 15일" },
    { title: "프로젝트 헤일메리", value: 291.4895, kind: "소설 원작 · 국내 순위 9위", released: "3월 18일" },
  ],
};

export const trendFilmMeta: Record<
  TrendMarket,
  { title: string; unit: string; note: string; sourceIndex: number }
> = {
  US: {
    title: "북미 흥행 상위 6편",
    unit: "2026년 매출 · 백만 달러 (미국·캐나다)",
    note: "Box Office Mojo · 조회 시점 누적 매출. 상위 6편 모두 기존 원작·인물·캐릭터 기반으로 분류했습니다.",
    sourceIndex: 4,
  },
  KR: {
    title: "한국 흥행 주요 6편",
    unit: "2026년 관객 · 만 명 (한국 극장시장)",
    note: "KOBIZ · 상위 1–5위 및 비교용 프로젝트 헤일메리(9위). 관객 수와 매출 점유율은 서로 다른 지표입니다.",
    sourceIndex: 5,
  },
};

export const trendConcentration = {
  total: 36.64,
  parts: [
    { label: "왕과 사는 남자", share: 15.05 },
    { label: "오디세이", share: 12.97 },
    { label: "스파이더맨", share: 8.62 },
    { label: "나머지 작품", share: 63.36 },
  ],
  headline: "흥행 집중 ≠ 집중도 상승",
  body: "현재의 집중은 관찰되지만, 과거보다 심해졌는지는 같은 기간의 이전 연도 자료가 필요합니다. 관객 취향과 제작·배급 규모의 효과도 분리해야 합니다.",
};

export const trendBooks: {
  title: string;
  author: string;
  market: TrendMarket;
  vintage: TrendVintage;
  published: string;
  signal: string;
  theme: string;
  href?: string;
}[] = [
  {
    title: "Dear Debbie",
    author: "Freida McFadden",
    market: "US",
    vintage: "new",
    published: "2026.01.27",
    signal: "Circana YTD 상위 목록",
    theme: "관계·불만·복수",
  },
  {
    title: "The Calamity Club",
    author: "Kathryn Stockett",
    market: "US",
    vintage: "new",
    published: "2026.05.05",
    signal: "Circana 9월·YTD 상위 목록",
    theme: "여성 중심 서사",
  },
  {
    title: "Yesteryear",
    author: "Caro Claire Burke",
    market: "US",
    vintage: "new",
    published: "2026.04.07",
    signal: "Circana 9월 상위 10종",
    theme: "여성의 삶·생활 이미지",
  },
  {
    title: "돈의 방정식",
    author: "모건 하우절",
    market: "KR",
    vintage: "new",
    published: "2026.01.16 한국어판",
    signal: "교보문고 상반기 종합 8위",
    theme: "돈·소비·지위·만족",
    href: "https://www.yes24.com/product/goods/172506508",
  },
  {
    title: "나의 완벽한 장례식",
    author: "조현선",
    market: "KR",
    vintage: "new",
    published: "2026.01.21",
    signal: "교보문고 상반기 종합 10위권",
    theme: "상실·관계·회복",
    href: "https://m.yes24.com/goods/detail/173082175",
  },
  {
    title: "프로젝트 헤일메리",
    author: "앤디 위어",
    market: "KR",
    vintage: "old",
    published: "2021년 국내 출간",
    signal: "교보문고·예스24 상반기 1위",
    theme: "영상화·과학·협력",
  },
  {
    title: "Theo of Golden",
    author: "Allen Levi",
    market: "US",
    vintage: "old",
    published: "2026년 이전 출간",
    signal: "PW: 10월 초까지 약 180만 권",
    theme: "친절·관대함·연결",
  },
  {
    title: "모순",
    author: "양귀자",
    market: "KR",
    vintage: "old",
    published: "이전 출간",
    signal: "교보문고 상반기 종합 4위",
    theme: "삶·관계·선택",
  },
  {
    title: "싯다르타",
    author: "헤르만 헤세",
    market: "KR",
    vintage: "old",
    published: "이전 출간",
    signal: "교보문고 상반기 종합 6위",
    theme: "자기 탐색·고전 재발견",
  },
];

export const trendBookNote =
  "선정 사례 목록이며 전체 시장 순위표가 아닙니다. 한국어 번역판의 현지 출간과 원서 최초 출간은 다릅니다. Circana 공개 YTD 목록과 PW 누적 보도의 구성 차이가 확인되어 미국 작품의 정확한 연간 순위는 표시하지 않았습니다. 순위는 판매 권수가 아닙니다.";

export const trendMethods = [
  {
    title: "공급과 수요를 분리",
    body: "신간 종수는 출판사의 기대, 판매량은 독자의 선택입니다. AI 관련서 1,589종은 예스24 결산에서 보고된 공급 지표이며 판매량이 아닙니다.",
  },
  {
    title: "히트작 효과를 통제",
    body: "프로젝트 헤일메리의 영상화는 SF 판매에 영향을 줄 수 있습니다. 개봉 전후 변화와 비영상화 SF의 변화를 비교해야 장르 전반의 관심과 구분할 수 있습니다.",
  },
  {
    title: "변화에는 비교 기준이 필요",
    body: "2026년 단면만으로 장기 추세를 단정할 수 없습니다. 2023–2025년 동일 기간 자료와 개봉 후 경과 주수, 가격·마케팅 등을 함께 비교하는 것이 다음 단계입니다.",
  },
];

export const trendStatus =
  "앞선 분석에서 확인한 수치를 반영한 2026.11.02 스냅샷입니다. 차트는 필터에 반응하지만 원천 데이터 자동 수집은 연결하지 않았습니다. 영화 수치는 조회 시점 누적치이며 집계 지연이 있을 수 있습니다. OTT·전자책·오디오북은 현재 수치 비교에 포함하지 않습니다.";

export const trendSources: { label: string; url: string }[] = [
  {
    label: "미국 도서 · PW / 2026.10.13",
    url: "https://www.publishersweekly.com/pw/by-topic/industry-news/financial-reporting/article/101512-print-sales-stay-flat-through-september.html",
  },
  { label: "미국 신간 · Circana 공개 목록", url: "https://www.circana.com/post/top-10-books" },
  { label: "한국 도서 · 교보문고 결산 보도", url: "https://www.yna.co.kr/view/AKR20260608087300005" },
  { label: "AI 출간 · 예스24 결산 보도", url: "https://www.newsis.com/view/NISX20260601_0003652468" },
  { label: "북미 영화 · Box Office Mojo", url: "https://www.boxofficemojo.com/year/2026/" },
  {
    label: "한국 영화 · 영화진흥위원회 KOBIZ",
    url: "https://www.koreanfilm.or.kr/eng/news/boxOffice_Yearly.jsp?mode=BOXOFFICE_YEAR",
  },
  { label: "돈의 방정식 · 서지 정보", url: "https://www.yes24.com/product/goods/172506508" },
  { label: "나의 완벽한 장례식 · 서지 정보", url: "https://m.yes24.com/goods/detail/173082175" },
];

export function formatSignedPercent(value: number): string {
  const text = `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  return text.replace("-", "−");
}

export function formatFilmValue(value: number): string {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

export function marketLabel(market: TrendMarket): string {
  return market === "US" ? "미국" : "한국";
}

export function vintageLabel(vintage: TrendVintage): string {
  return vintage === "new" ? "현지 신간" : "구간";
}
