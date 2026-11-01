import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/geo";
import { inr } from "@/lib/format";
import { ServiceForm } from "@/app/services/form";

export const metadata: Metadata = {
  title: "For agents & builders — leads from buyers who trust published fees",
  description: "Join Nakshly as a founding agent: free Pro for 3 months, RERA-verified profile, published fees and enquiries from buyers and sellers in your localities. Builders pay per verified lead.",
};

export default function Page() {
  return (
    <>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">For agents & builders</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Good agents win when fees are public.</h1>
          <p className="mt-3 text-lg text-muted">Buyers don&apos;t hate agents — they hate surprise commissions. On Nakshly, your RERA number, your fee and your reviews are on your profile, and you get enquiries from people who&apos;ve already seen them.</p>
          <div className="mt-8 rounded-2xl bg-brand-soft p-6">
            <p className="text-lg font-bold">Founding agent programme</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✓ Nakshly Pro free for 3 months (then {inr(2999)}/month per locality)</li>
              <li>✓ Featured in up to 2 localities</li>
              <li>✓ Requirements: RERA agent registration and a published fee</li>
            </ul>
            <Link href="/agents/profile" className="btn mt-4">Create my agent profile</Link>
          </div>
          <div className="mt-8">
            <p className="font-semibold">Builders</p>
            <p className="text-muted">List RERA-registered projects with configurations and construction updates. Pay per verified lead — a buyer who has confirmed their phone and budget — not for impressions.</p>
          </div>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ServiceForm initial="pro" propertyId="" services={SERVICES.map((s) => ({ id: s.id, label: `${s.name} — ${s.price == null ? "Free" : inr(s.price)}` }))} cities={CITIES.map((c) => c.name)} />
        </aside>
      </main>
      <Footer />
    </>
  );
}
