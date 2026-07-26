# SavvyBookClub

한국어 중심 도서 추천 사이트. 국내·해외 베스트를 모아 보여주고, 개인 서평(국내서 + 영문 원서)을 제공합니다.

배포 주소 목표: [savvybookclub.vercel.app](https://savvybookclub.vercel.app)

## 기능

- **메인**: 알라딘 Open API · Yes24 RSS · NYT Books API(또는 Open Library) 기반 베스트/신간/외서 목록
- **서평**: `content/reviews/*.md` 기반 개인 추천·서평 (샘플 포함, 이후 블로그 연동 예정)
- **Cron**: 6시간마다 `/api/cron/sync-books`로 목록 캐시 갱신

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

API 키가 없어도 시드 데이터로 UI를 확인할 수 있습니다.

## 환경 변수

| 변수 | 설명 |
|------|------|
| `ALADIN_TTB_KEY` | [알라딘 Open API](https://www.aladin.co.kr/ttb/api/) TTB 키 |
| `NYT_BOOKS_API_KEY` | [NYT Books API](https://developer.nytimes.com/) 키 (없으면 Open Library 폴백) |
| `CRON_SECRET` | Cron/수동 동기화 인증 시크릿 (프로덕션 필수) |

## 수동 동기화

```bash
curl -X POST "http://localhost:3000/api/cron/sync-books" \
  -H "Authorization: Bearer $CRON_SECRET"
```

로컬(`NODE_ENV !== production`)에서는 `CRON_SECRET` 없이도 동작합니다.

## Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. 프로젝트 이름을 `savvybookclub`로 두면 `savvybookclub.vercel.app` 사용
3. Environment Variables에 위 키 등록
4. 배포 후 Cron이 6시간마다 목록을 갱신합니다

## 서평 추가

`content/reviews/your-slug.md` 파일을 추가하세요.

```md
---
title: "책 제목"
author: "저자"
year: 2026
language: "ko" # 또는 "en"
isOriginalEnglish: false
coverUrl: "https://..."
excerpt: "한 줄 요약"
whyRead: "추천 이유"
purchaseUrl: "https://..."
tags: ["소설"]
---

본문 서평...
```

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Vercel Cron
