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
        SavvyBookClub은 경제·경영·과학 책을 데이터 기반으로 고르고, 브런치 서평과
        국내·해외 베스트를 한 화면에 모은 사이트입니다.
      </p>

      <div className="about-block">
        <p>
          개인 서평의 기초 데이터는{" "}
          <a
            href="https://brunch.co.kr/@econbook"
            target="_blank"
            rel="noopener noreferrer"
          >
            brunch.co.kr/@econbook
          </a>
          입니다. 표지 이미지·별점·한줄평·요약을 가져와 사이트 서평으로
          재구성하며, 원문은 브런치에서 이어 읽을 수 있습니다.
        </p>
        <p>
          메인 베스트·뉴스 목록은 API 키 없이 공개 웹페이지를 매일 아침{" "}
          <strong>한국시간 오전 9시</strong>에 크롤링해 갱신합니다. 알라딘·Yes24
          베스트/신간, Open Library 트렌딩, 한겨레·조선일보·Google 뉴스 서평을
          함께 수집합니다.
        </p>
        <p>
          <Link href="/reviews">서평 보러 가기 →</Link>
        </p>
      </div>
    </div>
  );
}
