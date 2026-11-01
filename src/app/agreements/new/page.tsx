import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { CITIES, CITY_BY_SLUG } from "@/lib/geo";
import { getProperty } from "@/lib/queries/properties";
import { agreementFor } from "@/lib/queries/agreements";
import { notFound } from "next/navigation";
import { FURNISHING_LABEL, PROPERTY_TYPES } from "@/lib/types";
import { AgreementForm } from "./form";

export const metadata: Metadata = { title: "Make a rent agreement", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/agreements/new">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Make a fair rent agreement</h1>
      <p className="mb-8 mt-1 text-muted">Ten minutes, not ten days. Both of you agree online, then sign the stamped copy.</p>
      <Suspense fallback={<div className="card h-96 animate-pulse" />}><Body searchParams={searchParams} /></Suspense>
    </main>
  );
}

async function Body({ searchParams }: Pick<PageProps<"/agreements/new">, "searchParams">) {
  await connection();
  const sp = await searchParams;
  const user = await requireUser("/agreements/new");
  const cities = CITIES.map((c) => ({ slug: c.slug, name: c.name, state: c.state }));
  const editId = Number(sp.edit);
  if (editId) {
    const a = await agreementFor(editId, user.id);
    if (!a) notFound();
    return <AgreementForm cities={cities} initial={{ ...a.terms, id: a.id, city: a.city }} />;
  }
  const p = sp.property ? await getProperty(Number(sp.property)) : null;
  const fromListing = p && p.listing_type === "rent" ? {
    city: p.city,
    property_id: p.id,
    propertyAddress: [p.society, p.address, p.locality, CITY_BY_SLUG[p.city]?.name, p.pincode].filter(Boolean).join(", "),
    propertyDescription: `${p.bhk ? `${p.bhk} BHK ` : ""}${(PROPERTY_TYPES[p.property_type] ?? "home").toLowerCase()}${p.floor != null ? ` on floor ${p.floor === 0 ? "ground" : p.floor}` : ""}`,
    furnishings: FURNISHING_LABEL[p.furnishing] ?? "",
    rent: p.price,
    deposit: p.deposit ?? p.price * 2,
    maintenance: p.maintenance_monthly ?? 0,
    landlordName: p.owner_id === user.id ? user.name : "",
    petsAllowed: p.pets_allowed,
  } : {};
  return <AgreementForm cities={cities} initial={{ ...fromListing, role: p?.owner_id === user.id ? "landlord" : "tenant", tenantName: p?.owner_id === user.id ? "" : user.name }} />;
}
