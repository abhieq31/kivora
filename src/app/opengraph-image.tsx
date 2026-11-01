import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nakshly — every home in India, on one map. No brokerage.";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(135deg,#1e2178,#3b3fd8)", color: "#fff", padding: 80, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 56, fontWeight: 800 }}>nakshly</div>
        <div style={{ fontSize: 84, fontWeight: 900, marginTop: 24, lineHeight: 1.05 }}>Every home in India, on one map.</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#ffb08f" }}>No brokerage. Real prices. Land records checked.</div>
      </div>
    ),
    size,
  );
}
