import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Bell, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { savedHomes, savedSearches } from "@/lib/queries/user";
import { deleteSavedSearch } from "@/lib/actions/homes";
import { fmtDate } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";

export const metadata: Metadata = { title: "Saved homes" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Saved homes & searches</h1>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-paper" />}><Body /></Suspense>
    </div>
  );
}

async function Body() {
  await connection();
  const u = await requireUser("/saved");
  const [homes, searches] = await Promise.all([savedHomes(u.id), savedSearches(u.id)]);
  return (
    <>
      <section className="mt-8">
        <h2 className="h-section">Saved searches ({searches.length})</h2>
        {searches.length === 0 ? <p className="mt-2 text-sm text-muted">Use “Save search” on any search page to come back to it.</p> : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {searches.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                <Link href={s.path} className="flex items-center gap-2 font-medium hover:text-brand"><Bell className="h-4 w-4 text-brand" /> {s.name}</Link>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span>Saved {fmtDate(s.created_at)}</span>
                  <form action={deleteSavedSearch}><input type="hidden" name="id" value={s.id} /><button aria-label="Delete saved search" className="rounded p-1 hover:bg-paper"><Trash2 className="h-4 w-4" /></button></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-10">
        <h2 className="h-section">Saved homes ({homes.length})</h2>
        {homes.length === 0 ? <p className="mt-2 text-sm text-muted">Tap the heart on any home to save it here. <Link href="/buy" className="text-brand underline">Start browsing</Link></p> : (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{homes.map((h) => <PropertyCard key={h.id} l={h} saved />)}</div>
        )}
      </section>
    </>
  );
}
