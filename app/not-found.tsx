import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <h1 className="page-title">페이지를 찾을 수 없습니다</h1>
      <p className="page-lede">요청하신 주소에 콘텐츠가 없거나 이동되었습니다.</p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="btn btn--primary">
          홈으로
        </Link>
      </p>
    </div>
  );
}
