"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Review } from "@/lib/books/types";
import {
  knowledgeDomains,
  type KnowledgeDomainId,
} from "@/lib/knowledge-map";

export function KnowledgeMapExplorer({
  grouped,
}: {
  grouped: Record<KnowledgeDomainId, Review[]>;
}) {
  const [active, setActive] = useState<KnowledgeDomainId>("technology");
  const domain = knowledgeDomains.find((d) => d.id === active)!;
  const books = grouped[active] ?? [];

  const orbit = useMemo(
    () =>
      domain.concepts.map((concept, index) => {
        const angle = (Math.PI * 2 * index) / domain.concepts.length - Math.PI / 2;
        const radius = 38;
        return {
          ...concept,
          x: 50 + Math.cos(angle) * radius,
          y: 50 + Math.sin(angle) * radius,
        };
      }),
    [domain],
  );

  return (
    <div className="kmap">
      <div className="kmap__tabs" role="tablist" aria-label="지식 분야">
        {knowledgeDomains.map((item) => {
          const count = grouped[item.id]?.length ?? 0;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === item.id}
              className={`kmap__tab ${active === item.id ? "is-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <span className="kmap__tab-eyebrow">{item.eyebrow}</span>
              <span className="kmap__tab-label">{item.label}</span>
              <span className="kmap__tab-count">{String(count).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div className="kmap__stage" key={active}>
        <div className="kmap__orbit" aria-hidden>
          <div className="kmap__core">
            <p>{domain.eyebrow}</p>
            <strong>{domain.label}</strong>
          </div>
          {orbit.map((node) => (
            <div
              key={node.id}
              className="kmap__node"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.label}
            </div>
          ))}
          <svg className="kmap__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {orbit.map((node) => (
              <line
                key={node.id}
                x1="50"
                y1="50"
                x2={node.x}
                y2={node.y}
                className="kmap__line"
              />
            ))}
          </svg>
        </div>

        <div className="kmap__panel">
          <p className="kmap__eyebrow">{domain.eyebrow}</p>
          <h2 className="kmap__title">{domain.label}</h2>
          <p className="kmap__desc">{domain.description}</p>
          <p className="kmap__question">{domain.question}</p>

          <div className="kmap__concepts">
            {domain.concepts.map((concept) => (
              <span key={concept.id} className="kmap__chip">
                {concept.label}
              </span>
            ))}
          </div>

          <div className="kmap__books">
            {books.length === 0 ? (
              <p className="empty-state">이 분야에 연결된 서평이 아직 없습니다.</p>
            ) : (
              books.slice(0, 6).map((review) => (
                <a
                  key={review.slug}
                  href={review.brunchUrl || `/reviews/${review.slug}`}
                  target={review.brunchUrl ? "_blank" : undefined}
                  rel={review.brunchUrl ? "noopener noreferrer" : undefined}
                  className="kmap__book"
                >
                  <div className="kmap__book-cover">
                    {review.coverUrl ? (
                      <Image
                        src={review.coverUrl}
                        alt=""
                        width={72}
                        height={108}
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="kmap__book-meta">
                      {review.year}
                      {typeof review.rating === "number"
                        ? ` · ★ ${review.rating.toFixed(1)}`
                        : ""}
                    </p>
                    <h3>{review.title}</h3>
                    <p>{review.whyRead}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
