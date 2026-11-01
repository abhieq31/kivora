import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { getProperty } from "@/lib/queries/properties";
import { CITY_BY_SLUG } from "@/lib/geo";
import { PROPERTY_TYPES } from "@/lib/types";
import { listingPrice } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Home on Nakshly";

// The card WhatsApp, X and LinkedIn show when a listing link is shared.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const p = await getProperty(Number((await params).slug.split("-")[0]));
  const sale = p?.listing_type === "sale";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg,#1e2178,#3b3fd8)", color: "#fff", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 800 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b3fd8", fontSize: 34 }}>N</div>
          nakshly
        </div>
        {p ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ background: sale ? "#fff" : "#ff7a45", color: sale ? "#3b3fd8" : "#fff", borderRadius: 999, padding: "8px 22px", fontSize: 28, fontWeight: 700 }}>{sale ? "For sale" : "For rent"}</span>
              {p.posted_by === "owner" && <span style={{ background: "#0f8a5f", borderRadius: 999, padding: "8px 22px", fontSize: 28, fontWeight: 700 }}>Owner · no brokerage</span>}
            </div>
            <div style={{ fontSize: 96, fontWeight: 900, marginTop: 24 }}>{listingPrice(p.price, p.listing_type)}</div>
            <div style={{ fontSize: 44, marginTop: 8 }}>
              {`${p.bhk ? `${p.bhk} BHK ` : ""}${PROPERTY_TYPES[p.property_type] ?? "Home"} · ${p.carpet_sqft.toLocaleString("en-IN")} sq ft`}
            </div>
            <div style={{ fontSize: 36, opacity: 0.8, marginTop: 8 }}>{`${p.locality}, ${CITY_BY_SLUG[p.city]?.name ?? p.city}`}</div>
          </div>
        ) : (
          <div style={{ fontSize: 72, fontWeight: 900, marginTop: "auto" }}>Every home in India, on one map.</div>
        )}
      </div>
    ),
    size,
  );
}
