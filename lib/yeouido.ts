export type YeouidoSourceCategory = "lotto" | "food" | "hidden" | "cafe" | "walk";

export type YeouidoView = "all" | "book" | "food" | "cafe" | "walk" | "lotto";

export type YeouidoPlace = {
  id: string;
  name: string;
  cat: YeouidoSourceCategory;
  area: string;
  address: string;
  building: string;
  desc: string;
  menu: string;
  tags: string[];
  source: string;
  sourceName: string;
  note: string;
  bookCafe?: boolean;
  shelf?: string;
  wins?: { first: string; second: string };
};

export type YeouidoRoute = {
  id: string;
  eyebrow: string;
  title: string;
  stops: string[];
};

export const yeouidoChecked = "2026.10.13";

export const yeouidoGuideUrl = "https://yeouido-myeongdang.savvyetf.chatgpt.site/";

export const yeouidoHash = "#yeoidoMyongDang";

export function isYeouidoHash(hash: string): boolean {
  return hash === "#yeoidoMyongDang" || hash === "#yeouido" || hash === "#yeoido";
}

export const yeouidoCoords: Record<string, { lat: number; lng: number }> = {
  hana: { lat: 37.5212, lng: 126.9247 },
  jinju: { lat: 37.52085, lng: 126.9267 },
  heejeong: { lat: 37.5263, lng: 126.9316 },
  transport: { lat: 37.5232, lng: 126.9273 },
  daedong: { lat: 37.5215, lng: 126.9268 },
  brighton: { lat: 37.5252, lng: 126.9305 },
  jeongin: { lat: 37.53, lng: 126.9212 },
  hwamok: { lat: 37.519, lng: 126.9313 },
  stand: { lat: 37.5215, lng: 126.924 },
  jinjin: { lat: 37.52025, lng: 126.9297 },
  comma: { lat: 37.5213, lng: 126.9282 },
  yeouidocoffee: { lat: 37.5182, lng: 126.9329 },
  keepthat: { lat: 37.5223, lng: 126.925 },
  teddy: { lat: 37.5259, lng: 126.9284 },
  terarosa: { lat: 37.5253, lng: 126.9254 },
  bread05: { lat: 37.5222, lng: 126.9345 },
  hangang: { lat: 37.5284, lng: 126.9331 },
  mulbit: { lat: 37.531, lng: 126.9293 },
  saetgang: { lat: 37.5166, lng: 126.9278 },
  seouldal: { lat: 37.5269, lng: 126.9209 },
  yeouidopark: { lat: 37.5251, lng: 126.9197 },
  gayang: { lat: 37.5206, lng: 126.9327 },
  izawa: { lat: 37.5211, lng: 126.9249 },
  salady: { lat: 37.521, lng: 126.925 },
  ido: { lat: 37.52152, lng: 126.92287 },
  yurim: { lat: 37.52152, lng: 126.92287 },
  nambo: { lat: 37.52152, lng: 126.92287 },
  fault: { lat: 37.52152, lng: 126.92287 },
  mutan: { lat: 37.52152, lng: 126.92287 },
  puerco: { lat: 37.52152, lng: 126.92287 },
  ohansu: { lat: 37.5225, lng: 126.9232 },
  byeolmi: { lat: 37.52085, lng: 126.9267 },
  yukdang: { lat: 37.52085, lng: 126.9267 },
  eden: { lat: 37.5188, lng: 126.926 },
  goryeo: { lat: 37.5215, lng: 126.9268 },
  cuisine: { lat: 37.5215, lng: 126.9268 },
  obok: { lat: 37.5241, lng: 126.9259 },
  jingawa: { lat: 37.5241, lng: 126.9259 },
  arc: { lat: 37.5214, lng: 126.923 },
  gangbyeon: { lat: 37.5345, lng: 126.917 },
  seowon: { lat: 37.5175, lng: 126.931 },
};

