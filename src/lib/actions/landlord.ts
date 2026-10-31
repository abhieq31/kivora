"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth";
import { firstError, formObject, phoneSchema, type FormState } from "./util";

const leaseSchema = z
  .object({
    label: z.string().min(2, "Name the property, e.g. 'Flat 402, Lake Residency'").max(100),
    property_id: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().optional()),
    tenant_name: z.string().min(2, "Enter the tenant's name").max(80),
    tenant_phone: phoneSchema,
    rent: z.coerce.number().min(500, "Enter the monthly rent").max(1e8),
    deposit: z.coerce.number().min(0).max(1e9),
    due_day: z.coerce.number().int().min(1).max(28),
    start_date: z.string().min(8, "Pick a start date"),
    end_date: z.string().min(8, "Pick an end date"),
    escalation_pct: z.coerce.number().min(0).max(30),
  })
  .refine((d) => new Date(d.end_date) > new Date(d.start_date), "End date must be after start date");

export async function createLease(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/landlords/dashboard");
  const parsed = leaseSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  if (d.property_id) {
    const own = await q("select 1 from properties where id = $1 and owner_id = $2", [d.property_id, u.id]);
    if (!own.length) return { ok: false, error: "That listing isn't yours." };
    await q("update properties set status = 'rented', updated_at = now() where id = $1", [d.property_id]);
    await q("insert into price_events (property_id, event, price, date) values ($1, 'rented', $2, $3)", [d.property_id, d.rent, d.start_date]);
  }
  await q(
    `insert into leases (landlord_id, property_id, label, tenant_name, tenant_phone, rent, deposit, due_day, start_date, end_date, escalation_pct)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [u.id, d.property_id ?? null, d.label, d.tenant_name, d.tenant_phone, d.rent, d.deposit, d.due_day, d.start_date, d.end_date, d.escalation_pct],
  );
  revalidatePath("/landlords/dashboard");
  return { ok: true, message: "Lease added" };
}

export async function recordPayment(fd: FormData) {
  const u = await requireUser("/landlords/dashboard");
  const leaseId = Number(fd.get("lease_id"));
  const month = String(fd.get("month"));
  const method = ["UPI", "Bank transfer", "Cash", "Cheque"].includes(String(fd.get("method"))) ? String(fd.get("method")) : "UPI";
  if (!/^\d{4}-\d{2}$/.test(month)) return;
  const q = await db();
  const [l] = await q<{ rent: number }>("select rent from leases where id = $1 and landlord_id = $2", [leaseId, u.id]);
  if (!l) return;
  const amount = Number(fd.get("amount")) || l.rent;
  await q(
    `insert into rent_payments (lease_id, month, amount, paid_on, method) values ($1, $2::date, $3, current_date, $4)
     on conflict (lease_id, month) do update set amount = excluded.amount, paid_on = excluded.paid_on, method = excluded.method`,
    [leaseId, `${month}-01`, amount, method],
  );
  revalidatePath("/landlords/dashboard");
}

export async function undoPayment(fd: FormData) {
  const u = await requireUser("/landlords/dashboard");
  const q = await db();
  await q(
    "delete from rent_payments rp using leases l where rp.lease_id = l.id and l.landlord_id = $1 and rp.lease_id = $2 and rp.month = $3::date",
    [u.id, Number(fd.get("lease_id")), `${fd.get("month")}-01`],
  );
  revalidatePath("/landlords/dashboard");
}

export async function endLease(fd: FormData) {
  const u = await requireUser("/landlords/dashboard");
  const q = await db();
  await q("delete from leases where id = $1 and landlord_id = $2", [Number(fd.get("id")), u.id]);
  revalidatePath("/landlords/dashboard");
}
