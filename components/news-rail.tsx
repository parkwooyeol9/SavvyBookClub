import type { BookNewsItem } from "@/lib/books/types";

export function NewsRail({
  title,
  subtitle,
  items,
  limit = 8,
}: {
  title: string;
  subtitle?: string;
  items: BookNewsItem[];
  limit?: number;
}) {
  const visible = items.slice(0, limit);

  return (
    <section className="news-rail">
      <div className="book-rail__heading">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <ul className="news-list">
        {visible.map((item) => (
          <li key={item.id} className="news-item">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item__link"
            >
              <span className="news-item__source">{item.source}</span>
              <h3 className="news-item__title">{item.title}</h3>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
