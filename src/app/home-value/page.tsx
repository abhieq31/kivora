import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CITY_BY_SLUG, findMarket, normalizeLocality } from "@/lib/geo";
import { estimateFor } from "@/lib/queries/properties";
import { trend } from "@/lib/queries/market";
import { getUser } from "@/lib/auth";
import { inr, pct, priceLabel } from "@/lib/format";
import { EstimateBlock } from "@/components/property/estimate-block";
import { CityLocality } from "@/components/forms/city-locality";
import { LineChart, monthLabel } from "@/components/line-chart";
import { TrackHomeButton } from "./track-button";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "What's my home worth? Free home value estimate", description: "Free instant home value and rent estimate for any flat or house in India, based on nearby registered sales." };

type SP = PageProps<"/home-value">["searchParams"];

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-soft to-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-4xl font-extrabold tracking-tight">What&apos;s my home worth?</h1>
          <p className="mt-2 text-lg text-muted">A free Nakshly Estimate of your home&apos;s market value and rent — with the comparable sales behind it.</p>
          <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-white" />}>
            <Body searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <Footer />
    </>
  );
}

async function Body({ searchParams }: { searchParams: SP }) {
  await connection();
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const city = CITY_BY_SLUG[s("city")];
  const sqft = Number(s("sqft"));
  const ready = city && s("locality").length >= 2 && sqft >= 100;
  const user = await getUser();

  const form = (
    <form className="card mt-8 grid grid-cols-1 gap-4 p-6 sm:grid-cols-4" action="/home-value">
      <CityLocality city={s("city")} locality={s("locality")} />
      <label className="block"><span className="label">Home type</span>
        <select name="type" className="input" defaultValue={s("type") || "apartment"}>
          <option value="apartment">Apartment</option><option value="builder_floor">Builder floor</option><option value="independent_house">Independent house</option><option value="villa">Villa</option>
        </select>
      </label>
      <label className="block"><span className="label">BHK</span>
        <select name="bhk" className="input" defaultValue={s("bhk") || "2"}>{[1, 2, 3, 4, 5].map((b) => <option key={b}>{b}</option>)}</select>
      </label>
      <label className="block"><span className="label">Carpet area (sq ft)</span><input name="sqft" className="input" inputMode="numeric" defaultValue={s("sqft")} required /></label>
      <label className="block"><span className="label">Floor</span><input name="floor" className="input" inputMode="numeric" defaultValue={s("floor")} placeholder="Optional" /></label>
      <label className="block"><span className="label">Building age (yrs)</span><input name="age" className="input" inputMode="numeric" defaultValue={s("age")} placeholder="Optional" /></label>
      <label className="block"><span className="label">Furnishing</span>
        <select name="furnishing" className="input" defaultValue={s("furnishing") || "semi"}>
          <option value="unfurnished">Unfurnished</option><option value="semi">Semi-furnished</option><option value="full">Fully furnished</option>
        </select>
      </label>
      <div className="flex items-end sm:col-span-4"><button className="btn w-full py-3 sm:w-auto sm:px-8">Get my estimate</button></div>
    </form>
  );
  if (!ready) {
    return (
      <>
        {form}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            ["Comparable sales", "We find registered sales near your home and weight them by distance, recency and similarity."],
            ["Indian adjustments", "Floor, building age, furnishing, covered parking and Vastu-preferred facing all move the number."],
            ["Shown, not hidden", "Every estimate lists the comparables it used, a range and a confidence level."],
          ].map(([t, d]) => <div key={t}><p className="font-semibold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>)}
        </div>
      </>
    );
  }

  const locality = normalizeLocality(city.slug, s("locality"));
  const mk = findMarket(city.slug, locality);
  const subject = {
    city: city.slug, locality, lat: mk?.lat ?? city.lat, lng: mk?.lng ?? city.lng, propertyType: s("type") || "apartment", bhk: Number(s("bhk")) || 2,
    carpetSqft: sqft, floor: s("floor") ? Number(s("floor")) : null, ageYears: s("age") ? Number(s("age")) : null, furnishing: s("furnishing") || "semi",
  };
  const [sale, rent, st] = await Promise.all([estimateFor("sale", subject), estimateFor("rent", subject), trend("sale", city.slug, mk ? locality : undefined)]);
  const yieldPct = sale && rent ? (rent.value * 12) / sale.value : null;
  return (
    <>
      {form}
      <div className="mt-10">
        <h2 className="text-2xl font-bold">{subject.bhk} BHK, {sqft.toLocaleString("en-IN")} sq ft in {locality}, {city.name}</h2>
        {!mk && <p className="mt-1 text-sm text-amber-700">We don&apos;t have locality-level data for {locality} yet, so this uses the nearest transactions in {city.name}.</p>}
        {!sale && !rent ? (
          <p className="mt-4 rounded-xl bg-white p-6 text-muted">We don&apos;t have enough transactions in {city.name} to estimate this home yet. We&apos;re adding cities every month.</p>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white">{sale && <><p className="px-1 pt-4 font-semibold">Market value</p><EstimateBlock est={sale} kind="sale" /></>}</div>
            <div className="rounded-xl bg-white">{rent && <><p className="px-1 pt-4 font-semibold">Rent estimate</p><EstimateBlock est={rent} kind="rent" /></>}</div>
          </div>
        )}
        {yieldPct && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card p-4"><p className="text-sm text-muted">Gross rental yield</p><p className="text-2xl font-bold">{pct(yieldPct)}</p></div>
            <div className="card p-4"><p className="text-sm text-muted">Annual rent</p><p className="text-2xl font-bold">{priceLabel(rent!.value * 12)}</p></div>
            <div className="card p-4"><p className="text-sm text-muted">Price growth nearby</p><p className="text-2xl font-bold">{sale!.annualGrowth >= 0 ? "+" : ""}{pct(sale!.annualGrowth)}/yr</p></div>
          </div>
        )}
        {st.length > 2 && (
          <div className="card mt-6 p-5">
            <p className="mb-3 font-semibold">{mk ? locality : city.name}: median price per sq ft</p>
            <LineChart series={[{ name: "₹/sq ft", color: "#3b3fd8", points: st.map((t) => ({ x: t.month, y: t.ppsf })) }]} format={(n) => inr(n)} xLabel={monthLabel} />
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? <TrackHomeButton fields={{ city: city.slug, locality, property_type: subject.propertyType, bhk: String(subject.bhk), carpet_sqft: String(sqft), floor: s("floor"), age_years: s("age") }} />
            : <Link href={`/login?next=${encodeURIComponent("/home-value?" + new URLSearchParams(sp as Record<string, string>).toString())}`} className="btn">Sign in to track this home&apos;s value</Link>}
          <Link href="/post-property" className="btn-outline">Sell or rent it out on Nakshly</Link>
          <Link href="/agents" className="btn-ghost">Talk to a local agent</Link>
        </div>
      </div>
    </>
  );
}
