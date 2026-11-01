import type { Metadata } from "next";
import Link from "next/link";
import { BadgeIndianRupee, Camera, ClipboardCheck, FileText, Gauge, Megaphone, Users } from "lucide-react";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Sell your home", description: "Get a free home value estimate, list directly to buyers with no brokerage, or compare agents by published fees." };

export default function SellPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-soft to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Sell your home your way</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted">Start with a free estimate. Then list it yourself with zero brokerage, or hire an agent whose fee you can see before you call.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/home-value" className="btn px-6 py-3 text-base"><Gauge className="h-5 w-5" /> Get my home&apos;s value</Link>
            <Link href="/post-property" className="btn-outline px-6 py-3 text-base">Post property free</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
        <div className="card p-8">
          <Megaphone className="h-9 w-9 text-brand" />
          <h2 className="mt-4 text-2xl font-bold">Sell it yourself</h2>
          <p className="mt-2 text-muted">List directly to buyers on Nakshly. Buyers can see you&apos;re the owner, which means no brokerage on either side.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2"><BadgeIndianRupee className="h-5 w-5 text-good" /> ₹0 to list, ₹0 commission</li>
            <li className="flex gap-2"><Camera className="h-5 w-5 text-good" /> Up to 30 photos and a map pin</li>
            <li className="flex gap-2"><ClipboardCheck className="h-5 w-5 text-good" /> Tour requests and messages in one inbox</li>
          </ul>
          <Link href="/post-property" className="btn mt-6">Post your property</Link>
        </div>
        <div className="card p-8">
          <Users className="h-9 w-9 text-brand" />
          <h2 className="mt-4 text-2xl font-bold">Sell with an agent</h2>
          <p className="mt-2 text-muted">Compare RERA-registered agents by reviews, homes sold and — unusually for India — their published fee.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2"><BadgeIndianRupee className="h-5 w-5 text-good" /> Flat fees and percentage fees shown side by side</li>
            <li className="flex gap-2"><FileText className="h-5 w-5 text-good" /> RERA agent registration shown on every profile</li>
            <li className="flex gap-2"><Users className="h-5 w-5 text-good" /> Reviews only from signed-in Nakshly users</li>
          </ul>
          <Link href="/agents" className="btn-outline mt-6">Compare agents</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold">Selling a home in India: the checklist</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Gather documents", "Sale deed / title chain, Index-II or registration copy, latest property tax receipt, society NOC and share certificate, OC/CC for newer buildings."],
            ["Clear dues", "Pay property tax, society maintenance and utility bills. Get a loan closure letter and collect originals if the home is mortgaged."],
            ["Price with data", "Use the Nakshly Estimate and recent registered sales nearby rather than asking prices on other portals."],
            ["Agreement to sell", "Sign an agreement with the token amount, timeline and who bears which costs. Have a lawyer review it."],
            ["TDS and capital gains", "Buyers deduct 1% TDS on homes above ₹50 L. Plan for capital gains tax and any reinvestment exemption."],
            ["Registration", "Execute the sale deed at the sub-registrar's office with stamp duty paid by the buyer; hand over keys and originals."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl border border-line p-5">
              <span className="text-sm font-bold text-brand">Step {i + 1}</span>
              <p className="mt-1 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted">General information, not legal or tax advice.</p>
      </section>
      <Footer />
    </>
  );
}
