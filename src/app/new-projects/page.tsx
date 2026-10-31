import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { searchProjects } from "@/lib/queries/projects";
import { CITIES, CITY_BY_SLUG } from "@/lib/geo";
import { fmtDate, priceLabel } from "@/lib/format";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "New projects & under-construction homes", description: "RERA-registered new launches and under-construction projects across India." };
type SP = PageProps<"/new-projects">["searchParams"];

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">New projects</h1>
        <p className="mt-2 text-muted">Builder launches with RERA registration, possession dates and price ranges. Always verify on your state RERA portal before booking.</p>
        <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-paper" />}><List searchParams={searchParams} /></Suspense>
      </div>
      <Footer />
    </>
  );
}

async function List({ searchParams }: { searchParams: SP }) {
  await connection();
  const sp = await searchParams;
  const city = typeof sp.city === "string" && CITY_BY_SLUG[sp.city] ? sp.city : undefined;
  const status = sp.status === "ready" || sp.status === "under_construction" ? sp.status : undefined;
  const config = typeof sp.config === "string" && /^\d BHK$/.test(sp.config) ? sp.config : undefined;
  const projects = await searchProjects({ city, status, config });
  return (
    <>
      <form className="mt-6 flex flex-wrap gap-3" action="/new-projects">
        <select name="city" defaultValue={city ?? ""} className="input w-auto"><option value="">All cities</option>{CITIES.filter((c) => c.markets.length).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select name="status" defaultValue={status ?? ""} className="input w-auto"><option value="">Any status</option><option value="under_construction">Under construction</option><option value="ready">Ready to move</option></select>
        <select name="config" defaultValue={config ?? ""} className="input w-auto"><option value="">Any configuration</option>{[1, 2, 3, 4].map((b) => <option key={b}>{b} BHK</option>)}</select>
        <button className="btn">Filter</button>
      </form>
      <p className="mt-4 text-sm text-muted">{projects.length} projects</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/new-projects/${p.id}`} className="card overflow-hidden transition hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photos[0]} alt="" className="aspect-[3/2] w-full object-cover" loading="lazy" />
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${p.status === "ready" ? "bg-emerald-50 text-good" : "bg-amber-100 text-amber-800"}`}>{p.status === "ready" ? "Ready to move" : "Under construction"}</span>
                {p.is_demo && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Demo</span>}
              </div>
              <p className="mt-2 text-lg font-bold">{p.name}</p>
              <p className="text-sm text-muted">by {p.builder} · {p.locality}, {CITY_BY_SLUG[p.city]?.name}</p>
              <p className="mt-2 font-semibold">{priceLabel(p.price_min)} – {priceLabel(p.price_max)}</p>
              <p className="text-sm text-muted">{p.configurations.join(", ")} · Possession {p.possession_date ? fmtDate(p.possession_date) : "TBA"}</p>
              <p className="mt-2 truncate text-xs text-muted">RERA {p.rera_id}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
