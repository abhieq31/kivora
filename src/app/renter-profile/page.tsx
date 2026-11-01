import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { myApplications, renterProfile } from "@/lib/queries/user";
import { fmtDate, inr } from "@/lib/format";
import { RenterForm } from "./form";

export const metadata: Metadata = { title: "Renter profile" };

export default function Page({ searchParams }: PageProps<"/renter-profile">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Your renter profile</h1>
      <p className="mt-1 text-muted">Fill this once and apply to any rental on Nakshly in one tap. Landlords see it only when you apply.</p>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-xl bg-paper" />}><Body searchParams={searchParams} /></Suspense>
    </div>
  );
}

async function Body({ searchParams }: { searchParams: PageProps<"/renter-profile">["searchParams"] }) {
  await connection();
  const u = await requireUser("/renter-profile");
  const [p, apps] = await Promise.all([renterProfile(u.id), myApplications(u.id)]);
  const next = (await searchParams).next;
  return (
    <>
      <RenterForm initial={p ? { ...p, monthly_income: p.monthly_income ?? "", move_in: p.move_in ? new Date(p.move_in).toISOString().slice(0, 10) : "" } : { full_name: u.name, phone: u.phone ?? "" }} next={typeof next === "string" ? next : ""} />
      <h2 className="h-section mt-10">Applications</h2>
      {apps.length === 0 ? <p className="mt-2 text-sm text-muted">You haven&apos;t applied to any rentals yet.</p> : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
          {apps.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <Link href={`/property/${a.property_id}`} className="font-medium hover:underline">{a.bhk} BHK, {a.locality} · {inr(a.price)}/mo</Link>
              <span className="text-muted">{fmtDate(a.created_at)} · <b className="uppercase">{a.status}</b></span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
