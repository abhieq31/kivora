"use client";

import { useActionState } from "react";
import { saveRenterProfile } from "@/lib/actions/homes";
import { Field, Notice, Submit } from "@/components/form-bits";

type Init = Record<string, string | number | boolean | null | undefined>;

export function RenterForm({ initial, next }: { initial: Init; next: string }) {
  const [state, action] = useActionState(saveRenterProfile, null);
  const v = (k: string) => (initial[k] == null ? "" : String(initial[k]));
  return (
    <form action={action} className="card mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
      <input type="hidden" name="next" value={next} />
      <Field label="Full name"><input name="full_name" className="input" defaultValue={v("full_name")} required /></Field>
      <Field label="Mobile"><input name="phone" className="input" defaultValue={v("phone")} required inputMode="tel" /></Field>
      <Field label="Occupation"><input name="occupation" className="input" defaultValue={v("occupation")} placeholder="Software engineer" /></Field>
      <Field label="Employer / college"><input name="employer" className="input" defaultValue={v("employer")} /></Field>
      <Field label="Monthly income (₹)" hint="Optional, helps landlords decide faster"><input name="monthly_income" className="input" inputMode="numeric" defaultValue={v("monthly_income")} /></Field>
      <Field label="Planned move-in"><input name="move_in" type="date" className="input" defaultValue={v("move_in")} /></Field>
      <Field label="Household">
        <select name="household" className="input" defaultValue={v("household") || "family"}>
          <option value="family">Family</option><option value="couple">Couple</option><option value="single">Single working professional</option><option value="bachelors">Group of bachelors</option><option value="women">Women only</option>
        </select>
      </Field>
      <Field label="Number of people"><input name="occupants" type="number" min={1} max={20} className="input" defaultValue={v("occupants") || "1"} /></Field>
      <Field label="Food preference" hint="Some societies ask; leave blank if you prefer">
        <select name="vegetarian" className="input" defaultValue={initial.vegetarian === true ? "yes" : initial.vegetarian === false ? "no" : ""}>
          <option value="">Prefer not to say</option><option value="yes">Vegetarian</option><option value="no">Non-vegetarian</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="pets" defaultChecked={!!initial.pets} /> I have pets</label>
      <Field label="About you" className="sm:col-span-2"><textarea name="about" rows={3} className="input" defaultValue={v("about")} placeholder="A line or two for landlords" /></Field>
      <div className="sm:col-span-2"><Notice state={state} /></div>
      <div className="sm:col-span-2"><Submit pendingText="Saving…">{next ? "Save and return to the home" : "Save profile"}</Submit></div>
    </form>
  );
}
