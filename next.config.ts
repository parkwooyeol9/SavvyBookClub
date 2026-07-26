import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.aladin.co.kr" },
      { protocol: "https", hostname: "www.aladin.co.kr" },
      { protocol: "https", hostname: "image.yes24.com" },
      { protocol: "https", hostname: "www.yes24.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
};

export default nextConfig;
