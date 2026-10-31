"use client";

import { useActionState } from "react";
import { sendInquiry } from "@/lib/actions/homes";
import { Notice, Submit } from "@/components/form-bits";

export function ProjectEnquiry({ projectId, defaults }: { projectId: number; defaults: { name: string; phone: string; email: string } }) {
  const [state, action] = useActionState(sendInquiry, null);
  if (state?.ok) return <div className="card p-5"><p className="font-bold">Request sent ✓</p><p className="mt-1 text-sm text-muted">The builder&apos;s sales team will contact you with the price sheet and floor plans.</p></div>;
  return (
    <form action={action} className="card space-y-3 p-5">
      <p className="font-semibold">Get price sheet & floor plans</p>
      <input type="hidden" name="kind" value="callback" />
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="message" value="Please share the price sheet, floor plans and payment plan." />
      <input name="name" className="input" placeholder="Your name" defaultValue={defaults.name} required />
      <input name="phone" className="input" placeholder="Mobile number" defaultValue={defaults.phone} required inputMode="tel" />
      <input name="email" className="input" placeholder="Email (optional)" defaultValue={defaults.email} type="email" />
      <Notice state={state} />
      <Submit className="btn w-full" pendingText="Sending…">Request details</Submit>
    </form>
  );
}
