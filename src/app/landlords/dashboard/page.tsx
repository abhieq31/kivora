import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { applicationsReceived, leases, myListings } from "@/lib/queries/user";
import { fmtDate, inr } from "@/lib/format";
import { endLease, recordPayment, undoPayment } from "@/lib/actions/landlord";
import { setApplicationStatus } from "@/lib/actions/homes";
import { LeaseForm } from "./lease-form";

export const metadata: Metadata = { title: "Rentals dashboard" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Rentals dashboard</h1>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><Body /></Suspense>
    </div>
  );
}

function monthsOf(start: string, end: string) {
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(Math.min(new Date(end).getTime(), Date.now()));
  const d = new Date(s.getFullYear(), s.getMonth(), 1);
  while (d <= e && out.length < 36) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

async function Body() {
  await connection();
  const u = await requireUser("/landlords/dashboard");
  const [ls, apps, listings] = await Promise.all([leases(u.id), applicationsReceived(u.id), myListings(u.id)]);
  const rentals = listings.filter((l) => l.listing_type === "rent");
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const due = ls.filter((l) => new Date(l.end_date) >= now && !l.payments.some((p) => p.month === thisMonth));
  const monthly = ls.filter((l) => new Date(l.end_date) >= now).reduce((t, l) => t + l.rent, 0);

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[["Active leases", ls.filter((l) => new Date(l.end_date) >= now).length], ["Monthly rent roll", inr(monthly)], ["Unpaid this month", due.length], ["New applications", apps.filter((a) => a.status === "submitted").length]].map(([k, v]) => (
          <div key={k as string} className="card p-4"><p className="text-xs text-muted">{k}</p><p className="text-2xl font-bold">{v}</p></div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="h-section">Leases & rent ledger</h2>
        {ls.length === 0 && <p className="mt-2 text-sm text-muted">No leases yet. Add one below once you sign an agreement.</p>}
        <div className="mt-4 space-y-4">
          {ls.map((l) => {
            const months = monthsOf(l.start_date, l.end_date);
            const paid = new Map(l.payments.map((p) => [p.month, p]));
            const ended = new Date(l.end_date) < now;
            return (
              <div key={l.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{l.label} {ended && <span className="ml-2 rounded bg-slate-100 px-2 text-xs">Ended</span>}</p>
                    <p className="text-sm text-muted">{l.tenant_name} · {l.tenant_phone} · {inr(l.rent)}/mo due on day {l.due_day} · deposit {inr(l.deposit)}</p>
                    <p className="text-sm text-muted">{fmtDate(l.start_date)} → {fmtDate(l.end_date)} · {l.escalation_pct}% yearly escalation</p>
                  </div>
                  <form action={endLease}><input type="hidden" name="id" value={l.id} /><button className="text-sm text-bad hover:underline">Delete lease</button></form>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {months.map((m) => {
                    const p = paid.get(m);
                    const overdue = !p && (m < thisMonth || (m === thisMonth && now.getDate() > l.due_day));
                    return (
                      <form key={m} action={p ? undoPayment : recordPayment}>
                        <input type="hidden" name="lease_id" value={l.id} />
                        <input type="hidden" name="month" value={m} />
                        <button title={p ? `Paid ${p.paid_on ? fmtDate(p.paid_on) : ""} via ${p.method} — click to undo` : "Mark as paid"}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${p ? "border-emerald-200 bg-emerald-50 text-good" : overdue ? "border-red-200 bg-red-50 text-bad" : "border-line"}`}>
                          {new Date(m + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" })} {p ? "✓" : overdue ? "due" : ""}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <details className="card mt-4 p-5">
          <summary className="cursor-pointer font-semibold text-brand">+ Add a lease</summary>
          <LeaseForm listings={rentals.map((r) => ({ id: r.id, label: `${r.bhk} BHK, ${r.society || r.locality}` }))} />
        </details>
      </section>

      <section className="mt-10">
        <h2 className="h-section">Applications</h2>
        {apps.length === 0 ? <p className="mt-2 text-sm text-muted">No applications yet. Tenants apply from your rental&apos;s page with their renter profile.</p> : (
          <div className="mt-4 space-y-3">
            {apps.map((a) => (
              <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="text-sm">
                  <p className="font-semibold">{a.full_name} <span className="ml-2 rounded bg-paper px-2 text-xs uppercase text-muted">{a.status}</span></p>
                  <p className="text-muted">For <Link className="text-brand hover:underline" href={`/property/${a.property_id}`}>{a.bhk} BHK, {a.locality}</Link> · applied {fmtDate(a.created_at)}</p>
                  <p>{a.occupation}{a.employer ? ` at ${a.employer}` : ""} · {a.monthly_income ? `${inr(a.monthly_income)}/mo income (${(a.monthly_income / a.price).toFixed(1)}× rent)` : "income not shared"} · {a.occupants} people ({a.household}){a.pets ? " · has pets" : ""}</p>
                  {a.about && <p className="mt-1 text-muted">“{a.about}”</p>}
                </div>
                <div className="flex gap-2">
                  {(["shortlisted", "accepted", "declined"] as const).map((s) => (
                    <form key={s} action={setApplicationStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value={s} /><button className={s === "accepted" ? "btn px-3 py-1.5 text-xs" : "btn-ghost text-xs"}>{s[0].toUpperCase() + s.slice(1)}</button></form>
                  ))}
                  <a className="btn-ghost text-xs" href={`tel:${a.phone}`}>Call</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between"><h2 className="h-section">Your rental listings</h2><Link href="/post-property" className="btn-outline">List a rental</Link></div>
        {rentals.length === 0 ? <p className="mt-2 text-sm text-muted">None yet.</p> : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {rentals.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <Link href={`/property/${r.id}`} className="font-medium hover:underline">{r.bhk} BHK, {r.society || r.locality}</Link>
                <span className="text-muted">{inr(r.price)}/mo · {r.status} · {r.views} views · {r.leads} leads</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
