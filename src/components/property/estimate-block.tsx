import { fmtDate, inr, listingPrice, pct } from "@/lib/format";
import type { EstimateResult } from "@/lib/estimate";

export function EstimateBlock({ est, kind, price }: { est: EstimateResult; kind: "sale" | "rent"; price?: number }) {
  const f = (n: number) => listingPrice(n, kind);
  const lo = est.low;
  const hi = est.high;
  const pos = price ? Math.min(100, Math.max(0, ((price - lo) / (hi - lo)) * 100)) : null;
  return (
    <div className="mt-4 rounded-xl border border-line p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold">{f(est.value)}</p>
          <p className="text-sm text-muted">Estimated {kind === "sale" ? "market value" : "monthly rent"} · {inr(est.ppsf)}/sq ft carpet</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${est.confidence === "high" ? "bg-emerald-50 text-good" : est.confidence === "medium" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-bad"}`}>
          {est.confidence} confidence
        </span>
      </div>
      <div className="relative mt-6 h-2 rounded-full bg-gradient-to-r from-brand-soft via-brand to-brand-soft">
        {pos != null && (
          <div className="absolute -top-6 -translate-x-1/2 text-center text-xs font-semibold" style={{ left: `${pos}%` }}>
            Asking<div className="mx-auto mt-1 h-4 w-0.5 bg-ink" />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-sm"><span>{f(lo)}</span><span className="text-muted">Estimated range</span><span>{f(hi)}</span></div>
      <p className="mt-4 text-sm text-muted">
        Based on {est.compsUsed} {kind === "sale" ? "registered sales" : "signed rent agreements"} within 6 km over the last 3 years,
        adjusted for size, floor, age, furnishing and facing. Prices nearby have moved {est.annualGrowth >= 0 ? "+" : ""}{pct(est.annualGrowth)} a year.
        This is not an appraisal.
      </p>
      {est.comps.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-semibold text-brand">See comparable {kind === "sale" ? "sales" : "rentals"} used</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left">
              <thead className="text-muted"><tr><th className="py-1">Date</th><th>Home</th><th>Price</th><th>Distance</th><th>Weight</th></tr></thead>
              <tbody>
                {est.comps.map((c, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-1.5">{fmtDate(c.date)}</td>
                    <td>{c.bhk ? `${c.bhk} BHK ` : ""}{c.carpet_sqft} sq ft, {c.locality}</td>
                    <td>{f(c.price)}</td>
                    <td>{c.distanceKm.toFixed(1)} km</td>
                    <td>{pct(c.weight, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
