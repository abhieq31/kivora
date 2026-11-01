"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { reviewAgreement } from "@/lib/actions/review-agreement";
import { Notice, Submit } from "@/components/form-bits";
import { UNFAIR_PATTERNS } from "@/lib/rent-rules";

const QUESTIONS: Record<string, string> = {
  "evict-no-notice": "Can the owner make you leave immediately or within days, without the usual notice?",
  "deposit-any-damage": "Can the owner deduct for 'any damage', with no mention of normal wear and tear?",
  "no-refund-timeline": "Is there no fixed number of days to return your deposit?",
  "excessive-deposit": "Is the deposit more than 2 months' rent?",
  "tenant-pays-structural": "Do you pay for the water pump, tank, plumbing or structural repairs?",
  "usage-restrictions": "Are there rules like where to wash clothes or utensils, or deep-cleaning walls every month?",
  "third-party-eviction": "Must you leave if the society or neighbours object?",
  "all-costs-tenant": "Do you pay all the stamp duty, notary and agreement costs?",
  "auto-hike": "Is a fixed rent hike on renewal already written in?",
};

export function QuickCheck() {
  const [ans, setAns] = useState<Record<string, boolean>>({});
  const flagged = UNFAIR_PATTERNS.filter((p) => ans[p.id]);
  const answered = Object.keys(ans).length;
  return (
    <div className="space-y-3">
      {UNFAIR_PATTERNS.map((p) => (
        <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{QUESTIONS[p.id]}</p>
          <div className="flex shrink-0 gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button" onClick={() => setAns({ ...ans, [p.id]: v })} className={ans[p.id] === v ? "chip chip-on" : "chip"}>{v ? "Yes" : "No"}</button>
            ))}
          </div>
        </div>
      ))}
      {answered > 0 && (
        <div className={`rounded-xl p-4 ${flagged.length ? "bg-amber-50" : "bg-emerald-50"}`}>
          <p className="font-semibold">{flagged.length ? `${flagged.length} one-sided term${flagged.length > 1 ? "s" : ""}` : "Looks balanced so far"}</p>
          <ul className="mt-2 space-y-1 text-sm">{flagged.map((p) => <li key={p.id}>• <b>{p.label}.</b> {p.why}</li>)}</ul>
          {flagged.length > 0 && <p className="mt-3 text-sm">These are negotiable. Show the owner a fair version: <Link href="/agreements/new" className="font-semibold text-brand underline">make one on Nakshly</Link>, and keep a <Link href="/renters-rights" className="underline">home diary</Link> of repairs and visits.</p>}
        </div>
      )}
    </div>
  );
}

export function AiReview() {
  const [state, action] = useActionState(reviewAgreement, null);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <input type="file" name="files" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" multiple className="input" />
        <textarea name="text" rows={4} className="input" placeholder="…or paste the agreement text" />
        <Notice state={state?.ok ? null : state} />
        <Submit className="btn" pendingText="Reading every clause…">Review my agreement</Submit>
        <p className="text-xs text-muted">Hide Aadhaar and PAN numbers before uploading. We don&apos;t store your files.</p>
      </form>
      {state?.ok && (
        <div className="space-y-3">
          <p className="rounded-lg bg-paper p-3 text-sm"><b>Summary ({state.language}).</b> {state.summary}</p>
          {state.issues?.map((i, n) => (
            <div key={n} className={`rounded-lg border-l-4 p-3 text-sm ${i.severity === "high" ? "border-bad bg-red-50" : i.severity === "medium" ? "border-accent bg-orange-50" : "border-line bg-paper"}`}>
              <p className="font-semibold">{i.clause}</p>
              <p className="mt-1">{i.problem}</p>
              <p className="mt-1 text-muted"><b>Ask for:</b> {i.suggestion}</p>
            </div>
          ))}
          {!!state.good?.length && <div className="rounded-lg bg-emerald-50 p-3 text-sm"><p className="font-semibold">In your favour</p><ul className="mt-1 list-disc pl-5">{state.good.map((g) => <li key={g}>{g}</li>)}</ul></div>}
          <p className="text-xs text-muted">Information, not legal advice.</p>
        </div>
      )}
    </div>
  );
}
