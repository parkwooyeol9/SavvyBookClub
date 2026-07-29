"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Review } from "@/lib/books/types";
import {
  knowledgeDomains,
  type KnowledgeDomainId,
} from "@/lib/knowledge-map";
import { getReviewHref } from "@/lib/review-links";

const domainAccent: Record<KnowledgeDomainId, string> = {
  technology: "kmap-card--tech",
  institutions: "kmap-card--inst",
  money: "kmap-card--money",
  mind: "kmap-card--mind",
};

export function KnowledgeMapExplorer({
  grouped,
}: {
  grouped: Record<KnowledgeDomainId, Review[]>;
}) {
  const [active, setActive] = useState<KnowledgeDomainId>("technology");
  const domain = knowledgeDomains.find((d) => d.id === active)!;
  const books = grouped[active] ?? [];
  const totalReviews = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="kmap">
      <div className="kmap__intro">
        <p className="kmap__intro-lead">
          서평 <strong>{totalReviews}편</strong>을 4개 분야로 묶었습니다. 카드를
          누르면 연결된 책을 바로 볼 수 있습니다.
        </p>
      </div>

      <div className="kmap__overview" role="tablist" aria-label="지식 분야">
        {knowledgeDomains.map((item) => {
          const reviews = grouped[item.id] ?? [];
          const previews = reviews.filter((r) => r.coverUrl).slice(0, 3);
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`kmap-card ${domainAccent[item.id]}${isActive ? " is-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <div className="kmap-card__head">
                <span className="kmap-card__eyebrow">{item.eyebrow}</span>
                <span className="kmap-card__count">{reviews.length}권</span>
              </div>
              <h3 className="kmap-card__title">{item.label}</h3>
              <p className="kmap-card__question">{item.question}</p>
              <div className="kmap-card__covers" aria-hidden>
                {previews.length > 0 ? (
                  previews.map((review) => (
                    <div key={review.slug} className="kmap-card__cover">
                      <Image
                        src={review.coverUrl}
                        alt=""
                        width={48}
                        height={72}
                        unoptimized
                      />
                    </div>
                  ))
                ) : (
                  <span className="kmap-card__empty">서평 준비 중</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="kmap__detail" key={active}>
        <div className="kmap__detail-head">
          <div>
            <p className="kmap__eyebrow">{domain.eyebrow}</p>
            <h2 className="kmap__title">{domain.label}</h2>
            <p className="kmap__desc">{domain.description}</p>
          </div>
          <div className="kmap__concepts" aria-label="핵심 개념">
            {domain.concepts.map((concept) => (
              <span key={concept.id} className="kmap__chip">
                {concept.label}
              </span>
            ))}
          </div>
        </div>

        <div className="kmap__books-grid">
          {books.length === 0 ? (
            <p className="empty-state">이 분야에 연결된 서평이 아직 없습니다.</p>
          ) : (
            books.slice(0, 6).map((review) => (
              <Link
                key={review.slug}
                href={getReviewHref(review)}
                className="kmap__book-card"
              >
                <div className="kmap__book-cover">
                  {review.coverUrl ? (
                    <Image
                      src={review.coverUrl}
                      alt=""
                      width={88}
                      height={132}
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="kmap__book-body">
                  <p className="kmap__book-meta">
                    {review.year}
                    {typeof review.rating === "number"
                      ? ` · ★ ${review.rating.toFixed(1)}`
                      : ""}
                  </p>
                  <h3>{review.title}</h3>
                  <p>{review.whyRead}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
