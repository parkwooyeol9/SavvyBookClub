import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/site";

const QUIET_ZONE = 2;

function qrPath(text: string): { d: string; size: number } {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  let d = "";
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) {
        d += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
  }
  return { d, size: modules.size + QUIET_ZONE * 2 };
}

function QrSvg({
  d,
  size,
  className,
  label,
}: {
  d: string;
  size: number;
  className: string;
  label?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="var(--ink)" />
    </svg>
  );
}

export function SiteQr() {
  const siteUrl = getSiteUrl();
  const displayUrl = siteUrl.replace(/^https?:\/\//, "");
  const { d, size } = qrPath(siteUrl);

  return (
    <>
      <button
        type="button"
        className="site-qr__toggle"
        popoverTarget="site-qr-panel"
        aria-label="홈페이지 QR 코드 보기"
        title="QR 코드로 접속하기"
      >
        <QrSvg d={d} size={size} className="site-qr__thumb" />
      </button>
      <div id="site-qr-panel" popover="auto" className="site-qr__panel">
        <p className="site-qr__eyebrow">SCAN TO VISIT</p>
        <QrSvg
          d={d}
          size={size}
          className="site-qr__code"
          label={`${displayUrl} 접속 QR 코드`}
        />
        <p className="site-qr__caption">
          휴대폰 카메라로 스캔하면
          <br />
          SavvyBookClub에 바로 접속합니다.
        </p>
        <p className="site-qr__url">{displayUrl}</p>
      </div>
    </>
  );
}
