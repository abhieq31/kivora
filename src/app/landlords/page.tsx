import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, FileSignature, IndianRupee, Users } from "lucide-react";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Rental manager for landlords", description: "List your rental free, screen tenants with one renter profile, track leases and rent payments." };

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Rent out your home without the runaround</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted">List free, get applications from tenants with complete profiles, and keep every lease and rent payment in one place.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/post-property" className="btn px-6 py-3">List a rental</Link>
            <Link href="/landlords/dashboard" className="btn-outline px-6 py-3">Open rentals dashboard</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid grid-cols-1 max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [<ClipboardList key="i" className="h-7 w-7" />, "Free listing", "Your rental shows on the map with a rent estimate, so tenants see it's fairly priced."],
          [<Users key="i" className="h-7 w-7" />, "Applications, not calls", "Tenants apply with a renter profile: occupation, income, household size, move-in date."],
          [<FileSignature key="i" className="h-7 w-7" />, "Leases on record", "Record the agreement term, deposit, due date and yearly escalation."],
          [<IndianRupee key="i" className="h-7 w-7" />, "Rent ledger", "Mark rent received month by month and see who is overdue at a glance."],
        ].map(([icon, t, d]) => (
          <div key={t as string} className="card p-5"><div className="text-good">{icon}</div><p className="mt-3 font-semibold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-paper p-6 text-sm">
          <p className="font-semibold">Renting in India: what to put in writing</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Most residential agreements are 11 months to avoid compulsory registration; longer leases must be registered and stamped.</li>
            <li>Record the deposit, lock-in period, notice period, maintenance responsibility and annual escalation (commonly 5–10%).</li>
            <li>Complete police verification of tenants where your city requires it.</li>
            <li>States adopting the Model Tenancy Act framework may cap deposits (e.g. two months for residential) — check your state&apos;s rules.</li>
          </ul>
        </div>
      </section>
      <Footer />
    </>
  );
}
