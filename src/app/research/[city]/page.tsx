import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { localityStats, trend } from "@/lib/queries/market";
import { CITY_BY_SLUG } from "@/lib/geo";
import { inr, pct } from "@/lib/format";
import { LineChart, monthLabel } from "@/components/line-chart";
import { Footer } from "@/components/footer";

export async function generateMetadata({ params }: PageProps<"/research/[city]">): Promise<Metadata> {
  const c = CITY_BY_SLUG[(await params).city];
  return { title: c ? `${c.name} property prices & rent trends` : "Market trends" };
}

export default function Page({ params }: PageProps<"/research/[city]">) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-paper" />}><Body params={params} /></Suspense>
      </div>
      <Footer />
    </>
  );
}

async function Body({ params }: { params: PageProps<"/research/[city]">["params"] }) {
  await connection();
  const c = CITY_BY_SLUG[(await params).city];
  if (!c) notFound();
  const [sale, rent, locs] = await Promise.all([trend("sale", c.slug), trend("rent", c.slug), localityStats(c.slug)]);
  if (!sale.length) {
    return (
      <>
        <h1 className="text-4xl font-extrabold">{c.name}</h1>
        <p className="mt-4 text-muted">We don&apos;t have transaction data for {c.name} yet. <Link href={`/buy/${c.slug}`} className="text-brand underline">Browse listings</Link>.</p>
      </>
    );
  }
  const top = locs.filter((l) => l.sale_ppsf).slice(0, 6);
  const palette = ["#3b3fd8", "#ff7a45", "#0f8a5f", "#a21caf", "#0891b2", "#ca8a04"];
  const locTrends = await Promise.all(top.map((l) => trend("sale", c.slug, l.locality)));
  return (
    <>
      <p className="text-sm text-muted"><Link href="/research" className="hover:underline">Market trends</Link> › {c.name}</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">{c.name} housing market</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="font-semibold">Median sale price per sq ft</p>
          <LineChart series={[{ name: c.name, color: "#3b3fd8", points: sale.map((t) => ({ x: t.month, y: t.ppsf })) }]} format={(n) => inr(n)} xLabel={monthLabel} />
        </div>
        <div className="card p-5">
          <p className="font-semibold">Median monthly rent per sq ft</p>
          <LineChart series={[{ name: c.name, color: "#0f8a5f", points: rent.map((t) => ({ x: t.month, y: t.ppsf })) }]} format={(n) => `₹${n.toFixed(0)}`} xLabel={monthLabel} />
        </div>
      </div>
      <div className="card mt-6 p-5">
        <p className="font-semibold">Top localities by price</p>
        <LineChart series={top.map((l, i) => ({ name: l.locality, color: palette[i], points: locTrends[i].map((t) => ({ x: t.month, y: t.ppsf })) }))} format={(n) => inr(n)} xLabel={monthLabel} height={260} />
      </div>
      <h2 className="h-section mt-10">Localities</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-muted"><tr><th className="py-3">Locality</th><th>Sale ₹/sq ft</th><th>YoY</th><th>Rent ₹/sq ft</th><th>Yield</th><th>Transactions</th><th>Listings</th></tr></thead>
          <tbody>
            {locs.map((l) => (
              <tr key={l.locality} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="py-3 font-medium">{l.locality}</td>
                <td className="font-semibold">{l.sale_ppsf ? inr(l.sale_ppsf) : "—"}</td>
                <td className={l.yoy != null && l.yoy < 0 ? "text-bad" : "text-good"}>{l.yoy != null ? `${l.yoy >= 0 ? "+" : ""}${pct(l.yoy)}` : "—"}</td>
                <td>{l.rent_ppsf ? `₹${l.rent_ppsf.toFixed(1)}` : "—"}</td>
                <td>{l.sale_ppsf && l.rent_ppsf ? pct((l.rent_ppsf * 12) / l.sale_ppsf) : "—"}</td>
                <td>{l.sales + l.rents}</td>
                <td className="space-x-2">
                  <Link className="text-brand hover:underline" href={`/buy/${c.slug}?q=${encodeURIComponent(l.locality)}`}>{l.active_sale} sale</Link>
                  <Link className="text-good hover:underline" href={`/rent/${c.slug}?q=${encodeURIComponent(l.locality)}`}>{l.active_rent} rent</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
