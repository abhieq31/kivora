"use client";

import { useActionState } from "react";
import { saveAgentProfile } from "@/lib/actions/agents";
import { CITIES } from "@/lib/geo";
import { Field, Notice, Submit } from "@/components/form-bits";

type Init = Partial<Record<"name" | "agency" | "phone" | "email" | "city" | "localities" | "rera_id" | "sale_fee" | "rent_fee" | "languages" | "bio", string> & { experience_years: number }>;

export function AgentProfileForm({ initial }: { initial: Init }) {
  const [state, action] = useActionState(saveAgentProfile, null);
  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2">
      <Field label="Full name"><input name="name" className="input" defaultValue={initial.name} required /></Field>
      <Field label="Agency"><input name="agency" className="input" defaultValue={initial.agency} /></Field>
      <Field label="Mobile"><input name="phone" className="input" defaultValue={initial.phone} required inputMode="tel" /></Field>
      <Field label="Email"><input name="email" type="email" className="input" defaultValue={initial.email} /></Field>
      <Field label="City">
        <select name="city" className="input" defaultValue={initial.city ?? ""} required>
          <option value="">Choose</option>
          {[...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="RERA agent registration no." hint="Shown on your profile"><input name="rera_id" className="input" defaultValue={initial.rera_id} required /></Field>
      <Field label="Localities you cover" hint="Comma separated" className="sm:col-span-2"><input name="localities" className="input" defaultValue={initial.localities} /></Field>
      <Field label="Fee for buying/selling" hint="e.g. 1% of price, or Flat ₹75,000"><input name="sale_fee" className="input" defaultValue={initial.sale_fee} required /></Field>
      <Field label="Fee for rentals" hint="e.g. 15 days' rent"><input name="rent_fee" className="input" defaultValue={initial.rent_fee} required /></Field>
      <Field label="Years of experience"><input name="experience_years" type="number" min={0} className="input" defaultValue={initial.experience_years ?? 0} /></Field>
      <Field label="Languages" hint="Comma separated"><input name="languages" className="input" defaultValue={initial.languages ?? "English, Hindi"} /></Field>
      <Field label="About you" className="sm:col-span-2"><textarea name="bio" rows={4} className="input" defaultValue={initial.bio} /></Field>
      <div className="sm:col-span-2"><Notice state={state} /></div>
      <div className="sm:col-span-2"><Submit pendingText="Saving…">Save profile</Submit></div>
    </form>
  );
}
