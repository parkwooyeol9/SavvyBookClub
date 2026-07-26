"use client";

import { useMemo, useState } from "react";
import { ReviewCard } from "@/components/review-card";
import type { Review, ReviewLanguage } from "@/lib/books/types";

type Filter = "all" | ReviewLanguage;

export function ReviewFilters({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((review) => review.language === filter);
  }, [filter, reviews]);

  return (
    <div>
      <div className="filter-row" role="tablist" aria-label="언어 필터">
        {(
          [
            { id: "all", label: "전체" },
            { id: "ko", label: "한국어" },
            { id: "en", label: "English 원서" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`filter-chip ${filter === item.id ? "is-active" : ""}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="review-grid">
        {filtered.map((review) => (
          <ReviewCard key={review.slug} review={review} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="empty-state">해당 조건의 서평이 없습니다.</p>
      ) : null}
    </div>
  );
}
