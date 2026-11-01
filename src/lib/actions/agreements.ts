"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser, requireUser } from "@/lib/auth";
import { CITY_BY_SLUG } from "@/lib/geo";
import { agreementFor } from "@/lib/queries/agreements";
import { firstError, formObject, optNum, reqNum, type FormState } from "./util";

const termsSchema = z.object({
  landlordName: z.string().trim().min(2, "Enter the owner's name").max(100),
  landlordAddress: z.string().trim().max(300).default(""),
  tenantName: z.string().trim().min(2, "Enter the tenant's name").max(100),
  tenantAddress: z.string().trim().max(300).default(""),
  propertyAddress: z.string().trim().min(5, "Enter the full address of the home").max(300),
  propertyDescription: z.string().trim().min(3).max(120),
  furnishings: z.string().trim().max(500).default(""),
  rent: reqNum("Enter the monthly rent").pipe(z.number().min(500).max(10_000_000)),
  deposit: reqNum("Enter the deposit").pipe(z.number().min(0).max(100_000_000)),
  maintenance: optNum.transform((v) => v ?? 0),
  dueDay: reqNum("Rent due day").pipe(z.number().int().min(1).max(28)),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a start date"),
  months: reqNum("Term").pipe(z.number().int().min(1).max(60)),
  noticeMonths: reqNum("Notice").pipe(z.number().int().min(1).max(3)),
  lockInMonths: optNum.transform((v) => v ?? 0).pipe(z.number().int().min(0).max(12)),
  renewalHikePct: optNum.transform((v) => v ?? 0).pipe(z.number().min(0).max(25)),
  depositRefundDays: reqNum("Refund days").pipe(z.number().int().min(1).max(60)),
  occupants: reqNum("Occupants").pipe(z.number().int().min(1).max(20)),
  petsAllowed: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  extraClauses: z.string().max(2000).default(""),
});

const schema = z.object({
  id: optNum,
  role: z.enum(["landlord", "tenant"]),
  city: z.string().refine((c) => c in CITY_BY_SLUG, "Choose a city"),
  property_id: optNum,
}).and(termsSchema);