export function yeouidoPoint(
  id: string,
  ids: string[],
): { lat: number; lng: number } | null {
  const base = yeouidoCoords[id];
  if (!base) return null;
  const same = ids.filter((other) => {
    const point = yeouidoCoords[other];
    return (
      point &&
      Math.abs(point.lat - base.lat) < 0.00001 &&
      Math.abs(point.lng - base.lng) < 0.00001
    );
  });
  const index = Math.max(0, same.indexOf(id));
  if (same.length < 2) return base;
  const angle = (index / same.length) * Math.PI * 2;
  const radius = 0.00022;
  return {
    lat: base.lat + Math.sin(angle) * radius,
    lng: base.lng + Math.cos(angle) * radius,
  };
}

export const yeouidoIntents: {
  id: Exclude<YeouidoView, "all">;
  icon: string;
  title: string;
  hint: string;
}[] = [
  { id: "food", icon: "♨", title: "점심 먹기", hint: "식사 장소 찾기" },
  { id: "book", icon: "▤", title: "책 읽기", hint: "북카페 4곳" },
  { id: "cafe", icon: "☕", title: "커피 한 잔", hint: "잠깐 쉬어가기" },
  { id: "walk", icon: "⌁", title: "산책하기", hint: "공원과 전망" },
  { id: "lotto", icon: "✳", title: "복권 판매점", hint: "위치와 당첨 이력" },
];

const editorOrder = [
  "hana",
  "jinju",
  "heejeong",
  "transport",
  "daedong",
  "brighton",
  "jeongin",
  "hwamok",
  "stand",
  "jinjin",
  "comma",
  "yeouidocoffee",
  "keepthat",
  "teddy",
  "terarosa",
  "bread05",
  "hangang",
  "mulbit",
  "saetgang",
  "seouldal",
  "yeouidopark",
  "gayang",
  "izawa",
  "salady",
  "ido",
  "yurim",
  "nambo",
  "fault",
  "mutan",
  "puerco",
  "ohansu",
  "byeolmi",
  "yukdang",
  "eden",
  "goryeo",
  "cuisine",
  "obok",
  "jingawa",
  "arc",
  "gangbyeon",
  "seowon",
];

