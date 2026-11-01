import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FileSignature, ShieldCheck, Timer, ScrollText } from "lucide-react";
import { getUser } from "@/lib/auth";
import { myAgreements } from "@/lib/queries/agreements";
import { Footer } from "@/components/footer";
import { inr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Online rent agreement — fair terms, state rules, free",
  description: "Make a rent or leave-and-licence agreement in 10 minutes. Fair default terms, state-specific stamp duty and registration steps, police tenant registration links and a shared home diary. Free.",
};

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Rent agreements</h1>
            <p className="mt-2 max-w-2xl text-lg text-muted">Agree fair terms online in minutes. Then follow your state&apos;s steps — e-stamp, signing, police registration — with a checklist both of you can see.</p>
          </div>
          <Link href="/agreements/new" className="btn"><FileSignature className="h-4 w-4" /> New agreement</Link>
        </div>
        <Suspense fallback={null}><Mine /></Suspense>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [<Timer key="i" className="h-6 w-6" />, "Minutes, not weeks", "Both parties accept the same terms online. No waiting on a broker to send a draft."],
            [<ShieldCheck key="i" className="h-6 w-6" />, "Fair by default", "Deposit refund date, 24-hour notice before visits, owner pays structural repairs — based on the Model Tenancy Act."],
            [<ScrollText key="i" className="h-6 w-6" />, "Your state's rules", "Stamp duty, whether registration is compulsory, and the police tenant-registration portal for your state."],
          ].map(([icon, t, d]) => (
            <div key={t as string} className="rounded-xl border border-line p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</div>
              <p className="mt-3 font-semibold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-ink p-6 text-white">
          <p className="text-lg font-bold">Already signed one? Check it.</p>
          <p className="text-white/70">Paste your agreement — in English, Hindi, Gujarati, Marathi or any Indian language — and see which clauses are one-sided.</p>
          <Link href="/agreements/check" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink">Check my agreement</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function Mine() {
  await connection();
  const u = await getUser();
  if (!u) return null;
  const list = await myAgreements(u.id);
  if (!list.length) return null;
  return (
    <section className="mt-8">
      <h2 className="h-section">Your agreements</h2>
      <div className="mt-3 space-y-2">
        {list.map((a) => (
          <Link key={a.id} href={`/agreements/${a.id}`} className="card flex items-center justify-between gap-3 p-4 hover:border-brand">
            <span className="min-w-0"><b>{a.terms.propertyDescription}</b><span className="block truncate text-sm text-muted">{a.terms.landlordName} → {a.terms.tenantName} · {inr(a.terms.rent)}/month · {a.state}</span></span>
            <span className={`shrink-0 text-xs font-semibold ${a.landlord_accepted_at && a.tenant_accepted_at ? "text-good" : "text-accent"}`}>{a.landlord_accepted_at && a.tenant_accepted_at ? "Agreed" : "Waiting"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
