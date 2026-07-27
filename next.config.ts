import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.aladin.co.kr" },
      { protocol: "https", hostname: "www.aladin.co.kr" },
      { protocol: "https", hostname: "image.yes24.com" },
      { protocol: "https", hostname: "www.yes24.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "openlibrary.org" },
      { protocol: "https", hostname: "flexible.img.hani.co.kr" },
      { protocol: "https", hostname: "img.hani.co.kr" },
      { protocol: "https", hostname: "www.chosun.com" },
      { protocol: "https", hostname: "cloudfront-ap-northeast-1.images.arcpublishing.com" },
      { protocol: "https", hostname: "img1.kakaocdn.net" },
      { protocol: "https", hostname: "img1.daumcdn.net" },
      { protocol: "https", hostname: "t1.daumcdn.net" },
      { protocol: "http", hostname: "t1.daumcdn.net" },
    ],
  },
};

export default nextConfig;
