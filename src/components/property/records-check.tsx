import Link from "next/link";
import { ExternalLink, FileCheck2 } from "lucide-react";
import { BUY_CHECKLIST, LAND_BY_STATE, RENT_CHECKLIST } from "@/lib/land-records";

/** "Check the records" — state-specific record names and official portals, shown on every listing. */
export function RecordsCheck({ state, sale, surveyNo }: { state: string; sale: boolean; surveyNo: string }) {
  const rec = LAND_BY_STATE[state];
  return (
    <section>
      <h2 className="h-section">Check the records before you pay</h2>
      <p className="mt-1 text-sm text-muted">
        Nakshly never asks for a token amount. Verify ownership yourself on the government portal — it&apos;s free and takes five minutes.
      </p>
      {rec && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-brand" />
            <p className="font-semibold">In {rec.state}, ask the {sale ? "seller" : "owner"} for:</p>
            {rec.terms.map((t) => <span key={t} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-dark">{t}</span>)}
          </div>
          {surveyNo && <p className="mt-3 text-sm">{rec.idLabel} given by the {sale ? "seller" : "owner"}: <b>{surveyNo}</b></p>}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {rec.portals.map((p) => (
              <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-paper p-3 text-sm hover:ring-1 hover:ring-brand">
                <span className="flex items-center gap-1 font-semibold">{p.name} <ExternalLink className="h-3.5 w-3.5" /></span>
                <span className="text-muted">{p.what}</span>
              </a>
            ))}
          </div>
          <Link href={`/land-records/${rec.slug}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">How to read {rec.terms[0]} →</Link>
        </div>
      )}
      <ul className="mt-4 space-y-1.5 text-sm">
        {(sale ? BUY_CHECKLIST : RENT_CHECKLIST).map((c) => <li key={c} className="flex gap-2"><span className="text-good">✓</span>{c}</li>)}
      </ul>
      <Link href={`/services?for=${sale ? "title-check" : "rent-agreement"}`} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
        {sale ? "Get a lawyer's title check — fixed fee →" : "Get the rent agreement made — fixed fee →"}
      </Link>
    </section>
  );
}
