import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { trackedHomes } from "@/lib/queries/user";
import { estimateFor } from "@/lib/queries/properties";
import { CITY_BY_SLUG, findMarket } from "@/lib/geo";
import { inr, pct, priceLabel } from "@/lib/format";
import { untrackHome } from "@/lib/actions/owner";

export const metadata: Metadata = { title: "My home value" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My homes</h1>
      <p className="mt-1 text-muted">Estimates refresh as new sales are registered nearby.</p>
      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-xl bg-paper" />}><List /></Suspense>
    </div>
  );
}

async function List() {
  await connection();
  const u = await requireUser("/home-value/my-homes");
  const homes = await trackedHomes(u.id);
  if (!homes.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center">
        <p className="font-semibold">You aren&apos;t tracking any homes yet</p>
        <Link href="/home-value" className="btn mt-4">Estimate my home</Link>
      </div>
    );
  }
  const rows = await Promise.all(homes.map(async (h) => {
    const c = CITY_BY_SLUG[h.city];
    const mk = findMarket(h.city, h.locality);
    const s = { city: h.city, locality: h.locality, lat: mk?.lat ?? c?.lat ?? 0, lng: mk?.lng ?? c?.lng ?? 0, propertyType: h.property_type, bhk: h.bhk, carpetSqft: h.carpet_sqft, floor: h.floor, ageYears: h.age_years };
    const [sale, rent] = await Promise.all([estimateFor("sale", s), estimateFor("rent", s)]);
    return { h, sale, rent, city: c?.name ?? h.city };
  }));
  return (
    <div className="mt-6 space-y-4">
      {rows.map(({ h, sale, rent, city }) => (
        <div key={h.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">{h.label} · {h.bhk} BHK, {h.carpet_sqft.toLocaleString("en-IN")} sq ft</p>
            <p className="text-sm text-muted">{h.locality}, {city}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><p className="text-muted">Value</p><p className="text-xl font-bold">{sale ? priceLabel(sale.value) : "—"}</p></div>
            <div><p className="text-muted">Rent</p><p className="text-xl font-bold">{rent ? `${inr(rent.value)}/mo` : "—"}</p></div>
            <div><p className="text-muted">1-yr trend</p><p className={`text-xl font-bold ${sale && sale.annualGrowth < 0 ? "text-bad" : "text-good"}`}>{sale ? `${sale.annualGrowth >= 0 ? "+" : ""}${pct(sale.annualGrowth)}` : "—"}</p></div>
          </div>
          <div className="flex gap-2">
            <Link className="btn-ghost" href={`/home-value?city=${h.city}&locality=${encodeURIComponent(h.locality)}&type=${h.property_type}&bhk=${h.bhk}&sqft=${h.carpet_sqft}${h.floor != null ? `&floor=${h.floor}` : ""}${h.age_years != null ? `&age=${h.age_years}` : ""}`}>Details</Link>
            <form action={untrackHome}><input type="hidden" name="id" value={h.id} /><button className="btn-ghost text-bad">Remove</button></form>
          </div>
        </div>
      ))}
    </div>
  );
}
