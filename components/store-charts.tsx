"use client";

import { useState } from "react";
import { BookRail } from "@/components/book-rail";
import { CategoryChartRail } from "@/components/category-chart-rail";
import { ChartBookRail } from "@/components/chart-book-rail";
import type { ChartedBooks } from "@/lib/books/chart-periods";
import type { Book, CategoryBestsellers } from "@/lib/books/types";

type StoreId = "aladin" | "yes24" | "foreign" | "english" | "new";

const stores: { id: StoreId; label: string }[] = [
  { id: "aladin", label: "알라딘" },
  { id: "yes24", label: "Yes24" },
  { id: "foreign", label: "외국도서" },
  { id: "english", label: "영문" },
  { id: "new", label: "신간" },
];

export function StoreCharts({
  aladin,
  aladinCategories,
  categories,
  yes24,
  foreign,
  english,
  fresh,
}: {
  aladin: ChartedBooks;
  aladinCategories: CategoryBestsellers;
  categories: { id: string; label: string }[];
  yes24: ChartedBooks;
  foreign: ChartedBooks;
  english: Book[];
  fresh: Book[];
}) {
  const [store, setStore] = useState<StoreId>("aladin");

  return (
    <section id="store-charts" className="store-charts" aria-labelledby="store-charts-heading">
      <div className="book-rail__heading">
        <p className="home-kmap__eyebrow">BOOKSTORE CHARTS</p>
        <h2 id="store-charts-heading">서점 차트</h2>
        <p>
          알라딘·Yes24·외국도서·영문·신간을 한 자리에서 바꿉니다. 숫자는 만화
          등을 걸러낸 뒤 다시 매긴 번호가 아니라 서점 원래 순위이고, 전일과
          다르면 ▲▼가 붙습니다.
        </p>
      </div>
      <div className="store-tabs" role="tablist" aria-label="서점 선택">
        {stores.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={store === item.id}
            className={`store-tab${store === item.id ? " is-active" : ""}`}
            onClick={() => setStore(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {store === "aladin" ? (
        <CategoryChartRail
          embedded
          title="알라딘 국내 베스트"
          subtitle="분야별 · 일간·주간·월간"
          allCharted={aladin}
          categoryCharted={aladinCategories}
          categories={categories}
        />
      ) : null}
      {store === "yes24" ? (
        <ChartBookRail
          embedded
          title="Yes24 국내 베스트"
          subtitle="알라딘과 다른 순위도 함께"
          charted={yes24}
        />
      ) : null}
      {store === "foreign" ? (
        <ChartBookRail
          embedded
          title="Yes24 외국도서 베스트"
          subtitle="일본어 서적·잡지 제외"
          charted={foreign}
          defaultPeriod="weekly"
        />
      ) : null}
      {store === "english" ? (
        <BookRail
          embedded
          title="영문 베스트 · 논픽션"
          subtitle="저명한 저자·리뷰 많은 영문 논픽션"
          books={english}
          limit={8}
        />
      ) : null}
      {store === "new" ? (
        <BookRail embedded title="주목할 신간" subtitle="알라딘·Yes24 신간" books={fresh} />
      ) : null}
    </section>
  );
}
