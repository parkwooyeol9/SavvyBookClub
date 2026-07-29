import { ImageResponse } from "next/og";

export const alt = "SavvyBookClub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0f1c2e 0%, #2a3824 55%, #5c6b4a 100%)",
          color: "#f7f2e8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: "0.12em", opacity: 0.75, marginBottom: 16 }}>
          SAVVYBOOKCLUB
        </div>
        <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.15, maxWidth: 900 }}>
          데이터에 기반한 경제·경영 도서 분석
        </div>
        <div style={{ fontSize: 28, marginTop: 28, opacity: 0.85 }}>
          서평 · 지식 지도 · 베스트셀러
        </div>
      </div>
    ),
    size,
  );
}
