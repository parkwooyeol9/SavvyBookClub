# SavvyBookClub

한국어 중심 도서 추천 사이트. 국내·해외 베스트와 신간·서평 뉴스를 모아 보여주고, 개인 서평(국내서 + 영문 원서)을 제공합니다.

## 데이터 (API 키 없음)

매일 **한국시간 오전 9시** (`vercel.json` Cron: `0 0 * * *` UTC)에 공개 페이지를 크롤링합니다.

| 소스 | 내용 |
|------|------|
| 알라딘 HTML | 국내 베스트, 주목 신간 |
| Yes24 HTML | 국내 베스트, 신상품, 외국도서 베스트 |
| Open Library | 영문 일간 트렌딩 |
| 한겨레 / 조선일보 / Google 뉴스 RSS | 신간·서평·도서 논평 |

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

수동 동기화:

```bash
curl -X POST "http://localhost:3000/api/cron/sync-books"
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `CRON_SECRET` | Cron/수동 동기화 인증 (프로덕션 필수). Vercel는 `Authorization: Bearer <CRON_SECRET>`로 호출합니다. |

## Vercel

1. GitHub 저장소 연결, 프로젝트명 `savvybookclub`
2. `CRON_SECRET` 설정
3. Cron이 매일 09:00 KST에 `/api/cron/sync-books` 실행

## 서평 데이터

개인 서평은 [brunch.co.kr/@econbook](https://brunch.co.kr/@econbook) API/RSS를 매일 동기화합니다.
표지 이미지·별점·한줄평·요약을 가져와 `/reviews`와 홈 피처 섹션에 표시합니다.
