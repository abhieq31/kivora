"use client";

import { useActionState, useState, useTransition } from "react";
import { acceptAgreement, addNote, reviewTenancy, setStep } from "@/lib/actions/agreements";
import { Notice, Submit } from "@/components/form-bits";

export function AcceptButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button className="btn w-full" disabled={pending} onClick={() => start(async () => { const r = await acceptAgreement(id); if (!r.ok) setErr(r.error ?? "Could not accept"); })}>
        {pending ? "Saving…" : "I agree to these terms"}
      </button>
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  );
}

export function StepToggle({ id, step, done }: { id: number; step: "stamp" | "signed" | "police" | "inventory"; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${done ? "border-good text-good" : "border-line text-muted hover:border-brand hover:text-brand"}`} disabled={pending}
      onClick={() => start(() => setStep(id, step, !done))}>
      {pending ? "…" : done ? "Done ✓" : "Mark done"}
    </button>
  );
}

export function ShareLink({ url, role }: { url: string; role: "owner" | "tenant" }) {
  const [copied, setCopied] = useState(false);
  const text = `Here's our rent agreement on Nakshly. Please read and accept the terms: ${url}`;
  return (
    <div className="space-y-2">
      <p className="text-sm">Send this link to the {role}. They sign in, read the terms and accept.</p>
      <div className="flex gap-2">
        <input readOnly value={url} className="input font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <button className="btn-outline shrink-0" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); }}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <a className="btn w-full bg-[#128c4b]" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
    </div>
  );
}

const KINDS = [["note", "Note"], ["repair", "Repair request"], ["entry", "Visit / entry notice"], ["payment", "Payment"], ["inventory", "Move-in / move-out condition"]] as const;

export function NoteForm({ id }: { id: number }) {
  const [state, action] = useActionState(addNote.bind(null, id), null);
  return (
    <form action={action} className="space-y-2" key={state?.message}>
      <div className="flex flex-wrap gap-2">
        <select name="kind" className="input w-auto">{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </div>
      <textarea name="body" rows={3} className="input" placeholder="e.g. Kitchen tap leaking since 12 Nov — please arrange a plumber." required />
      <Notice state={state} />
      <Submit className="btn-outline" pendingText="Adding…">Add to diary</Submit>
    </form>
  );
}

export function ReviewForm({ id, about, initial }: { id: number; about: "owner" | "tenant"; initial?: { rating: number; body: string } }) {
  const [state, action] = useActionState(reviewTenancy.bind(null, id), null);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="flex gap-1" role="radiogroup" aria-label={`Rate the ${about}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-amber-400" : "text-line"}`}>★</button>
        ))}
      </div>
      <textarea name="body" rows={2} className="input" defaultValue={initial?.body} placeholder={about === "owner" ? "Responsive to repairs? Respected notice before visits? Returned the deposit on time?" : "Paid on time? Took care of the home?"} />
      <Notice state={state} />
      <Submit className="btn-outline" pendingText="Saving…">{initial ? "Update review" : "Post review"}</Submit>
    </form>
  );
}
