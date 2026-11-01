import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Footer } from "@/components/footer";
import { FAIR_TERMS, RENT_RULES } from "@/lib/rent-rules";

export const metadata: Metadata = {
  title: "Renting fairly in India — tenant and owner rights, state by state",
  description: "Deposit limits, notice before visits, who pays for repairs, police tenant registration and rent agreement rules for every major Indian state, in plain language.",
};

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-12 leading-relaxed">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Renting fairly</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">What a fair tenancy looks like</h1>
        <p className="mt-3 text-lg text-muted">
          Most Indian rentals run on broker templates that put every risk on the tenant. The Model Tenancy Act, 2021 — the central government&apos;s model law,
          adopted in full or in part by several states — sets out a balanced default. These are the terms Nakshly agreements use.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FAIR_TERMS.map((t) => (
            <div key={t.title} className="rounded-xl border border-line p-4">
              <p className="font-semibold">{t.title}</p>
              <p className="mt-1 text-sm text-muted">{t.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold">If an owner is making life difficult</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li><b>Put it in writing.</b> Requests for repairs, visits and complaints — by message, not just calls. A Nakshly <Link className="text-brand underline" href="/agreements">home diary</Link> timestamps each entry for both of you.</li>
          <li><b>Read your agreement.</b> Many demands (deep-cleaning walls, extra charges) aren&apos;t in it. <Link className="text-brand underline" href="/agreements/check">Check which clauses are one-sided</Link>.</li>
          <li><b>You can&apos;t be thrown out without notice.</b> The owner has to follow the notice period in the agreement and the law; locking you out or cutting water or power is not allowed.</li>
          <li><b>Deposit disputes:</b> ask for itemised deductions with receipts, in writing. In states that have set up Rent Authorities, you can apply there; otherwise a lawyer&apos;s notice usually settles it.</li>
          <li><b>Threats or intimidation</b> are a police matter — call 112.</li>
        </ol>

        <h2 className="mt-12 text-2xl font-bold">And for owners</h2>
        <p className="mt-2">A fair agreement protects you too: a registered or properly stamped agreement, a police-registered tenant, a move-in inventory and a diary of payments make disputes rare and short. List free on Nakshly and get <Link className="text-brand underline" href="/agreements">the paperwork done in minutes</Link>.</p>

        <h2 className="mt-12 text-2xl font-bold">State by state</h2>
        <div className="mt-4 space-y-3">
          {Object.values(RENT_RULES).map((r) => (
            <details key={r.state} className="card p-4">
              <summary className="cursor-pointer font-semibold">{r.state} <span className="font-normal text-muted">— {r.agreementName}</span></summary>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="font-semibold">Stamp duty</dt><dd className="text-muted">{r.stampDuty}</dd></div>
                <div><dt className="font-semibold">Registration</dt><dd className="text-muted">{r.registration}</dd></div>
                <div><dt className="font-semibold">Police tenant registration</dt><dd className="text-muted">{r.police.note} <a href={r.police.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand">{r.police.name} <ExternalLink className="h-3 w-3" /></a></dd></div>
                {r.notes.map((n) => <div key={n}><dd className="text-muted">• {n}</dd></div>)}
              </dl>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">General information, last reviewed November 2026 — not legal advice. Rates and portals change; confirm on the official state website before paying.</p>
      </main>
      <Footer />
    </>
  );
}
