import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getProject } from "@/lib/queries/projects";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { CITY_BY_SLUG } from "@/lib/geo";
import { fmtDate, priceLabel } from "@/lib/format";
import type { CardListing } from "@/lib/types";
import { Gallery } from "@/components/property/gallery";
import { PointMap } from "@/components/property/point-map";
import { PropertyCard } from "@/components/property-card";
import { ProjectEnquiry } from "./enquiry";
import { Footer } from "@/components/footer";

export async function generateMetadata({ params }: PageProps<"/new-projects/[id]">): Promise<Metadata> {
  await connection();
  const p = await getProject(Number((await params).id));
  return { title: p ? `${p.name} by ${p.builder}, ${p.locality}` : "Project" };
}

export default function Page({ params }: PageProps<"/new-projects/[id]">) {
  return (
    <>
      <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse bg-paper" />}><Detail params={params} /></Suspense>
      <Footer />
    </>
  );
}

async function Detail({ params }: { params: PageProps<"/new-projects/[id]">["params"] }) {
  await connection();
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await getProject(id) : null;
  if (!p) notFound();
  const q = await db();
  const [units, user] = await Promise.all([
    q<CardListing>(`select id, listing_type, status, property_type, bhk, bathrooms, carpet_sqft, super_sqft, price, city, locality, society, photos, lat, lng, created_at, posted_by, verified, is_demo, possession, furnishing
      from properties where project_id = $1 and status = 'active' order by price`, [id]),
    getUser(),
  ]);
  const city = CITY_BY_SLUG[p.city];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Gallery photos={p.photos} alt={p.name} />
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <header>
            <p className="text-sm font-semibold text-brand">{p.status === "ready" ? "Ready to move" : "Under construction"}{p.is_demo && " · Demo data"}</p>
            <h1 className="text-3xl font-bold">{p.name}</h1>
            <p className="text-muted">by {p.builder} · {p.locality}, {city?.name}</p>
            <p className="mt-3 text-3xl font-bold">{priceLabel(p.price_min)} – {priceLabel(p.price_max)}</p>
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Configurations", p.configurations.join(", ")], ["Possession", p.possession_date ? fmtDate(p.possession_date) : "TBA"], ["Towers / units", `${p.towers ?? "—"} / ${p.units_total ?? "—"}`], ["Land", p.land_acres ? `${p.land_acres} acres` : "—"]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line p-3"><p className="text-xs text-muted">{k}</p><p className="font-semibold">{v}</p></div>
            ))}
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-sm">
            <p className="font-semibold">RERA registration: {p.rera_id}</p>
            <p className="mt-1 text-amber-900/80">Check this number on the {city?.state} RERA website for approvals, carpet areas, completion timelines and complaints before paying any booking amount. Buying under construction attracts 5% GST (1% for affordable homes).</p>
          </div>
          <section><h2 className="h-section">About the project</h2><p className="mt-3 leading-relaxed">{p.description}</p></section>
          <section>
            <h2 className="h-section">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.amenities.map((a) => <span key={a} className="rounded-full bg-paper px-3 py-1 text-sm">{a}</span>)}</div>
          </section>
          {units.length > 0 && (
            <section>
              <h2 className="h-section">Available units ({units.length})</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{units.map((u) => <PropertyCard key={u.id} l={u} compact />)}</div>
            </section>
          )}
          <section><h2 className="h-section">Location</h2><div className="mt-3"><PointMap lat={p.lat} lng={p.lng} label={p.name} /></div></section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ProjectEnquiry projectId={p.id} defaults={{ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" }} />
        </aside>
      </div>
    </div>
  );
}
