import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Building2, FileSearch, HandCoins, Home, KeyRound, LineChart as ChartIcon, ShieldCheck } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { PropertyCard } from "@/components/property-card";
import { Footer } from "@/components/footer";
import { latestListings } from "@/lib/queries/properties";
import { cityStats } from "@/lib/queries/market";
import { getUser } from "@/lib/auth";
import { savedIds } from "@/lib/queries/user";
import { CITY_BY_SLUG } from "@/lib/geo";
import { inr, pct } from "@/lib/format";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e2178] via-brand to-[#5b5fe8]">
        <Skyline />
        <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col justify-center px-4 py-16">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Every home in India, on one map. No brokerage.
          </h1>
          <p className="mb-6 mt-3 max-w-xl text-lg text-white/85">
            Talk to owners directly. See price history, the Nakshly Estimate and the land records before you pay a rupee.
          </p>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3">
        {[
          { icon: <Home className="h-10 w-10" />, title: "Buy a home", body: "Search verified flats, villas and plots with price history and an independent estimate on every home.", href: "/buy", cta: "Browse homes" },
          { icon: <HandCoins className="h-10 w-10" />, title: "Sell a home", body: "Get a free estimate, list directly to buyers, or compare agents who publish their fees up front.", href: "/sell", cta: "See your options" },
          { icon: <KeyRound className="h-10 w-10" />, title: "Rent a home", body: "Owner listings with zero brokerage, one renter profile for every application and clear move-in costs.", href: "/rent", cta: "Find rentals" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="card group flex flex-col items-center p-8 text-center transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-soft text-brand">{c.icon}</div>
            <h2 className="mt-5 text-2xl font-bold">{c.title}</h2>
            <p className="mt-2 text-muted">{c.body}</p>
            <span className="btn-outline mt-6">{c.cta}</span>
          </Link>
        ))}
      </section>

      <Suspense fallback={<div className="mx-auto h-80 max-w-7xl animate-pulse rounded-xl bg-paper" />}>
        <Fresh />
      </Suspense>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Nakshly Estimate</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Know what any home is worth — before you negotiate.</h2>
            <p className="mt-3 text-muted">
              Our model reads nearby registered sales and signed rent agreements, adjusts for floor, age, furnishing and Vastu facing,
              and shows you the comparables it used. No black box.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/home-value" className="btn">Estimate my home</Link>
              <Link href="/about#data" className="btn-ghost">How it works</Link>
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted">3 BHK · 1,180 sq ft · Floor 9 of 22 · East facing</p>
            <p className="mt-2 text-4xl font-bold">₹1.42 Cr</p>
            <p className="text-sm text-muted">Estimated value · range ₹1.33 Cr – ₹1.51 Cr</p>
            <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-brand-soft via-brand to-brand-soft" />
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-paper p-3"><p className="font-bold">₹38,500</p><p className="text-muted">Rent estimate</p></div>
              <div className="rounded-lg bg-paper p-3"><p className="font-bold">3.3%</p><p className="text-muted">Rental yield</p></div>
              <div className="rounded-lg bg-paper p-3"><p className="font-bold">+8.1%</p><p className="text-muted">1-yr change</p></div>
            </div>
            <p className="mt-3 text-xs text-muted">Illustration</p>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Cities />
      </Suspense>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Built for how India buys and rents</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [<ShieldCheck key="i" className="h-6 w-6" />, "RERA, front and centre", "New projects show their RERA number. Agents show their RERA agent registration. Check it before you pay."],
            [<HandCoins key="i" className="h-6 w-6" />, "Fees you can see", "Agents publish their fee — flat or percentage — on their profile. Owner listings have no brokerage."],
            [<ChartIcon key="i" className="h-6 w-6" />, "Real prices, not asks", "Market trends use registered sales and signed rent agreements, so you see what homes actually go for."],
            [<FileSearch key="i" className="h-6 w-6" />, "7/12 to Khatauni, explained", "Every listing links to the official land record portal for its state — AnyROR, Mahabhumi, Bhoomi, UP Bhulekh — so you can check the owner yourself."],
          ].map(([icon, t, d]) => (
            <div key={t as string} className="rounded-xl border border-line p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</div>
              <p className="mt-4 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-bold">Building a project? List it on Nakshly.</p>
            <p className="text-white/70">Show configurations, RERA details and construction updates to serious buyers.</p>
          </div>
          <Link href="/new-projects" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink"><Building2 className="h-4 w-4" /> Explore new projects</Link>
        </div>
      </section>
      <Footer />
    </>
  );
}

async function Fresh() {
  await connection();
  const [sale, rent, user] = await Promise.all([latestListings(null, "sale", 8), latestListings(null, "rent", 4), getUser()]);
  const saved = await savedIds(user?.id);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fresh on Nakshly</h2>
          <p className="text-muted">Newly listed homes for sale and rent</p>
        </div>
        <Link href="/buy" className="text-sm font-semibold text-brand hover:underline">See all homes</Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...sale.slice(0, 4), ...rent.slice(0, 4)].map((l) => <PropertyCard key={l.id} l={l} saved={saved.has(l.id)} />)}
      </div>
    </section>
  );
}

async function Cities() {
  await connection();
  const stats = (await cityStats()).filter((s) => CITY_BY_SLUG[s.city]);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16">
      <h2 className="text-2xl font-bold tracking-tight">Explore cities</h2>
      <p className="text-muted">Median price per sq ft (carpet) from the last six months of transactions</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.city} href={`/buy/${s.city}`} className="card p-4 transition hover:border-brand hover:shadow-md">
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-bold">{CITY_BY_SLUG[s.city].name}</p>
              {s.yoy != null && <span className={`text-xs font-semibold ${s.yoy >= 0 ? "text-good" : "text-bad"}`}>{s.yoy >= 0 ? "▲" : "▼"} {pct(Math.abs(s.yoy))} YoY</span>}
            </div>
            <p className="text-sm text-muted">{CITY_BY_SLUG[s.city].state}</p>
            <p className="mt-3 text-sm">{s.sale_ppsf ? <><b>{inr(s.sale_ppsf)}</b>/sq ft</> : "—"} · rent {s.rent_ppsf ? <b>₹{Math.round(s.rent_ppsf)}</b> : "—"}/sq ft</p>
            <p className="mt-1 text-xs text-muted">{s.active_sale} for sale · {s.active_rent} for rent</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Skyline() {
  const blocks = [[0, 120], [60, 200], [130, 150], [190, 260], [260, 180], [330, 300], [400, 210], [470, 160], [530, 240], [600, 190], [670, 280], [740, 170], [810, 230], [880, 140], [940, 260], [1010, 200], [1080, 160], [1140, 230], [1210, 180], [1280, 250], [1350, 150], [1420, 220]];
  return (
    <svg className="absolute bottom-0 left-0 h-56 w-full opacity-25" viewBox="0 0 1500 300" preserveAspectRatio="none" aria-hidden>
      {blocks.map(([x, h]) => <rect key={x} x={x} y={300 - h} width="62" height={h} fill="#fff" rx="2" />)}
    </svg>
  );
}
