"use client";

import { useState } from "react";
import { BookCover } from "@/components/book-rail";
import {
  chartPeriodDescriptions,
  chartPeriodLabels,
  pickChartBooks,
  type ChartedBooks,
  type ChartPeriod,
} from "@/lib/books/chart-periods";
import type { CategoryBestsellers } from "@/lib/books/types";

interface Category {
  id: string;
  label: string;
}

const periods: ChartPeriod[] = ["daily", "weekly", "monthly"];

export function CategoryChartRail({
  title,
  subtitle,
  allCharted,
  categoryCharted,
  categories,
  limit = 8,
  defaultPeriod = "daily",
}: {
  title: string;
  subtitle?: string;
  allCharted: ChartedBooks;
  categoryCharted: CategoryBestsellers;
  categories: Category[];
  limit?: number;
  defaultPeriod?: ChartPeriod;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);

  const charted =
    activeCategory === "all"
      ? allCharted
      : categoryCharted[activeCategory] ?? { daily: [], weekly: [], monthly: [] };

  const books = pickChartBooks(charted, period).slice(0, limit);

  return (
    <section className="book-rail">
      <div className="book-rail__heading book-rail__heading--chart">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
          <p className="book-rail__period-note">
            {chartPeriodDescriptions[period]}
          </p>
        </div>
        <div
          className="chart-period-tabs"
          role="tablist"
          aria-label={`${title} 차트 기간`}
        >
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={period === item}
              className={`chart-period-tab${period === item ? " is-active" : ""}`}
              onClick={() => setPeriod(item)}
            >
              {chartPeriodLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="category-tabs" role="tablist" aria-label="분야 선택">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          className={`category-tab${activeCategory === "all" ? " is-active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`category-tab${activeCategory === cat.id ? " is-active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="book-rail__track">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCover
              key={`${activeCategory}-${period}-${book.id}`}
              book={book}
            />
          ))
        ) : (
          <p className="empty-state">이 분야의 베스트셀러를 불러오지 못했습니다.</p>
        )}
      </div>
    </section>
  );
}
