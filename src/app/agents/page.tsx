import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { searchAgents } from "@/lib/queries/agents";
import { CITIES, CITY_BY_SLUG } from "@/lib/geo";
import { AgentCard } from "@/components/agents/agent-card";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Find a real estate agent", description: "Compare RERA-registered real estate agents by reviews, deals closed and published fees." };

type SP = PageProps<"/agents">["searchParams"];

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Find an agent who shows their fee</h1>
          <p className="mt-2 max-w-2xl text-muted">Every agent on Nakshly publishes their RERA agent registration and what they charge — before you call.</p>
          <Suspense fallback={null}><Filters searchParams={searchParams} /></Suspense>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-paper" />}><Results searchParams={searchParams} /></Suspense>
        <div className="mt-10 rounded-2xl bg-brand-soft p-6">
          <p className="font-semibold">Are you an agent?</p>
          <p className="text-sm text-muted">Create a free profile with your RERA number and fee to get leads from buyers, sellers and tenants.</p>
          <Link href="/agents/profile" className="btn mt-3">Create agent profile</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

async function Filters({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <form className="mt-6 flex flex-wrap gap-3" action="/agents">
      <select name="city" defaultValue={typeof sp.city === "string" ? sp.city : ""} className="input w-auto">
        <option value="">All cities</option>
        {CITIES.filter((c) => c.markets.length).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <input name="q" defaultValue={typeof sp.q === "string" ? sp.q : ""} className="input w-64" placeholder="Name, agency or locality" />
      <select name="sort" defaultValue={typeof sp.sort === "string" ? sp.sort : ""} className="input w-auto">
        <option value="">Top rated</option><option value="deals">Most deals</option><option value="experience">Most experience</option>
      </select>
      <button className="btn">Search</button>
    </form>
  );
}

async function Results({ searchParams }: { searchParams: SP }) {
  await connection();
  const sp = await searchParams;
  const city = typeof sp.city === "string" && CITY_BY_SLUG[sp.city] ? sp.city : undefined;
  const agents = await searchAgents({ city, q: typeof sp.q === "string" ? sp.q.slice(0, 60) : undefined, sort: typeof sp.sort === "string" ? sp.sort : undefined });
  return (
    <>
      <p className="mb-4 text-sm text-muted">{agents.length} agents{city ? ` in ${CITY_BY_SLUG[city].name}` : ""}</p>
      {agents.length ? <div className="grid gap-4 md:grid-cols-2">{agents.map((a) => <AgentCard key={a.id} a={a} />)}</div> : <p className="text-muted">No agents match.</p>}
    </>
  );
}
