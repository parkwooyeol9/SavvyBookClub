export function BookSearchForm({
  initial = "",
  id = "book-q",
}: {
  initial?: string;
  id?: string;
}) {
  return (
    <form className="book-search" action="/search" method="get" role="search">
      <label className="sr-only" htmlFor={id}>
        책 제목이나 저자 검색
      </label>
      <input
        id={id}
        name="q"
        defaultValue={initial}
        placeholder="제목·저자 검색"
        required
      />
      <button type="submit">검색</button>
    </form>
  );
}
