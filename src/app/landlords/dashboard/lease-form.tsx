"use client";

import { useActionState, useState } from "react";
import { createLease } from "@/lib/actions/landlord";
import { Field, Notice, Submit } from "@/components/form-bits";

export function LeaseForm({ listings }: { listings: { id: number; label: string }[] }) {
  const [state, action] = useActionState(createLease, null);
  // Default to an 11-month agreement starting today.
  const [{ today, end }] = useState(() => {
    const now = new Date();
    return { today: now.toISOString().slice(0, 10), end: new Date(now.getTime() + 334 * 86400000).toISOString().slice(0, 10) };
  });
  return (
    <form action={action} className="mt-4 grid gap-4 sm:grid-cols-3">
      <Field label="Property label" className="sm:col-span-2"><input name="label" className="input" placeholder="Flat 402, Lake Residency" required /></Field>
      <Field label="Linked listing (optional)" hint="Marks it rented">
        <select name="property_id" className="input" defaultValue=""><option value="">None</option>{listings.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
      </Field>
      <Field label="Tenant name"><input name="tenant_name" className="input" required /></Field>
      <Field label="Tenant mobile"><input name="tenant_phone" className="input" required inputMode="tel" /></Field>
      <Field label="Monthly rent (₹)"><input name="rent" className="input" inputMode="numeric" required /></Field>
      <Field label="Deposit (₹)"><input name="deposit" className="input" inputMode="numeric" defaultValue="0" /></Field>
      <Field label="Rent due on (day of month)"><input name="due_day" type="number" min={1} max={28} defaultValue={5} className="input" /></Field>
      <Field label="Yearly escalation (%)"><input name="escalation_pct" type="number" min={0} max={30} step="0.5" defaultValue={5} className="input" /></Field>
      <Field label="Start date"><input name="start_date" type="date" defaultValue={today} className="input" required /></Field>
      <Field label="End date" hint="11-month agreements are common"><input name="end_date" type="date" defaultValue={end} className="input" required /></Field>
      <div className="sm:col-span-3"><Notice state={state} /></div>
      <div className="sm:col-span-3"><Submit pendingText="Adding…">Add lease</Submit></div>
    </form>
  );
}
