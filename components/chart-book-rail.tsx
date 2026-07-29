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

const periods: ChartPeriod[] = ["daily", "weekly", "monthly"];

export function ChartBookRail({
  title,
  subtitle,
  charted,
  limit = 8,
  defaultPeriod = "daily",
}: {
  title: string;
  subtitle?: string;
  charted: ChartedBooks;
  limit?: number;
  defaultPeriod?: ChartPeriod;
}) {
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);
  const books = pickChartBooks(charted, period).slice(0, limit);

  return (
    <section className="book-rail">
      <div className="book-rail__heading book-rail__heading--chart">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
          <p className="book-rail__period-note">{chartPeriodDescriptions[period]}</p>
        </div>
        <div className="chart-period-tabs" role="tablist" aria-label={`${title} 차트 기간`}>
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
      <div className="book-rail__track">
        {books.map((book) => (
          <BookCover key={`${period}-${book.id}`} book={book} />
        ))}
      </div>
    </section>
  );
}
