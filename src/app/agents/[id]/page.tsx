import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BadgeCheck, Languages, MapPin } from "lucide-react";
import { agentReviews, getAgent } from "@/lib/queries/agents";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { CITY_BY_SLUG } from "@/lib/geo";
import { fmtDate } from "@/lib/format";
import type { CardListing } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Stars } from "@/components/agents/agent-card";
import { AgentContact, ReviewForm } from "./client";
import { Footer } from "@/components/footer";

export async function generateMetadata({ params }: PageProps<"/agents/[id]">): Promise<Metadata> {
  await connection();
  const a = await getAgent(Number((await params).id));
  return { title: a ? `${a.name}, ${a.agency} — real estate agent in ${CITY_BY_SLUG[a.city]?.name}` : "Agent" };
}

export default function Page({ params }: PageProps<"/agents/[id]">) {
  return (
    <>
      <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse bg-paper" />}><Profile params={params} /></Suspense>
      <Footer />
    </>
  );
}

async function Profile({ params }: { params: PageProps<"/agents/[id]">["params"] }) {
  await connection();
  const id = Number((await params).id);
  const a = Number.isInteger(id) ? await getAgent(id) : null;
  if (!a) notFound();
  const q = await db();
  const [reviews, listings, user] = await Promise.all([
    agentReviews(id),
    q<CardListing>(`select id, listing_type, status, property_type, bhk, bathrooms, carpet_sqft, super_sqft, price, city, locality, society, photos, lat, lng, created_at, posted_by, verified, is_demo, possession, furnishing
      from properties where agent_id = $1 order by (status = 'active') desc, created_at desc limit 12`, [id]),
    getUser(),
  ]);
  const active = listings.filter((l) => l.status === "active");
  const sold = listings.filter((l) => l.status !== "active");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <header className="flex flex-wrap gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-brand text-3xl font-bold text-white">{a.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">{a.name}{a.verified && <BadgeCheck className="h-6 w-6 text-good" />}</h1>
              <p className="text-muted">{a.agency} · {CITY_BY_SLUG[a.city]?.name}</p>
              <p className="mt-2 flex items-center gap-2">{a.rating ? <><Stars value={a.rating} /> <b>{a.rating}</b> · {a.reviews} reviews</> : "No reviews yet"}</p>
              <p className="mt-1 text-sm text-muted">RERA agent reg. <b className="text-ink">{a.rera_id || "not provided"}</b>{a.is_demo && " · demo profile"}</p>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Deals closed", a.deals_closed], ["Experience", `${a.experience_years} yrs`], ["Active listings", a.active], ["Reviews", a.reviews]].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border border-line p-4"><p className="text-xs text-muted">{k}</p><p className="text-2xl font-bold">{v}</p></div>
            ))}
          </div>
          <section>
            <h2 className="h-section">Fees</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-paper p-4"><p className="text-sm text-muted">Buying or selling</p><p className="text-lg font-bold">{a.sale_fee}</p></div>
              <div className="rounded-xl bg-paper p-4"><p className="text-sm text-muted">Renting</p><p className="text-lg font-bold">{a.rent_fee}</p></div>
            </div>
            <p className="mt-2 text-xs text-muted">Published by the agent. Agree on fees in writing before any visit.</p>
          </section>
          <section>
            <h2 className="h-section">About</h2>
            <p className="mt-3 leading-relaxed">{a.bio}</p>
            <p className="mt-3 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted" /> {a.localities.join(", ")}</p>
            <p className="mt-1 flex items-center gap-2 text-sm"><Languages className="h-4 w-4 text-muted" /> {a.languages.join(", ")}</p>
          </section>
          {active.length > 0 && (
            <section>
              <h2 className="h-section">Active listings ({active.length})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{active.map((l) => <PropertyCard key={l.id} l={l} compact />)}</div>
            </section>
          )}
          {sold.length > 0 && (
            <section>
              <h2 className="h-section">Recently closed</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{sold.map((l) => <PropertyCard key={l.id} l={l} compact />)}</div>
            </section>
          )}
          <section>
            <h2 className="h-section">Reviews ({reviews.length})</h2>
            {user ? <ReviewForm agentId={a.id} /> : <p className="mt-2 text-sm"><Link className="font-semibold text-brand" href={`/login?next=/agents/${a.id}`}>Sign in</Link> to write a review.</p>}
            <ul className="mt-4 divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-4">
                  <div className="flex items-center gap-2"><Stars value={r.rating} /><b>{r.author}</b><span className="text-sm text-muted">· {r.deal_type === "buy" ? "Bought" : r.deal_type === "sell" ? "Sold" : "Rented"} · {fmtDate(r.created_at)}</span></div>
                  <p className="mt-1 text-sm">{r.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <AgentContact agentId={a.id} name={a.name} defaults={{ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" }} />
        </aside>
      </div>
    </div>
  );
}
