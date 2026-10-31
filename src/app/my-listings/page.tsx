import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { myListings } from "@/lib/queries/user";
import { changePrice, deleteListing, updateListingStatus } from "@/lib/actions/listings";
import { listingPrice, timeAgo } from "@/lib/format";
import { PROPERTY_TYPES } from "@/lib/types";
import { propertyHref } from "@/components/property-card";

export const metadata: Metadata = { title: "My listings" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">My listings</h1>
        <Link href="/post-property" className="btn">Post a property</Link>
      </div>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><List /></Suspense>
    </div>
  );
}

async function List() {
  await connection();
  const u = await requireUser("/my-listings");
  const ls = await myListings(u.id);
  if (!ls.length) return <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center"><p className="font-semibold">You haven&apos;t listed anything yet</p><p className="mt-1 text-sm text-muted">It&apos;s free, and owner listings show “no brokerage”.</p></div>;
  return (
    <div className="mt-6 space-y-4">
      {ls.map((l) => {
        const closedStatus = l.listing_type === "sale" ? "sold" : "rented";
        return (
          <div key={l.id} className="card flex flex-col gap-4 p-4 md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.photos[0] ?? "/img/demo/tower/3.svg"} alt="" className="h-32 w-full rounded-lg object-cover md:w-48" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${l.status === "active" ? "bg-emerald-50 text-good" : l.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{l.status.replace("_", " ")}</span>
                <span className="text-xs text-muted">Updated {timeAgo(l.updated_at)}</span>
              </div>
              <Link href={propertyHref(l)} className="mt-1 block text-lg font-bold hover:underline">{listingPrice(l.price, l.listing_type)} · {l.bhk ? `${l.bhk} BHK ` : ""}{PROPERTY_TYPES[l.property_type]}</Link>
              <p className="text-sm text-muted">{l.society ? `${l.society}, ` : ""}{l.locality}</p>
              <p className="mt-2 flex gap-4 text-sm text-muted">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{l.views}</span>
                <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{l.saves}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{l.leads} leads</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 md:w-64">
              <form action={changePrice} className="flex gap-2">
                <input type="hidden" name="id" value={l.id} />
                <input name="price" className="input" inputMode="numeric" placeholder="New price (₹)" aria-label="New price" />
                <button className="btn-ghost shrink-0">Update</button>
              </form>
              <div className="flex flex-wrap gap-2">
                <Link href={`/post-property?edit=${l.id}`} className="btn-ghost flex-1">Edit</Link>
                {l.status === "active" ? (
                  <>
                    <form action={updateListingStatus} className="flex-1"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value={closedStatus} /><button className="btn-ghost w-full">Mark {closedStatus}</button></form>
                    <form action={updateListingStatus} className="flex-1"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="off_market" /><button className="btn-ghost w-full">Pause</button></form>
                  </>
                ) : l.status !== "draft" ? (
                  <form action={updateListingStatus} className="flex-1"><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="active" /><button className="btn-ghost w-full">Relist</button></form>
                ) : null}
                <form action={deleteListing}><input type="hidden" name="id" value={l.id} /><button className="btn-ghost text-bad">Delete</button></form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
