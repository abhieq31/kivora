import type { Metadata } from "next";
import { StampDutyCalculator } from "@/components/calculators";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Stamp duty calculator" };

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Stamp duty & registration calculator</h1>
        <p className="mb-8 mt-2 text-muted">Indicative stamp duty and registration charges by state, including concessions for women.</p>
        <StampDutyCalculator />
      </div>
      <Footer />
    </>
  );
}
