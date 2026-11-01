import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { AiReview, QuickCheck } from "./client";

export const metadata: Metadata = {
  title: "Is my rent agreement fair? Free check",
  description: "Check your rent or leave-and-licence agreement for one-sided clauses — eviction without notice, deposit deductions, repair costs, unreasonable house rules. Works for agreements in any Indian language.",
};

export default function Page() {
  const ai = process.env.AI_REVIEW === "1";
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Is my rent agreement fair?</h1>
        <p className="mt-3 text-lg text-muted">Broker templates often tilt everything towards the owner. Find out which clauses to push back on — before you sign, or before a dispute.</p>
        {ai && (
          <section className="card mt-8 p-5">
            <h2 className="h-section">Upload it — any language</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Photos of each page or a PDF. Gujarati, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali or English. Free, 5 a day.</p>
            <AiReview />
          </section>
        )}
        <section className="mt-8">
          <h2 className="h-section">{ai ? "Or answer 9 quick questions" : "Answer 9 quick questions"}</h2>
          <div className="mt-4"><QuickCheck /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
