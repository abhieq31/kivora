import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CheckCircle2, Circle, ExternalLink, Printer } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { agreementFor, agreementNotes, agreementReviews } from "@/lib/queries/agreements";
import { agreementClauses, endDate, STEP_LABELS } from "@/lib/agreement-text";
import { rentRulesFor } from "@/lib/rent-rules";
import { inr, fmtDate, timeAgo } from "@/lib/format";
import { CITY_BY_SLUG } from "@/lib/geo";
import { AcceptButton, NoteForm, ReviewForm, ShareLink, StepToggle } from "./client";

export const metadata: Metadata = { title: "Rent agreement", robots: { index: false } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function Page({ params }: PageProps<"/agreements/[id]">) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}><Body params={params} /></Suspense>
    </main>
  );
}

async function Body({ params }: Pick<PageProps<"/agreements/[id]">, "params">) {
  await connection();
  const id = Number((await params).id);
  const user = await requireUser(`/agreements/${id}`);
  const a = Number.isInteger(id) ? await agreementFor(id, user.id) : null;
  if (!a) notFound();
  const [notes, reviews] = await Promise.all([agreementNotes(id), agreementReviews(id)]);
  const t = a.terms;
  const rules = rentRulesFor(a.state);
  const iAm = a.landlord_id === user.id ? "landlord" : "tenant";
  const other = iAm === "landlord" ? "tenant" : "owner";
  const iAccepted = iAm === "landlord" ? a.landlord_accepted_at : a.tenant_accepted_at;
  const otherJoined = iAm === "landlord" ? a.tenant_id != null : a.landlord_id != null;
  const bothAccepted = !!(a.landlord_accepted_at && a.tenant_accepted_at);
  const started = t.startDate <= new Date().toISOString().slice(0, 10);
  const myReview = reviews.find((r) => r.author_id === user.id);
  const theirReview = reviews.find((r) => r.author_id !== user.id);
  const depositMonths = t.deposit / t.rent;

  const steps = [
    { id: "agreed" as const, done: bothAccepted, detail: bothAccepted ? "Both parties accepted" : `${a.landlord_accepted_at ? "Owner accepted" : "Owner hasn't accepted"} · ${a.tenant_accepted_at ? "tenant accepted" : "tenant hasn't accepted"}` },
    { id: "stamp" as const, done: !!a.steps.stamp, detail: `${rules.stampDuty}.`, link: { href: "https://www.shcilestamp.com", label: "SHCIL e-stamp" } },
    { id: "signed" as const, done: !!a.steps.signed, detail: rules.registration },
    { id: "police" as const, done: !!a.steps.police, detail: `${rules.police.note} The owner files it; the tenant shares ID and permanent address.`, link: { href: rules.police.url, label: rules.police.name } },
    { id: "inventory" as const, done: !!a.steps.inventory, detail: "Note the condition of every room and fitting in the diary below, with photos shared on WhatsApp. It decides deposit deductions later." },
  ];

  return (
    <>
      <Link href="/agreements" className="text-sm text-muted hover:underline">← My agreements</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rules.agreementName}</h1>
          <p className="text-muted">{t.propertyDescription}, {CITY_BY_SLUG[a.city]?.name} · {inr(t.rent)}/month · {fmtDate(t.startDate)} – {fmtDate(endDate(t))}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agreements/new?edit=${a.id}`} className="btn-ghost">Edit terms</Link>
          <Link href={`/agreements/${a.id}/print`} className="btn-outline"><Printer className="h-4 w-4" /> Print / PDF</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <section className="card p-5">
            <h2 className="h-section">Steps in {a.state}</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((s) => (
                <li key={s.id} className="flex gap-3">
                  {s.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-line" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{STEP_LABELS[s.id]}{s.id !== "agreed" && a.steps[s.id] ? <span className="font-normal text-muted"> · {fmtDate(a.steps[s.id]!)}</span> : null}</p>
                      {s.id !== "agreed" && <StepToggle id={a.id} step={s.id} done={s.done} />}
                    </div>
                    <p className="text-sm text-muted">{s.detail}</p>
                    {s.link && <a href={s.link.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand">{s.link.label} <ExternalLink className="h-3.5 w-3.5" /></a>}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-lg bg-brand-soft p-3 text-sm">
              Rather not run around? <Link href={`/services?for=rent-agreement`} className="font-semibold text-brand-dark underline">Nakshly does the e-stamp, signing{rules.registrationRequired ? ", registration" : ""} and police form for ₹499</Link> (government fees at actuals).
            </div>
            {rules.notes.map((n) => <p key={n} className="mt-3 text-sm text-muted">• {n}</p>)}
          </section>

          <section>
            <h2 className="h-section">The agreement</h2>
            {depositMonths > 2 && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The deposit is {depositMonths.toFixed(1)} months&apos; rent. The Model Tenancy Act suggests at most 2 months for homes. It&apos;s worth negotiating.</p>}
            <div className="card mt-3 space-y-3 p-5 text-[15px] leading-relaxed">
              <p>Between <b>{t.landlordName}</b>{t.landlordAddress ? `, ${t.landlordAddress}` : ""} (the Licensor / owner) and <b>{t.tenantName}</b>{t.tenantAddress ? `, ${t.tenantAddress}` : ""} (the Licensee / tenant).</p>
              <ol className="list-decimal space-y-2 pl-5">
                {agreementClauses(t, a.state).map((c, i) => <li key={i}><b>{c.title}.</b> {c.body}</li>)}
              </ol>
            </div>
            <p className="mt-2 text-xs text-muted">A plain-language template with fair defaults, not legal advice. For unusual situations, ask a lawyer.</p>
          </section>

          <section>
            <h2 className="h-section">Home diary</h2>
            <p className="mt-1 text-sm text-muted">A shared, timestamped record of repairs, visits and payments. Entries can&apos;t be edited or deleted — so if there&apos;s a disagreement, both of you have the same facts.</p>
            <div className="mt-4"><NoteForm id={a.id} /></div>
            <ul className="mt-5 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg border border-line p-3 text-sm">
                  <p className="text-xs text-muted"><b className="text-ink">{n.user_id === user.id ? "You" : n.author}</b> · {n.kind} · {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  <p className="mt-1 whitespace-pre-line">{n.body}</p>
                </li>
              ))}
              {!notes.length && <li className="text-sm text-muted">Nothing yet.</li>}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card space-y-3 p-5">
            <p className="font-semibold">You are the {iAm === "landlord" ? "owner" : "tenant"}</p>
            {iAccepted ? <p className="text-sm text-good">You accepted these terms {timeAgo(iAccepted)}.</p> : <AcceptButton id={a.id} />}
            {!otherJoined ? <ShareLink url={`${SITE}/agreements/join/${a.token}`} role={other} /> : (
              <p className="text-sm text-muted">The {other} {(iAm === "landlord" ? a.tenant_accepted_at : a.landlord_accepted_at) ? "has accepted" : "hasn't accepted yet"}.</p>
            )}
          </div>
          {bothAccepted && started && (
            <div className="card space-y-2 p-5">
              <p className="font-semibold">Rate your {other}</p>
              <p className="text-sm text-muted">Reviews come only from agreements both sides accepted, so they can be trusted. {other === "owner" ? "Your rating shows on their listings." : ""}</p>
              <ReviewForm id={a.id} about={other} initial={myReview} />
              {theirReview && <p className="text-sm text-muted">The {other} rated you {theirReview.rating}/5.</p>}
            </div>
          )}
          <div className="card p-5 text-sm">
            <p className="font-semibold">Know your rights</p>
            <p className="mt-1 text-muted">Notice before visits, deposit refund dates, who pays for repairs.</p>
            <Link href="/renters-rights" className="mt-2 inline-block font-semibold text-brand">Renting fairly in India →</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
