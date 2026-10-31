import type { Metadata } from "next";
import { RentVsBuy } from "@/components/calculators";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Rent vs buy calculator" };

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Should you rent or buy?</h1>
        <p className="mb-8 mt-2 text-muted">Compare owning a home with renting and investing the difference.</p>
        <RentVsBuy />
      </div>
      <Footer />
    </>
  );
}
