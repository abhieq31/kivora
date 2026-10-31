"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { sendInquiry } from "@/lib/actions/homes";
import { reviewAgent } from "@/lib/actions/agents";
import { Notice, Submit } from "@/components/form-bits";

export function AgentContact({ agentId, name, defaults }: { agentId: number; name: string; defaults: { name: string; phone: string; email: string } }) {
  const [state, action] = useActionState(sendInquiry, null);
  if (state?.ok) {
    return (
      <div className="card p-5">
        <p className="font-bold">Message sent ✓</p>
        <p className="mt-1 text-sm text-muted">{name} will get back to you.</p>
        {state.id && <Link href={`/inbox/${state.id}`} className="btn-outline mt-4 w-full">Open conversation</Link>}
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-3 p-5">
      <p className="font-semibold">Contact {name.split(" ")[0]}</p>
      <input type="hidden" name="kind" value="contact" />
      <input type="hidden" name="agent_id" value={agentId} />
      <select name="message" className="input" defaultValue="I'm looking to buy a home and would like your help.">
        <option>I&apos;m looking to buy a home and would like your help.</option>
        <option>I want to sell my home. What would you suggest?</option>
        <option>I&apos;m looking for a home to rent.</option>
        <option>I want to rent out my home.</option>
      </select>
      <input name="name" className="input" placeholder="Your name" defaultValue={defaults.name} required />
      <input name="phone" className="input" placeholder="Mobile number" defaultValue={defaults.phone} required inputMode="tel" />
      <input name="email" className="input" placeholder="Email (optional)" defaultValue={defaults.email} type="email" />
      <Notice state={state} />
      <Submit className="btn w-full" pendingText="Sending…">Send</Submit>
    </form>
  );
}

export function ReviewForm({ agentId }: { agentId: number }) {
  const [state, action] = useActionState(reviewAgent, null);
  const [rating, setRating] = useState(0);
  if (state?.ok) return <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.message}</p>;
  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-line p-4">
      <input type="hidden" name="agent_id" value={agentId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
            <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
          </button>
        ))}
        <select name="deal_type" className="input ml-auto w-auto" defaultValue="buy">
          <option value="buy">I bought</option><option value="sell">I sold</option><option value="rent">I rented</option>
        </select>
      </div>
      <textarea name="body" rows={3} className="input" placeholder="How was your experience?" required minLength={10} />
      <Notice state={state} />
      <Submit className="btn" pendingText="Posting…">Post review</Submit>
    </form>
  );
}
