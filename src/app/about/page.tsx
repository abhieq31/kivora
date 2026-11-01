import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "About Nakshly & our data" };

export default function Page() {
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight">About Nakshly</h1>
        <p className="mt-4 text-lg text-muted">Nakshly is a home search, valuation and rental platform for India. Our aim: make the price of a home, the fee of an agent and the cost of moving in visible before anyone has to ask.</p>
        <h2 className="mt-10 text-2xl font-bold">What&apos;s different</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li><b>One home, one listing.</b> Owners verify once; duplicates get merged rather than multiplied.</li>
          <li><b>Published agent fees.</b> Agents list their RERA registration and what they charge on their profile.</li>
          <li><b>Transaction-based prices.</b> Trends and estimates use registered sales and signed agreements, not asking prices.</li>
          <li><b>Owner listings with zero brokerage</b> are marked clearly on every card.</li>
        </ul>
        <h2 id="data" className="mt-10 scroll-mt-20 text-2xl font-bold">How the Nakshly Estimate works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li>We take comparable transactions within 6 km from the last three years.</li>
          <li>Each is normalised to a standard home by removing the effect of its size, floor, building age, furnishing, facing and property type.</li>
          <li>Values are moved to today using a growth rate fitted on those same transactions.</li>
          <li>A weighted median is taken, favouring nearby, recent, same-locality and same-BHK sales.</li>
          <li>Your home&apos;s own features are applied back to get the estimate. The range widens when comparables disagree or are few.</li>
        </ol>
        <p className="mt-3">Every estimate shows its comparables, range and confidence. It is not an appraisal and should not replace a valuation for a loan or legal purpose.</p>
        <h2 className="mt-10 text-2xl font-bold">About the data in this build</h2>
        <p className="mt-3">Listings, transactions, agents and projects labelled <b>Demo</b> are generated sample data with fictional names, used to demonstrate the product. Market levels are illustrative. In production, transaction data comes from public registration records (for example state registration portals) and signed agreements on the platform.</p>
      </article>
      <Footer />
    </>
  );
}
