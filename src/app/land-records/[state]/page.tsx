import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Footer } from "@/components/footer";
import { BUY_CHECKLIST, LAND_BY_SLUG, LAND_RECORDS } from "@/lib/land-records";
import { CITIES } from "@/lib/geo";

export function generateStaticParams() {
  return LAND_RECORDS.map((r) => ({ state: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/land-records/[state]">): Promise<Metadata> {
  const r = LAND_BY_SLUG[(await params).state];
  if (!r) return { title: "Land records" };
  return {
    title: `${r.terms.slice(0, 2).join(" & ")} online — check ${r.state} land records`,
    description: `How to check ${r.terms.join(", ")} for a property in ${r.state} on ${r.portals[0].name}, and what to verify before you buy or rent.`,
    alternates: { canonical: `/land-records/${r.slug}` },
  };
}

export default function Page({ params }: PageProps<"/land-records/[state]">) {
  return (
    <>
      <Suspense fallback={<div className="mx-auto h-[600px] w-full max-w-3xl animate-pulse bg-paper" />}>
        <Guide params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function Guide({ params }: Pick<PageProps<"/land-records/[state]">, "params">) {
  const r = LAND_BY_SLUG[(await params).state];
  if (!r) notFound();
  const cities = CITIES.filter((c) => c.state === r.state && c.markets.length);
  return (
      <main className="mx-auto max-w-3xl px-4 py-12 leading-relaxed">
        <Link href="/land-records" className="text-sm text-muted hover:underline">← All states</Link>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{r.state} land records: {r.terms.slice(0, 2).join(" & ")}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {r.terms.map((t) => <span key={t} className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-dark">{t}</span>)}
        </div>
        <p className="mt-5 text-lg">{r.summary}</p>

        <h2 className="mt-10 text-2xl font-bold">Where to check, free</h2>
        <div className="mt-3 space-y-3">
          {r.portals.map((p) => (
            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="card flex items-start justify-between gap-4 p-4 hover:border-brand">
              <span><b>{p.name}</b><br /><span className="text-sm text-muted">{p.what}</span></span>
              <span className="flex shrink-0 items-center gap-1 text-sm text-brand">{p.url.replace("https://", "")} <ExternalLink className="h-3.5 w-3.5" /></span>
            </a>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold">How to use it</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li>Ask the seller or owner for the district, taluka / tehsil, village and <b>{r.idLabel}</b>. It&apos;s on their sale deed or tax bill.</li>
          <li>Open {r.portals[0].name}, choose the same district, taluka and village, and enter the number.</li>
          <li>Check the owner&apos;s name matches the person you&apos;re dealing with, and that the area matches what&apos;s being sold.</li>
          <li>Look at the rights / encumbrance column and recent mutation entries for loans, court orders or a pending transfer.</li>
        </ol>

        <h2 className="mt-10 text-2xl font-bold">Before you pay a token amount</h2>
        <ul className="mt-3 space-y-2">
          {BUY_CHECKLIST.map((c) => <li key={c} className="flex gap-2"><span className="text-good">✓</span>{c}</li>)}
        </ul>

        {cities.length > 0 && (
          <>
            <h2 className="mt-10 text-2xl font-bold">Homes in {r.state}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {cities.map((c) => (
                <span key={c.slug} className="flex gap-1">
                  <Link href={`/buy/${c.slug}`} className="chip">Buy in {c.name}</Link>
                  <Link href={`/rent/${c.slug}`} className="chip">Rent in {c.name}</Link>
                </span>
              ))}
            </div>
          </>
        )}
        <p className="mt-10 text-sm text-muted">
          Portals are run by the {r.state} government; Nakshly isn&apos;t affiliated with them. Portal names and addresses change — always confirm you are on a .gov.in or .nic.in site.
        </p>
      </main>
  );
}