export const yeouidoPlaces: YeouidoPlace[] = [
  {
    id: "arc",
    name: "아크앤북 TP타워여의도점",
    cat: "cafe",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 2층",
    building: "TP타워",
    desc: "책을 고르는 서점과 카페 적당을 함께 둘러보는 공간.",
    menu: "신간 탐색과 책 구매",
    tags: ["북카페", "서점"],
    source: "https://www.diningcode.com/profile.php?rid=emksA5ioKaYC",
    sourceName: "다이닝코드 · 지점 안내",
    note: "서점 판매 도서의 카페 반입·열람 범위는 매장에 확인하세요.",
    bookCafe: true,
    shelf: "소설·영어 원서·자기계발서",
  },
  {
    id: "gangbyeon",
    name: "강변서재",
    cat: "cafe",
    area: "서여의도",
    address: "서울 영등포구 의사당대로 1 국회 사랑재 옆 건물 2층",
    building: "국회",
    desc: "한강을 바라보며 사서 추천 도서를 만나는 독서 공간.",
    menu: "한강 전망과 가벼운 독서",
    tags: ["북카페", "한강 전망"],
    source: "https://mediahub.seoul.go.kr/archives/2014924",
    sourceName: "서울시 · 강변서재",
    note: "국회 출입 방법과 카페 운영 공지를 방문 전에 확인하세요.",
    bookCafe: true,
    shelf: "다양한 분야·어린이 도서",
  },
  {
    id: "comma",
    name: "카페 꼼마 여의도신영증권점",
    cat: "cafe",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로8길 16 신영증권 본점 1·2층",
    building: "신영증권",
    desc: "책과 커피를 함께 고르는 북카페. 식사 뒤 독서를 위한 후보입니다.",
    menu: "여러 분야를 골라 읽는 독서",
    tags: ["북카페", "책 읽기"],
    source: "https://cafecomma.com/branchlist",
    sourceName: "카페꼼마 · 공식 지점",
    note: "열람 가능 도서와 좌석 이용 기준은 현장 안내를 확인하세요.",
    bookCafe: true,
    shelf: "문학·시·인문·예술·경제",
  },
  {
    id: "seowon",
    name: "북카페 서원",
    cat: "cafe",
    area: "샛강·KBS별관",
    address: "서울 영등포구 여의대방로 372 여의도복지관 4층",
    building: "여의도복지관",
    desc: "센터 소개 자료로 찾아낸 동네 북카페. 현재 이용 안내를 확인하고 방문하세요.",
    menu: "지역 커뮤니티의 독서·휴식",
    tags: ["북카페", "지역 공간"],
    source: "https://50plus.or.kr/ydp/detail.do?id=35090849",
    sourceName: "영등포50플러스센터 · 2023년 소개",
    note: "과거 소개 자료이므로 운영일·이용 대상·출입 안내를 센터에 확인하세요.",
    bookCafe: true,
    shelf: "분야 구분 미확인",
  },
  {
    id: "jinju",
    name: "진주집",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 33 지하 1층",
    building: "여의도백화점",
    desc: "여의도백화점 지하에서 만나는 콩국수. 처음 여의도를 탐색한다면 살펴볼 대표 맛집입니다.",
    menu: "콩국수 · 닭칼국수",
    tags: ["대표 맛집", "지하상가"],
    source: "https://access.visitkorea.or.kr/food/detail.do?cotId=8ff9fb62-bbda-45d9-a1d6-72a1803d8b46",
    sourceName: "한국관광공사 · 열린관광",
    note: "관광공사 소개에 실린 장소입니다.",
  },
  {
    id: "heejeong",
    name: "희정식당",
    cat: "hidden",
    area: "여의나루·한강",
    address: "서울 영등포구 여의나루로 117 서울상가 지하",
    building: "서울상가",
    desc: "서울상가 안으로 한 걸음 더. 부대찌개와 티본스테이크를 함께 살펴볼 수 있는 식당입니다.",
    menu: "부대찌개 · 티본스테이크",
    tags: ["숨은 맛집 후보", "상가 속 발견"],
    source: "https://www.diningcode.com/profile.php?rid=mEZBPtxoG4lt",
    sourceName: "다이닝코드 · 희정식당",
    note: "상가 내부 입지에 따른 편집 분류입니다. 인지도가 낮다는 의미는 아닙니다.",
  },
  {
    id: "daedong",
    name: "대동문",
    cat: "hidden",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 30 백상빌딩 2층 210호",
    building: "백상빌딩",
    desc: "백상빌딩 2층에 자리한 이북음식 식당. 어복쟁반과 평양냉면으로 한 끼를 계획해 보세요.",
    menu: "어복쟁반 · 평양냉면",
    tags: ["숨은 맛집 후보", "상가 2층"],
    source: "https://www.diningcode.com/profile.php?rid=WEh6gjz1tVd6",
    sourceName: "다이닝코드 · 대동문",
    note: "최신 영업일·예약 가능 여부는 매장에 확인하세요.",
  },
  {
    id: "jeongin",
    name: "정인면옥",
    cat: "food",
    area: "서여의도",
    address: "서울 영등포구 국회대로76길 10 1층",
    building: "기독교침례회총회빌딩",
    desc: "국회의사당 쪽으로 걷는 날의 평양냉면. 서여의도에서 찾을 수 있는 대표 면 요리 식당입니다.",
    menu: "평양냉면",
    tags: ["대표 맛집", "서여의도"],
    source: "https://www.diningcode.com/profile.php?rid=LLxOoK0VOe2k",
    sourceName: "다이닝코드 · 정인면옥",
    note: "가격·브레이크타임은 최신 매장 안내를 확인하세요.",
  },
  {
    id: "hwamok",
    name: "화목순대국",
    cat: "food",
    area: "샛강·KBS별관",
    address: "서울 영등포구 여의대방로 383 경도빌딩 1층",
    building: "경도빌딩",
    desc: "KBS별관 주변에서 만나는 순대국 한 그릇. 내장 요리를 좋아한다면 살펴볼 만한 곳입니다.",
    menu: "순대국 · 내장탕",
    tags: ["대표 맛집", "순대국"],
    source: "https://www.diningcode.com/profile.php?rid=OGEbPVILTEHb",
    sourceName: "다이닝코드 · 화목순대국",
    note: "대기시간과 영업 여부는 실시간 정보가 아닙니다.",
  },
  {
    id: "jinjin",
    name: "진진만두",
    cat: "food",
    area: "샛강·KBS별관",
    address: "서울 영등포구 국제금융로8길 34 오륜빌딩 3층",
    building: "오륜빌딩",
    desc: "빌딩 3층에서 찾아보는 개성만두. 만둣국과 어복쟁반으로 소개된 여의도의 식당입니다.",
    menu: "만둣국 · 어복쟁반",
    tags: ["관광정보 수록"],
    source: "https://stage-kr.visitseoul.net/restaurants/진진만두-KR/KOP003016",
    sourceName: "서울관광재단 · Visit Seoul",
    note: "관광정보 원문이 오래된 자료이므로 현재 상호·층수·영업 상태를 재확인하세요.",
  },
  {
    id: "gayang",
    name: "가양칼국수 버섯매운탕",
    cat: "food",
    area: "샛강·KBS별관",
    address: "서울 영등포구 국제금융로 86 롯데캐슬아이비 지하 1층 135호",
    building: "롯데캐슬아이비",
    desc: "버섯매운탕과 칼국수를 함께 살펴볼 수 있는 지하상가 식당입니다.",
    menu: "버섯매운탕 · 칼국수",
    tags: ["지하상가", "점심"],
    source: "https://www.diningcode.com/profile.php?rid=WolC7kH1KJFk",
    sourceName: "다이닝코드 · 가양칼국수",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "izawa",
    name: "이자와 여의도점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 여의나루로 42 여의도종합상가 2층 203·204호",
    building: "여의도종합상가",
    desc: "여의도종합상가에서 찾는 규카츠 정식. 역 주변 점심 후보로 담았습니다.",
    menu: "규카츠 · 정식",
    tags: ["점심", "상가 2층"],
    source: "https://www.tabling.co.kr/place/677ccb9066de5f06987d776c",
    sourceName: "테이블링 · 이자와",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "salady",
    name: "샐러디 여의도역점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 여의나루로 42",
    building: "여의도종합상가",
    desc: "샐러드와 랩처럼 다른 종류의 점심을 찾는 날의 선택지입니다.",
    menu: "샐러드 · 랩",
    tags: ["점심", "가벼운 식사"],
    source: "https://www.tabling.co.kr/place/677ccfca66de5f069884e157",
    sourceName: "테이블링 · 샐러디",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "yeouidocoffee",
    name: "여의도커피",
    cat: "cafe",
    area: "샛강·KBS별관",
    address: "서울 영등포구 여의대방로 386 진주상가 2층 11호",
    building: "진주상가",
    desc: "진주상가 2층에서 발견하는 로스터리. 커피를 중심으로 동네를 둘러보세요.",
    menu: "커피 · 아인슈페너",
    tags: ["로스터리", "상가 2층"],
    source: "https://eng.cafeshow.com/eng/partners/enjoycafe_view.asp?idx=617",
    sourceName: "서울카페쇼 · 파트너 카페",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "keepthat",
    name: "킵댓 여의도점",
    cat: "cafe",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로2길 32 여의도파이낸스타워 1층",
    building: "여의도파이낸스타워",
    desc: "바닐라라떼가 소개된 카페. 여의도역 주변의 커피 탐색에 추가했습니다.",
    menu: "커피 · 바닐라라떼",
    tags: ["라떼", "금융가 카페"],
    source: "https://www.diningcode.com/profile.php?rid=mqJc1kEwP4gr",
    sourceName: "다이닝코드 · 킵댓",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "teddy",
    name: "테디뵈르하우스 더현대서울점",
    cat: "cafe",
    area: "여의나루·한강",
    address: "서울 영등포구 여의대로 108 더현대서울 지하 1층",
    building: "더현대서울",
    desc: "베이커리를 고르는 즐거움. 더현대서울 지하 식품관에서 들를 수 있는 빵집입니다.",
    menu: "크루아상 · 베이커리",
    tags: ["디저트", "베이커리"],
    source: "https://pf.kakao.com/_epKQxj/104697888",
    sourceName: "테디뵈르하우스 · 공식 채널",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "terarosa",
    name: "테라로사 IFC몰점",
    cat: "cafe",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로 10 IFC몰 L2 259호",
    building: "IFC몰",
    desc: "IFC몰 안에서 커피 한 잔. 브랜드 공식 매장 안내를 바탕으로 등록했습니다.",
    menu: "커피",
    tags: ["커피", "몰 안에서"],
    source: "https://terarosa.com/store/",
    sourceName: "테라로사 · 공식 매장",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "bread05",
    name: "브레드05 여의도",
    cat: "cafe",
    area: "여의나루·한강",
    address: "서울 영등포구 국제금융로7길 22",
    building: "국제금융로7길",
    desc: "한강 나들이에 앞서 빵을 고르는 후보. 여의도 주소의 매장으로 구분했습니다.",
    menu: "빵 · 베이커리",
    tags: ["베이커리", "디저트"],
    source: "https://www.diningcode.com/profile.php?rid=Xcw06AQcdQQc",
    sourceName: "다이닝코드 · 브레드05",
    note: "현재 영업 여부, 좌석, 가격과 메뉴는 방문 전 매장에 확인하세요.",
  },
  {
    id: "hangang",
    name: "여의도한강공원",
    cat: "walk",
    area: "여의나루·한강",
    address: "서울 영등포구 여의동로 330",
    building: "여의도한강공원",
    desc: "강변을 따라 잠시 걷는 시간. 위치는 넓은 공원의 대표 지점입니다.",
    menu: "강변 산책 · 한강 조망",
    tags: ["산책", "한강"],
    source: "https://hangang.seoul.go.kr/www/contents/669.do?mid=473",
    sourceName: "서울시 미래한강본부",
    note: "출입구, 기상 통제, 시설 운영 여부는 공식 안내에서 확인하세요.",
  },
  {
    id: "mulbit",
    name: "물빛광장",
    cat: "walk",
    area: "여의나루·한강",
    address: "서울 영등포구 여의도한강공원 마포대교 남단 하류",
    building: "여의도한강공원",
    desc: "한강공원 안에서 쉬어갈 수 있는 광장. 계절별 분수 운영은 방문 전 확인하세요.",
    menu: "광장 · 강변 휴식",
    tags: ["한강", "계절 운영"],
    source: "https://hangang.seoul.go.kr/www/contents/669.do?mid=473",
    sourceName: "서울시 미래한강본부",
    note: "출입구, 기상 통제, 시설 운영 여부는 공식 안내에서 확인하세요.",
  },
  {
    id: "saetgang",
    name: "여의도샛강생태공원",
    cat: "walk",
    area: "샛강·KBS별관",
    address: "서울 영등포구 여의도동 49 일대",
    building: "샛강생태공원",
    desc: "빌딩 숲 옆의 생태공원. 지정된 산책로를 따라 자연을 관찰하는 코스입니다.",
    menu: "생태 산책",
    tags: ["산책", "자연"],
    source: "https://hangang.seoul.go.kr/www/contents/669.do?mid=473",
    sourceName: "서울시 미래한강본부",
    note: "출입구, 기상 통제, 시설 운영 여부는 공식 안내에서 확인하세요.",
  },
  {
    id: "seouldal",
    name: "서울달",
    cat: "walk",
    area: "서여의도",
    address: "서울 영등포구 여의공원로 68 여의도공원 서울달 탑승장",
    building: "여의도공원",
    desc: "계류식 헬륨기구에서 여의도 전망을 보는 체험. 운항 여부와 요금은 공식 안내를 확인하세요.",
    menu: "유료 전망 체험",
    tags: ["전망", "체험"],
    source: "https://stage-kr.visitseoul.net/entertainment/2024SEOULDAL/KOPrn1wrn",
    sourceName: "서울관광재단 · Visit Seoul",
    note: "날씨에 따라 운항이 달라집니다. 요금과 예약은 공식 안내를 확인하세요.",
  },
  {
    id: "yeouidopark",
    name: "여의도공원",
    cat: "walk",
    area: "서여의도",
    address: "서울 영등포구 여의공원로 68",
    building: "여의도공원",
    desc: "동여의도와 서여의도 사이에서 걷는 휴식. 서울달 체험과 함께 살펴볼 수 있습니다.",
    menu: "공원 산책",
    tags: ["산책", "공원"],
    source: "https://mediahub.seoul.go.kr/archives/2013150",
    sourceName: "서울시 · 내 손안에 서울",
    note: "출입구와 시설 운영 여부는 공식 안내에서 확인하세요.",
  },
  {
    id: "hana",
    name: "하나복권",
    cat: "lotto",
    area: "여의도역·금융가",
    address: "서울 영등포구 여의나루로 42 가로판매점",
    building: "여의도종합상가 앞",
    desc: "여의도역 주변에서 찾아볼 수 있는 가로판매점. 출퇴근 동선과 함께 살펴보세요.",
    menu: "로또 6/45",
    tags: ["가로판매점", "당첨 이력 출처 있음"],
    source: "https://todaylotto.kr/store/8375ceeab5412b31",
    sourceName: "투데이로또 · 판매점 안내",
    note: "민간 출처의 당첨 이력은 참고 정보입니다. 현재 판매 여부는 방문 전 확인하세요.",
    wins: { first: "4건", second: "10~11건" },
  },
  {
    id: "transport",
    name: "교통카드판매대",
    cat: "lotto",
    area: "여의도역·금융가",
    address: "서울 영등포구 여의나루로 71",
    building: "여의나루로",
    desc: "여의나루로의 복권 판매점. 비슷한 이름의 가판대가 있으니 도로명 주소를 확인하세요.",
    menu: "로또 6/45",
    tags: ["가로판매점", "주소 교차 확인"],
    source: "https://lottis.kr/stores/4187",
    sourceName: "로티스 · 교통카드판매대",
    note: "민간 목록의 당첨 인원과 공식 집계는 대조하지 않았습니다.",
    wins: { first: "1건", second: "12건" },
  },
  {
    id: "brighton",
    name: "GS25 브라이튼 여의도1호",
    cat: "lotto",
    area: "여의나루·한강",
    address: "서울 영등포구 국제금융로 39 1층 126~128호",
    building: "브라이튼 여의도",
    desc: "브라이튼 여의도 상가의 편의점 판매점. 복권 판매점 목록에서 확인된 장소입니다.",
    menu: "로또 6/45",
    tags: ["편의점", "당첨 이력 미확인"],
    source: "https://lottologics.com/stores/서울특별시/영등포구/여의도동",
    sourceName: "로또로직스 · 여의도동 판매점",
    note: "목록상 이력 없음은 무당첨이 아닙니다. 현재 판매 여부는 재확인이 필요합니다.",
  },
  {
    id: "stand",
    name: "가로판매점",
    cat: "lotto",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로2길 37, 3번출구 앞 가판대",
    building: "에스트레뉴 앞",
    desc: "여의도역 3번 출구 앞 주소로 등록된 판매점. 하나복권과 별도의 상호·주소로 구분했습니다.",
    menu: "로또 6/45",
    tags: ["여의도역", "공식 대조 필요"],
    source: "https://lottologics.com/stores/서울특별시/영등포구/여의도동",
    sourceName: "로또로직스 · 여의도동 판매점",
    note: "과거 목록일 수 있어 이전·폐점 여부와 현재 판매 상태를 확인해야 합니다.",
    wins: { first: "1건", second: "6건" },
  },
  {
    id: "ido",
    name: "이도곰탕 여의도직영점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 1층 B111",
    building: "TP타워",
    desc: "TP타워에서 따뜻한 국물 한 그릇을 찾을 때 살펴볼 곳.",
    menu: "곰탕",
    tags: ["곰탕", "TP타워"],
    source: "https://www.tabling.co.kr/place/677cd79166de5f069892fcdc",
    sourceName: "테이블링 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "yurim",
    name: "유림면 여의도TP타워점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 1층 B103",
    building: "TP타워",
    desc: "메밀 면 요리로 고르는 역 주변 점심 후보.",
    menu: "메밀국수 · 비빔메밀",
    tags: ["메밀국수", "TP타워"],
    source: "https://www.tabling.co.kr/place/677cd77c66de5f069892d633",
    sourceName: "테이블링 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "nambo",
    name: "남보 여의도TP타워점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 1층 B104",
    building: "TP타워",
    desc: "TP타워 지하에서 베트남식 면 요리를 고를 수 있는 식당.",
    menu: "쌀국수 · 분보남보",
    tags: ["쌀국수", "TP타워"],
    source: "https://www.diningcode.com/profile.php?rid=4TNaXQfLrjum",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "fault",
    name: "폴트버거 여의도TP타워점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 1층",
    building: "TP타워",
    desc: "면이나 밥 대신 버거가 생각나는 날의 선택지.",
    menu: "수제버거 · 프라이즈",
    tags: ["수제버거", "TP타워"],
    source: "https://www.tabling.co.kr/place/677cd84966de5f0698943e35",
    sourceName: "테이블링 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "mutan",
    name: "무탄 여의도점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 2층 201·202호",
    building: "TP타워",
    desc: "여럿이 중식 요리를 나눠 먹는 식사를 계획해 보세요.",
    menu: "스테이크 트러플 자장면 · 중식 요리",
    tags: ["스테이크 트러플 자장면", "TP타워"],
    source: "https://www.diningcode.com/profile.php?rid=5tS4bhWoKyyQ",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "puerco",
    name: "푸에르코 여의도 TP타워점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 96 TP타워 지하 2층",
    building: "TP타워",
    desc: "TP타워의 고기구이 식당. 여의도웨스트점 안내와 함께 확인했습니다.",
    menu: "이베리코 돼지고기구이",
    tags: ["이베리코 돼지고기구이", "TP타워"],
    source: "https://www.diningcode.com/profile.php?rid=SLmlSXJ2g36z",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "ohansu",
    name: "오한수우육면가 오투빌딩점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 83 오투타워 지하 1층",
    building: "오투타워",
    desc: "국물 면과 군만두를 함께 살펴볼 수 있는 지하 식당.",
    menu: "우육탕면 · 완탕면 · 군만두",
    tags: ["우육탕면", "오투타워"],
    source: "https://www.diningcode.com/profile.php?rid=ELgwNSVHiypG",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "byeolmi",
    name: "별미볶음점 본점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 33 여의도백화점 지하 1층",
    building: "여의도백화점",
    desc: "여의도백화점 지하에서 볶음 요리를 고르는 점심 후보.",
    menu: "제육볶음 · 오징어볶음",
    tags: ["제육볶음", "여의도백화점"],
    source: "https://www.tabling.co.kr/place/677cc77f66de5f069874d38a",
    sourceName: "테이블링 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "yukdang",
    name: "육당당",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 33 여의도백화점 지하 1층 36·37호",
    building: "여의도백화점",
    desc: "비빔밥 한 그릇을 찾는 날 들여다볼 지하상가 식당.",
    menu: "육회비빔밥 · 소불고기비빔밥",
    tags: ["육회비빔밥", "여의도백화점"],
    source: "https://www.diningcode.com/profile.php?rid=L1e0W0ZYq1Oz",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "eden",
    name: "에덴식당",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 의사당대로 127 롯데캐슬엠파이어 B006 (공개 목록 기준 · 위치 확인 필요)",
    building: "위치 확인 필요",
    desc: "공개 목록과 방문 후기에 주소 차이가 있어 위치 확인이 필요한 후보입니다.",
    menu: "한식 · 백반",
    tags: ["한식", "위치 확인 필요"],
    source: "https://www.diningcode.com/profile.php?rid=QJOhKtS1udwP",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "goryeo",
    name: "고려정",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 30 백상빌딩 1층 116호",
    building: "백상빌딩",
    desc: "백상빌딩에서 고기구이를 살펴볼 수 있는 식당.",
    menu: "차돌박이 · 소고기구이",
    tags: ["차돌박이", "백상빌딩"],
    source: "https://www.diningcode.com/profile.php?rid=HWnFgr6gd3yc",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "cuisine",
    name: "퀴진 알",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로6길 30 백상빌딩 2층 202·203호",
    building: "백상빌딩",
    desc: "백상빌딩 2층의 양식 식당. 파스타와 리조토를 찾는 날의 후보.",
    menu: "파스타 · 리조토",
    tags: ["파스타", "백상빌딩"],
    source: "https://www.diningcode.com/profile.php?rid=Hye2vTp7KAdV",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "obok",
    name: "오복수산 여의도점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로2길 17 씨티플라자 3층",
    building: "씨티플라자",
    desc: "해산물 덮밥을 중심으로 살펴볼 수 있는 씨티플라자 식당.",
    menu: "카이센동 · 사시미",
    tags: ["카이센동", "씨티플라자"],
    source: "https://www.diningcode.com/profile.php?rid=1KRgbBNuk1rV",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
  {
    id: "jingawa",
    name: "진가와 여의도점",
    cat: "food",
    area: "여의도역·금융가",
    address: "서울 영등포구 국제금융로2길 17 씨티플라자 3층",
    building: "씨티플라자",
    desc: "일본식 면 요리부터 코스 식사까지 비교해 볼 후보.",
    menu: "일본식 면 · 사시미 · 코스",
    tags: ["일본식 면", "씨티플라자"],
    source: "https://www.diningcode.com/profile.php?rid=8nRyY9BmiiPK",
    sourceName: "다이닝코드 · 매장 안내",
    note: "현재 영업 여부와 메뉴, 브레이크타임은 방문 전 매장 안내를 확인하세요.",
  },
];

export const yeouidoRoutes: YeouidoRoute[] = [
  {
    id: "lunch-book",
    eyebrow: "식사 + 독서",
    title: "점심 뒤, 책 한 페이지",
    stops: ["진주집", "카페 꼼마 여의도신영증권점"],
  },
  {
    id: "bread-river",
    eyebrow: "디저트 + 산책",
    title: "빵 한 봉지와 강바람",
    stops: ["브레드05 여의도", "여의도한강공원"],
  },
  {
    id: "soup-coffee-park",
    eyebrow: "점심 + 커피 + 산책",
    title: "국밥, 커피, 샛강",
    stops: ["화목순대국", "여의도커피", "여의도샛강생태공원"],
  },
];

export function yeouidoViewOf(place: YeouidoPlace): Exclude<YeouidoView, "all"> {
  if (place.bookCafe) return "book";
  if (place.cat === "food" || place.cat === "hidden") return "food";
  if (place.cat === "cafe") return "cafe";
  if (place.cat === "walk") return "walk";
  return "lotto";
}

export function yeouidoKind(place: YeouidoPlace): string {
  if (place.bookCafe) return "북카페";
  if (place.cat === "hidden") return "숨은 맛집 후보";
  if (place.cat === "food") return "식사 명당";
  if (place.cat === "cafe") return "카페·디저트";
  if (place.cat === "walk") return "산책·전망";
  return "복권 판매점";
}

export function yeouidoTone(
  place: YeouidoPlace,
): "food" | "hidden" | "cafe" | "walk" | "lotto" {
  if (place.cat === "hidden") return "hidden";
  if (place.cat === "food") return "food";
  if (place.cat === "cafe") return "cafe";
  if (place.cat === "walk") return "walk";
  return "lotto";
}

export function placesForView(view: YeouidoView): YeouidoPlace[] {
  const places =
    view === "all"
      ? yeouidoPlaces
      : yeouidoPlaces.filter((place) => yeouidoViewOf(place) === view);
  return [...places].sort(
    (a, b) => editorOrder.indexOf(a.id) - editorOrder.indexOf(b.id),
  );
}

export function yeouidoMapHref(place: YeouidoPlace): string {
  const query = `${place.name} ${place.address}`;
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}
