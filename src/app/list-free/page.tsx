import type { Metadata } from "next";
import Link from "next/link";
import { BadgeIndianRupee, ClipboardPaste, FileSignature, QrCode, ShieldCheck, Camera } from "lucide-react";
import { Footer } from "@/components/footer";
import { SavingsCalc } from "./savings";

export const metadata: Metadata = {
  title: "List your flat for rent or sale free — no brokerage",
  description: "Post your property free on Nakshly. Talk to tenants and buyers directly, get a fair rent agreement in minutes, print a QR To-Let board and keep the month's rent a broker would take.",
};

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#1e2178] via-brand to-[#5b5fe8] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">For owners</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">Rent or sell your home. Keep the brokerage.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">List free in five minutes. Tenants and buyers contact you directly — no broker in the middle, no month&apos;s rent lost.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/post-property?utm_source=list-free" className="rounded-lg bg-white px-5 py-3 font-semibold text-brand">Post my property — free</Link>
            <Link href="/home-value" className="rounded-lg border border-white/40 px-5 py-3 font-semibold">What&apos;s my home worth?</Link>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 py-14">
        <SavingsCalc />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            [<ClipboardPaste key="i" className="h-6 w-6" />, "Paste your old ad", "Already on OLX or a WhatsApp group? Paste the ad and the listing fills itself in."],
            [<Camera key="i" className="h-6 w-6" />, "Photos that sell", "Shoot with your phone — we straighten, resize and flag blurry shots. Or book a ₹999 pro shoot."],
            [<QrCode key="i" className="h-6 w-6" />, "QR To-Let board", "Print a board for your gate. Passers-by scan to see photos and message you."],
            [<FileSignature key="i" className="h-6 w-6" />, "Agreement in minutes", "A fair rent agreement with your state's stamp duty and steps, accepted online by both of you."],
            [<ShieldCheck key="i" className="h-6 w-6" />, "Know your tenant", "Renter profiles with income and references, police registration links, and reviews from past owners."],
            [<BadgeIndianRupee key="i" className="h-6 w-6" />, "Collect rent", "Track rent, deposits and receipts in the rentals dashboard."],
          ].map(([icon, t, d]) => (
            <div key={t as string} className="rounded-xl border border-line p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</div>
              <p className="mt-3 font-semibold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-orange-50 p-6">
          <p className="text-lg font-bold">Founding owners</p>
          <p className="mt-1 text-muted">The first 500 owners to list in each city get a free tenant verification (worth ₹299) and a Featured badge for 30 days.</p>
        </div>
        <p className="mt-8 text-sm text-muted">Live in a housing society? <Link className="text-brand underline" href="/societies">Bring your whole society on board</Link>. Are you an agent? <Link className="text-brand underline" href="/pros">Join as a founding agent</Link>.</p>
      </main>
      <Footer />
    </>
  );
}
