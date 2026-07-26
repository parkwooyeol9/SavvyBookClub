import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Literata } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import "./globals.css";

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SavvyBookClub",
    template: "%s · SavvyBookClub",
  },
  description:
    "국내 베스트와 영문 원서 추천을 한곳에서. 읽는 사람을 위한 도서 큐레이션.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${ibmPlexSansKr.variable} ${literata.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
