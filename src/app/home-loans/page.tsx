import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmiCalculator, LenderTable, LoanLeadForm } from "@/components/calculators";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Home loan EMI calculator", description: "Calculate your home loan EMI, see the full amortisation schedule and compare indicative lender rates in India." };

export default function Page({ searchParams }: PageProps<"/home-loans">) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Home loans</h1>
        <p className="mt-2 text-muted">Work out your EMI, see how much you can afford and talk to a loan advisor.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/home-loans" className="chip chip-on">EMI calculator</Link>
          <Link href="/home-loans/affordability" className="chip">Affordability</Link>
          <Link href="/calculators/stamp-duty" className="chip">Stamp duty</Link>
          <Link href="/calculators/rent-vs-buy" className="chip">Rent vs buy</Link>
        </div>
        <section className="mt-8">
          <Suspense fallback={<EmiCalculator />}><Emi searchParams={searchParams} /></Suspense>
        </section>
        <section className="mt-14">
          <h2 className="h-section">Indicative home loan rates</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Floating rates linked to the repo rate. Your rate depends on credit score, income and loan size. Not live quotes.</p>
          <LenderTable />
        </section>
        <section className="card mt-14 p-6">
          <h2 className="h-section">Talk to a loan advisor</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Free. We compare banks and housing finance companies for you.</p>
          <LoanLeadForm />
        </section>
      </div>
      <Footer />
    </>
  );
}

async function Emi({ searchParams }: { searchParams: PageProps<"/home-loans">["searchParams"] }) {
  const a = Number((await searchParams).amount);
  return <EmiCalculator initialAmount={a >= 5_00_000 && a <= 5_00_00_000 ? Math.round(a / 50_000) * 50_000 : undefined} />;
}
