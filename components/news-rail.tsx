import type { BookNewsItem } from "@/lib/books/types";

export function NewsRail({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: BookNewsItem[];
}) {
  return (
    <section className="news-rail">
      <div className="book-rail__heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <ul className="news-list">
        {items.map((item) => (
          <li key={item.id} className="news-item">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item__link"
            >
              <span className="news-item__source">{item.source}</span>
              <h3 className="news-item__title">{item.title}</h3>
              {item.excerpt ? (
                <p className="news-item__excerpt">{item.excerpt}</p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
