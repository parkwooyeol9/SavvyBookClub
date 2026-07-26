import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "소개",
  description: "SavvyBookClub 소개와 데이터 출처.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">소개</h1>
      <p className="page-lede">
        SavvyBookClub은 국내 베스트·신간과 영문 원서 추천을 한 화면에 모으고,
        운영자의 개인 서평으로 ‘다음에 무엇을 읽을지’를 돕는 사이트입니다.
      </p>

      <div className="about-block">
        <p>
          메인 페이지의 베스트/추천 목록은 알라딘 Open API, Yes24 공식 RSS,
          NYT Books API(또는 Open Library)를 주기적으로 동기화해 보여줍니다.
          요청마다 HTML을 크롤링하지 않습니다.
        </p>
        <p>
          서평 섹션은 연간 약 30권 분량의 개인 추천을 목표로 합니다. 현재는
          샘플 서평으로 UI를 구성해 두었고, 운영 중인 블로그 주소를 주시면
          그 글을 바탕으로 본문을 채울 예정입니다.
        </p>
        <p>
          문의·연동 준비는 배포 후 README의 환경 변수 설정을 참고해 주세요.
        </p>
        <p>
          <Link href="/reviews">서평 보러 가기 →</Link>
        </p>
      </div>
    </div>
  );
}
