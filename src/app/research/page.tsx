import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cityStats } from "@/lib/queries/market";
import { CITY_BY_SLUG } from "@/lib/geo";
import { inr, pct } from "@/lib/format";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "India housing market trends", description: "Median home prices and rents per sq ft by city and locality, from transaction data." };

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Housing market trends</h1>
        <p className="mt-2 max-w-3xl text-muted">Medians from registered sales and signed rent agreements over the last six months, per sq ft of carpet area. Year-on-year compares with the same six months a year earlier.</p>
        <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-paper" />}><Table /></Suspense>
      </div>
      <Footer />
    </>
  );
}

async function Table() {
  await connection();
  const rows = (await cityStats()).filter((r) => CITY_BY_SLUG[r.city] && r.sale_ppsf);
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-muted"><tr><th className="py-3">City</th><th>Sale ₹/sq ft</th><th>YoY</th><th>Rent ₹/sq ft/mo</th><th>Gross yield</th><th>For sale</th><th>For rent</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.city} className="border-b border-line last:border-0 hover:bg-paper">
              <td className="py-3"><Link href={`/research/${r.city}`} className="font-semibold text-brand hover:underline">{CITY_BY_SLUG[r.city].name}</Link></td>
              <td className="font-semibold">{inr(r.sale_ppsf!)}</td>
              <td className={r.yoy != null && r.yoy < 0 ? "text-bad" : "text-good"}>{r.yoy != null ? `${r.yoy >= 0 ? "+" : ""}${pct(r.yoy)}` : "—"}</td>
              <td>{r.rent_ppsf ? `₹${r.rent_ppsf.toFixed(1)}` : "—"}</td>
              <td>{r.rent_ppsf ? pct((r.rent_ppsf * 12) / r.sale_ppsf!) : "—"}</td>
              <td>{r.active_sale}</td>
              <td>{r.active_rent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted">Built from demo data in this build. Connect registration data sources to publish real figures.</p>
    </div>
  );
}
