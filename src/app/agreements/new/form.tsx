"use client";

import { useActionState, useState } from "react";
import { saveAgreement } from "@/lib/actions/agreements";
import { Field, Notice, Submit } from "@/components/form-bits";
import { rentRulesFor } from "@/lib/rent-rules";
import type { AgreementTerms } from "@/lib/agreement-text";

type City = { slug: string; name: string; state: string };

export function AgreementForm({ cities, initial }: { cities: City[]; initial: Partial<AgreementTerms> & { id?: number; role?: "landlord" | "tenant"; city?: string; property_id?: number } }) {
  const [state, action] = useActionState(saveAgreement, null);
  const [city, setCity] = useState(initial.city ?? "");
  const [role, setRole] = useState(initial.role ?? "tenant");
  const st = cities.find((c) => c.slug === city)?.state;
  const rules = st ? rentRulesFor(st) : null;
  const v = (k: keyof AgreementTerms, d: string | number = "") => String(initial[k] ?? d);

  return (
    <form action={action} className="space-y-8">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {initial.property_id && <input type="hidden" name="property_id" value={initial.property_id} />}
      <input type="hidden" name="role" value={role} />

      <section className="card space-y-4 p-5">
        <h2 className="text-lg font-bold">1. Who you are and where</h2>
        {!initial.id && (
          <div className="flex gap-2">
            {(["tenant", "landlord"] as const).map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)} className={role === r ? "chip chip-on" : "chip"}>I&apos;m the {r === "tenant" ? "tenant" : "owner"}</button>
            ))}
          </div>
        )}
        <Field label="City">
          <select name="city" className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
            <option value="">Select city</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}, {c.state}</option>)}
          </select>
        </Field>
        {rules && (
          <div className="rounded-lg bg-paper p-3 text-sm">
            <p className="font-semibold">In {rules.state}: {rules.agreementName}</p>
            <p className="mt-1 text-muted">Stamp duty: {rules.stampDuty}. {rules.registration}</p>
          </div>
        )}
      </section>

      <section className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">2. The two parties</h2>
        <Field label="Owner's full name"><input name="landlordName" className="input" defaultValue={v("landlordName")} required /></Field>
        <Field label="Owner's address" hint="Optional"><input name="landlordAddress" className="input" defaultValue={v("landlordAddress")} /></Field>
        <Field label="Tenant's full name"><input name="tenantName" className="input" defaultValue={v("tenantName")} required /></Field>
        <Field label="Tenant's permanent address" hint="Optional"><input name="tenantAddress" className="input" defaultValue={v("tenantAddress")} /></Field>
        <p className="text-xs text-muted sm:col-span-2">Don&apos;t type Aadhaar or PAN numbers here. They go only on the stamped copy you sign.</p>
      </section>

      <section className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">3. The home</h2>
        <Field label="Full address" className="sm:col-span-2"><input name="propertyAddress" className="input" defaultValue={v("propertyAddress")} required /></Field>
        <Field label="Description" hint="e.g. 2 BHK flat on the ground floor"><input name="propertyDescription" className="input" defaultValue={v("propertyDescription", "the residential flat")} required /></Field>
        <Field label="Furnishings included" hint="e.g. 2 beds, wardrobe, 3 fans, geyser"><input name="furnishings" className="input" defaultValue={v("furnishings")} /></Field>
        <Field label="People living there"><input name="occupants" type="number" min={1} className="input" defaultValue={v("occupants", 2)} /></Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="petsAllowed" defaultChecked={initial.petsAllowed} /> Pets allowed</label>
      </section>

      <section className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        <h2 className="text-lg font-bold sm:col-span-3">4. Money and dates</h2>
        <Field label="Monthly rent (₹)"><input name="rent" inputMode="numeric" className="input" defaultValue={v("rent")} required /></Field>
        <Field label="Security deposit (₹)" hint="Model Tenancy Act: up to 2 months"><input name="deposit" inputMode="numeric" className="input" defaultValue={v("deposit")} required /></Field>
        <Field label="Maintenance (₹/month)" hint="0 if included in rent"><input name="maintenance" inputMode="numeric" className="input" defaultValue={v("maintenance", 0)} /></Field>
        <Field label="Start date"><input name="startDate" type="date" className="input" defaultValue={v("startDate")} required /></Field>
        <Field label="Term (months)"><input name="months" type="number" min={1} max={60} className="input" defaultValue={v("months", 11)} /></Field>
        <Field label="Rent due by (day of month)"><input name="dueDay" type="number" min={1} max={28} className="input" defaultValue={v("dueDay", 5)} /></Field>
        <Field label="Notice period (months)"><input name="noticeMonths" type="number" min={1} max={3} className="input" defaultValue={v("noticeMonths", 1)} /></Field>
        <Field label="Lock-in (months)" hint="0 for none"><input name="lockInMonths" type="number" min={0} max={12} className="input" defaultValue={v("lockInMonths", 0)} /></Field>
        <Field label="Deposit returned within (days)"><input name="depositRefundDays" type="number" min={1} max={60} className="input" defaultValue={v("depositRefundDays", 7)} /></Field>
        <Field label="Max increase on renewal (%)" hint="0 to leave it to negotiation"><input name="renewalHikePct" type="number" min={0} max={25} className="input" defaultValue={v("renewalHikePct", 5)} /></Field>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">5. Anything else you both agreed</h2>
        <p className="mb-2 mt-1 text-sm text-muted">One per line. Keep it reasonable — the fair-terms checker on the next page flags one-sided rules.</p>
        <textarea name="extraClauses" rows={4} className="input" defaultValue={v("extraClauses")} placeholder="e.g. Two-wheeler parking in the society's basement slot B-14" />
      </section>

      <Notice state={state} />
      <Submit className="btn w-full sm:w-auto" pendingText="Creating…">{initial.id ? "Save changes" : "Create agreement"}</Submit>
    </form>
  );
}
