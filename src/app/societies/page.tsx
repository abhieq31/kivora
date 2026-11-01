import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/geo";
import { inr } from "@/lib/format";
import { ServiceForm } from "@/app/services/form";

export const metadata: Metadata = {
  title: "For housing societies & RWAs — no brokers, verified tenants",
  description: "Help owners in your society rent and sell without brokers. Verified tenants, police registration done, a QR notice for your notice board and a free help-desk day.",
};

export default function Page() {
  return (
    <>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">For RWAs & society secretaries</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Fewer brokers at the gate. Every tenant on record.</h1>
          <p className="mt-3 text-lg text-muted">Societies carry the risk when flats are rented through strangers. Nakshly lets your owners list free, meet tenants directly and finish the paperwork properly.</p>
          <ul className="mt-8 space-y-4">
            {[
              ["Verified tenants", "Tenants come with a renter profile; every Nakshly agreement includes the police tenant registration step."],
              ["Owners keep the brokerage", "One month's rent stays with your members instead of a broker."],
              ["Society rules respected", "Agreements include following the society's bye-laws; you get a copy of tenant details on request through the owner."],
              ["A notice for your board", "Print a QR notice so owners can list in a minute."],
            ].map(([t, d]) => <li key={t}><p className="font-semibold">{t}</p><p className="text-muted">{d}</p></li>)}
          </ul>
          <Link href="/societies/notice" className="btn-outline mt-8">Print the society notice</Link>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ServiceForm initial="society-drive" propertyId="" services={SERVICES.map((s) => ({ id: s.id, label: `${s.name} — ${s.price == null ? "Free" : inr(s.price)}` }))} cities={CITIES.map((c) => c.name)} />
        </aside>
      </main>
      <Footer />
    </>
  );
}
