"use client";

import { useActionState } from "react";
import { requestService } from "@/lib/actions/services";
import { Field, Notice, Submit } from "@/components/form-bits";

export function ServiceForm({ initial, propertyId, services, cities }: { initial: string; propertyId: string; services: { id: string; label: string }[]; cities: string[] }) {
  const [state, action] = useActionState(requestService, null);
  if (state?.ok) return <div className="card p-5"><Notice state={state} /></div>;
  return (
    <form action={action} className="card space-y-4 p-5">
      <p className="text-lg font-bold">Request a call back</p>
      <Field label="Service">
        <select name="service" defaultValue={initial} className="input">
          {services.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>
      <Field label="Your name"><input name="name" className="input" autoComplete="name" required /></Field>
      <Field label="Mobile number"><input name="phone" className="input" inputMode="tel" autoComplete="tel" required /></Field>
      <Field label="City">
        <select name="city" className="input" defaultValue="">
          <option value="">Select</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Anything we should know?" hint="Optional"><textarea name="notes" rows={3} className="input" /></Field>
      {propertyId && <input type="hidden" name="property_id" value={propertyId} />}
      <Notice state={state} />
      <Submit className="btn w-full" pendingText="Sending…">Request call back</Submit>
      <p className="text-xs text-muted">Pay only after the work is done. Government stamp duty and registration fees are charged at actuals.</p>
    </form>
  );
}
