import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { agentForUser } from "@/lib/queries/agents";
import { getPropertyForOwner } from "@/lib/queries/properties";
import { ListingWizard, type ListingDraft } from "@/components/listing/listing-wizard";

export const metadata: Metadata = { title: "Post your property" };

export default function Page({ searchParams }: PageProps<"/post-property">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-paper" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Inner({ searchParams }: { searchParams: PageProps<"/post-property">["searchParams"] }) {
  await connection();
  const sp = await searchParams;
  const editId = Number(sp.edit);
  const user = await requireUser(`/post-property${editId ? `?edit=${editId}` : ""}`);
  const agent = await agentForUser(user.id);
  let initial: ListingDraft | undefined;
  if (editId) {
    const p = await getPropertyForOwner(editId, user.id);
    if (!p) notFound();
    const s = (v: unknown) => (v == null ? "" : String(v));
    const date = (v: unknown) => (v ? new Date(String(v)).toISOString().slice(0, 10) : "");
    initial = {
      ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v as ListingDraft[string]])),
      builtup_sqft: s(p.builtup_sqft), super_sqft: s(p.super_sqft), floor: s(p.floor), total_floors: s(p.total_floors), age_years: s(p.age_years),
      deposit: s(p.deposit), maintenance_monthly: s(p.maintenance_monthly), price: s(p.price), carpet_sqft: s(p.carpet_sqft),
      possession_date: date(p.possession_date), available_from: date(p.available_from),
    };
    for (const k of ["created_at", "updated_at", "status", "views", "verified", "is_demo", "owner_id", "agent_id", "project_id", "title"]) delete initial[k];
  }
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{editId ? "Edit your listing" : "Post your property — free"}</h1>
      <p className="mb-8 mt-1 text-muted">{editId ? "Price changes are recorded in the home's public price history." : "No listing fee and no brokerage. Takes about 5 minutes."}</p>
      <ListingWizard initial={initial} isAgent={!!agent} />
    </>
  );
}