export async function saveAgreement(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/agreements/new");
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { id, role, city, property_id, ...terms } = parsed.data;
  const state = CITY_BY_SLUG[city].state;
  const q = await db();
  let agreementId = id;
  if (id) {
    const a = await agreementFor(id, u.id);
    if (!a) return { ok: false, error: "Agreement not found." };
    // Any change needs both parties to agree again; the editor's own acceptance is implied.
    const mine = a.landlord_id === u.id ? "landlord" : "tenant";
    await q(
      `update agreements set terms = $2, city = $3, state = $4, updated_at = now(),
         landlord_accepted_at = ${mine === "landlord" ? "now()" : "null"}, tenant_accepted_at = ${mine === "tenant" ? "now()" : "null"}
       where id = $1`, [id, JSON.stringify(terms), city, state]);
    await q("insert into agreement_notes (agreement_id, user_id, kind, body) values ($1, $2, 'change', 'Changed the terms. Both parties need to accept again.')", [id, u.id]);
  } else {
    const [row] = await q<{ id: number }>(
      `insert into agreements (created_by, landlord_id, tenant_id, property_id, state, city, terms, token, landlord_accepted_at, tenant_accepted_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
      [u.id, role === "landlord" ? u.id : null, role === "tenant" ? u.id : null, property_id ?? null, state, city,
        JSON.stringify(terms), randomBytes(12).toString("base64url"), role === "landlord" ? new Date() : null, role === "tenant" ? new Date() : null],
    );
    agreementId = row.id;
  }
  revalidatePath("/agreements");
  redirect(`/agreements/${agreementId}`);
}

export async function joinAgreement(token: string) {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(`/agreements/join/${token}`)}`);
  const q = await db();
  const [a] = await q<{ id: number; landlord_id: number | null; tenant_id: number | null }>("select id, landlord_id, tenant_id from agreements where token = $1", [token]);
  if (!a) redirect("/agreements");
  if (a.landlord_id !== u.id && a.tenant_id !== u.id) {
    const slot = a.landlord_id == null ? "landlord_id" : a.tenant_id == null ? "tenant_id" : null;
    if (!slot) redirect("/agreements?full=1");
    await q(`update agreements set ${slot} = $2 where id = $1 and ${slot} is null`, [a.id, u.id]);
  }
  redirect(`/agreements/${a.id}`);
}

export async function acceptAgreement(id: number) {
  const u = await requireUser(`/agreements/${id}`);
  const a = await agreementFor(id, u.id);
  if (!a) return { ok: false, error: "Not found" };
  const col = a.landlord_id === u.id ? "landlord_accepted_at" : a.tenant_id === u.id ? "tenant_accepted_at" : null;
  if (!col) return { ok: false, error: "Join the agreement first" };
  const q = await db();
  await q(`update agreements set ${col} = coalesce(${col}, now()) where id = $1`, [id]);
  await q("insert into agreement_notes (agreement_id, user_id, kind, body) values ($1, $2, 'accept', 'Accepted the terms.')", [id, u.id]);
  revalidatePath(`/agreements/${id}`);
  return { ok: true };
}

const STEPS = ["stamp", "signed", "police", "inventory"] as const;

export async function setStep(id: number, step: (typeof STEPS)[number], done: boolean) {
  const u = await requireUser(`/agreements/${id}`);
  if (!STEPS.includes(step)) return;
  const a = await agreementFor(id, u.id);
  if (!a) return;
  const q = await db();
  const steps = { ...a.steps };
  if (done) steps[step] = new Date().toISOString().slice(0, 10);
  else delete steps[step];
  await q("update agreements set steps = $2, updated_at = now() where id = $1", [id, JSON.stringify(steps)]);
  revalidatePath(`/agreements/${id}`);
}

const noteSchema = z.object({
  kind: z.enum(["note", "repair", "entry", "payment", "inventory"]),
  body: z.string().trim().min(2, "Write something").max(2000),
});

/** Home diary: timestamped, visible to both parties, never edited — a shared record if there's a dispute. */
export async function addNote(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser(`/agreements/${id}`);
  const a = await agreementFor(id, u.id);
  if (!a) return { ok: false, error: "Not found" };
  const parsed = noteSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const q = await db();
  await q("insert into agreement_notes (agreement_id, user_id, kind, body) values ($1, $2, $3, $4)", [id, u.id, parsed.data.kind, parsed.data.body]);
  revalidatePath(`/agreements/${id}`);
  return { ok: true, message: "Added to the diary." };
}

export async function reviewTenancy(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser(`/agreements/${id}`);
  const a = await agreementFor(id, u.id);
  if (!a) return { ok: false, error: "Not found" };
  if (!a.landlord_accepted_at || !a.tenant_accepted_at) return { ok: false, error: "Both parties must accept the agreement before reviews." };
  if (a.terms.startDate > new Date().toISOString().slice(0, 10)) return { ok: false, error: "You can review once the tenancy has started." };
  const parsed = z.object({ rating: reqNum("Choose a rating").pipe(z.number().int().min(1).max(5)), body: z.string().trim().max(1000).default("") }).safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const about = a.tenant_id === u.id ? "landlord" : "tenant";
  const q = await db();
  await q(
    `insert into tenancy_reviews (agreement_id, author_id, about, rating, body) values ($1, $2, $3, $4, $5)
     on conflict (agreement_id, author_id) do update set rating = excluded.rating, body = excluded.body`,
    [id, u.id, about, parsed.data.rating, parsed.data.body]);
  revalidatePath(`/agreements/${id}`);
  return { ok: true, message: "Thanks — your review is saved." };
}
