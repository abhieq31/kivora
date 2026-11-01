import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminSetAgent, adminSetListing } from "@/lib/actions/admin";
import { listingPrice, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><Body /></Suspense>
    </div>
  );
}

async function Body() {
  await connection();
  await requireAdmin();
  const q = await db();
  const [[stats], listings, agents, leads, services] = await Promise.all([
    q<{ users: number; listings: number; user_listings: number; inquiries: number; loan_leads: number; leases: number }>(`select
      (select count(*)::int from users) as users, (select count(*)::int from properties where status = 'active') as listings,
      (select count(*)::int from properties where not is_demo) as user_listings, (select count(*)::int from inquiries) as inquiries,
      (select count(*)::int from loan_leads) as loan_leads, (select count(*)::int from leases) as leases`),
    q<{ id: number; price: number; listing_type: "sale" | "rent"; bhk: number; locality: string; city: string; created_at: string; verified: boolean; status: string; owner: string | null }>(
      `select p.id, p.price, p.listing_type, p.bhk, p.locality, p.city, p.created_at, p.verified, p.status, u.email as owner
       from properties p left join users u on u.id = p.owner_id where not p.is_demo order by p.verified, p.created_at desc limit 50`),
    q<{ id: number; name: string; agency: string; rera_id: string; city: string; verified: boolean }>("select id, name, agency, rera_id, city, verified from agents where not is_demo order by verified, created_at desc limit 50"),
    q<{ id: number; name: string; phone: string; city: string; loan_amount: number; created_at: string }>("select * from loan_leads order by created_at desc limit 20"),
    q<{ id: number; service: string; name: string; phone: string; city: string; price: number | null; property_id: number | null; notes: string; created_at: string }>(
      "select * from service_requests order by created_at desc limit 50"),
  ]);
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(stats).map(([k, v]) => <div key={k} className="card p-4"><p className="text-xs capitalize text-muted">{k.replace("_", " ")}</p><p className="text-2xl font-bold">{v}</p></div>)}
      </div>
      <h2 className="h-section mt-10">Service requests (revenue)</h2>
      <p className="text-sm text-muted">Call back within one working day. Collect payment after delivery.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-muted"><tr><th className="py-2">Service</th><th>Name</th><th>Phone</th><th>City</th><th>Fee</th><th>When</th></tr></thead>
          <tbody>
            {services.map((r) => (
              <tr key={r.id} className="border-b border-line align-top">
                <td className="py-2">{r.service}{r.property_id && <> · <Link className="text-brand hover:underline" href={`/p/${r.property_id}`}>#{r.property_id}</Link></>}{r.notes && <p className="text-xs text-muted">{r.notes}</p>}</td>
                <td>{r.name}</td><td>{r.phone}</td><td>{r.city}</td><td>{r.price == null ? "Partner" : `₹${r.price}`}</td><td>{timeAgo(r.created_at)}</td>
              </tr>
            ))}
            {!services.length && <tr><td colSpan={6} className="py-3 text-muted">No requests yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="h-section mt-10">User listings</h2>
      <p className="text-sm text-muted">Verify after checking ownership documents (sale deed / tax receipt) on a call.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-muted"><tr><th className="py-2">Listing</th><th>Owner</th><th>Status</th><th>Posted</th><th /></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-line">
                <td className="py-2"><Link className="text-brand hover:underline" href={`/property/${l.id}`}>#{l.id} {l.bhk} BHK {l.locality} · {listingPrice(l.price, l.listing_type)}</Link></td>
                <td>{l.owner}</td><td>{l.status}{l.verified && " · verified"}</td><td>{timeAgo(l.created_at)}</td>
                <td className="flex gap-2 py-2">
                  <form action={adminSetListing}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value={l.verified ? "unverify" : "verify"} /><button className="btn-ghost text-xs">{l.verified ? "Unverify" : "Verify"}</button></form>
                  <form action={adminSetListing}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="remove" /><button className="btn-ghost text-xs text-bad">Take down</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!listings.length && <p className="py-4 text-sm text-muted">No user listings yet.</p>}
      </div>
      <h2 className="h-section mt-10">Agents</h2>
      <p className="text-sm text-muted">Check the RERA agent number on the state RERA portal before verifying.</p>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-sm">
        {agents.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 p-3">
            <Link className="text-brand hover:underline" href={`/agents/${a.id}`}>{a.name} · {a.agency} · {a.city} · RERA {a.rera_id}</Link>
            <form action={adminSetAgent}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="op" value={a.verified ? "unverify" : "verify"} /><button className="btn-ghost text-xs">{a.verified ? "Unverify" : "Verify"}</button></form>
          </li>
        ))}
        {!agents.length && <li className="p-3 text-muted">No agent sign-ups yet.</li>}
      </ul>
      <h2 className="h-section mt-10">Loan leads</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-sm">
        {leads.map((l) => <li key={l.id} className="p-3">{l.name} · {l.phone} · {l.city} · {listingPrice(l.loan_amount, "sale")} · {timeAgo(l.created_at)}</li>)}
        {!leads.length && <li className="p-3 text-muted">None yet.</li>}
      </ul>
    </>
  );
}
