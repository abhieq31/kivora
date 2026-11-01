"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { SERVICE_BY_ID } from "@/lib/services";
import { firstError, formObject, phoneSchema, type FormState } from "./util";

const schema = z.object({
  service: z.string().refine((s) => s in SERVICE_BY_ID, "Choose a service"),
  name: z.string().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  city: z.string().max(60).default(""),
  property_id: z.preprocess((v) => (v ? Number(v) : undefined), z.number().int().optional()),
  notes: z.string().max(1000).default(""),
});

export async function requestService(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  const [recent] = await q<{ n: number }>(
    "select count(*)::int as n from service_requests where phone = $1 and created_at > now() - interval '1 hour'", [d.phone]);
  if (recent.n >= 3) return { ok: false, error: "We already have your request — we'll call you shortly." };
  const u = await getUser();
  const svc = SERVICE_BY_ID[d.service];
  await q(
    "insert into service_requests (user_id, service, name, phone, city, property_id, notes, price) values ($1,$2,$3,$4,$5,$6,$7,$8)",
    [u?.id ?? null, d.service, d.name, d.phone, d.city, d.property_id ?? null, d.notes, svc.price],
  );
  return { ok: true, message: `Got it. We'll call you within one working day about your ${svc.name.toLowerCase()}. You pay only after the work is done.` };
}
