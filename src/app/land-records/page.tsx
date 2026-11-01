import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Footer } from "@/components/footer";
import { BUY_CHECKLIST, LAND_RECORDS } from "@/lib/land-records";

export const metadata: Metadata = {
  title: "Check land records online — 7/12, 8-A, Khatauni, Patta, Khata by state",
  description: "Where to check 7/12 (AnyROR, Mahabhumi), 8-A, Khatauni, Jamabandi, Patta-Chitta, RTC and Encumbrance Certificates online for every Indian state — free, on official portals.",
  alternates: { canonical: "/land-records" },
};

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Nakshly Records</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Check any property&apos;s records, free</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted">
          Every state keeps a record of who owns which piece of land — 7/12 in Gujarat and Maharashtra, Khatauni in UP, Patta in Tamil Nadu, RTC in Karnataka.
          Pick your state to see what the record is called, how to read it and the official portal to check it on.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAND_RECORDS.map((r) => (
            <Link key={r.slug} href={`/land-records/${r.slug}`} className="card p-4 transition hover:border-brand hover:shadow-md">
              <p className="flex items-center gap-2 text-lg font-bold"><FileSearch className="h-5 w-5 text-brand" /> {r.state}</p>
              <p className="mt-1 text-sm text-muted">{r.terms.join(" · ")}</p>
            </Link>
          ))}
        </div>
        <h2 className="mt-12 text-2xl font-bold">Before you pay a token amount, anywhere in India</h2>
        <ul className="mt-3 space-y-2">
          {BUY_CHECKLIST.map((c) => <li key={c} className="flex gap-2"><span className="text-good">✓</span>{c}</li>)}
        </ul>
        <div className="mt-8 rounded-2xl bg-ink p-6 text-white">
          <p className="text-lg font-bold">Not sure what you&apos;re looking at?</p>
          <p className="text-white/70">A property lawyer checks 30 years of title, the EC and mutation entries for a fixed fee.</p>
          <Link href="/services?for=title-check" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink">Get a title check</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
