import type { Metadata } from "next";
import { AffordabilityCalculator } from "@/components/calculators";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Home affordability calculator" };

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">How much home can you afford?</h1>
        <p className="mb-8 mt-2 text-muted">Based on your income, existing EMIs, savings and RBI loan-to-value limits.</p>
        <AffordabilityCalculator />
      </div>
      <Footer />
    </>
  );
}
