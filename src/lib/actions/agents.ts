"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth";
import { CITY_BY_SLUG } from "../geo";
import { firstError, formObject, phoneSchema, type FormState } from "./util";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  agency: z.string().max(100).default(""),
  phone: phoneSchema,
  email: z.union([z.literal(""), z.string().email()]).default(""),
  city: z.string().refine((c) => !!CITY_BY_SLUG[c], "Pick a city"),
  localities: z.string().max(400).default(""),
  rera_id: z.string().min(4, "Enter your RERA agent registration number").max(60),
  experience_years: z.coerce.number().int().min(0).max(60),
  sale_fee: z.string().min(2, "Publish your fee for buyers/sellers").max(80),
  rent_fee: z.string().min(2, "Publish your fee for rentals").max(80),
  languages: z.string().max(200).default(""),
  bio: z.string().max(1500).default(""),
});

export async function saveAgentProfile(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/agents/profile");
  const parsed = profileSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const q = await db();
  const vals = [d.name, d.agency, d.phone, d.email, d.city, list(d.localities), d.rera_id, d.experience_years, d.sale_fee, d.rent_fee, list(d.languages), d.bio];
  const [existing] = await q<{ id: number }>("select id from agents where user_id = $1", [u.id]);
  let id: number;
  if (existing) {
    await q(
      `update agents set name=$1, agency=$2, phone=$3, email=$4, city=$5, localities=$6, rera_id=$7, experience_years=$8, sale_fee=$9,
       rent_fee=$10, languages=$11, bio=$12 where id = $13`,
      [...vals, existing.id],
    );
    id = existing.id;
  } else {
    const [row] = await q<{ id: number }>(
      `insert into agents (name, agency, phone, email, city, localities, rera_id, experience_years, sale_fee, rent_fee, languages, bio, user_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
      [...vals, u.id],
    );
    id = row.id;
    if (u.role === "user") await q("update users set role = 'agent' where id = $1", [u.id]);
  }
  revalidatePath(`/agents/${id}`);
  redirect(`/agents/${id}`);
}

const reviewSchema = z.object({
  agent_id: z.coerce.number().int(),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  body: z.string().min(10, "Write at least a sentence").max(1500),
  deal_type: z.enum(["buy", "sell", "rent"]),
});

export async function reviewAgent(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/agents");
  const parsed = reviewSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  const [a] = await q<{ user_id: number | null }>("select user_id from agents where id = $1", [d.agent_id]);
  if (!a) return { ok: false, error: "Agent not found." };
  if (a.user_id === u.id) return { ok: false, error: "You can't review yourself." };
  const dup = await q("select 1 from agent_reviews where agent_id = $1 and user_id = $2", [d.agent_id, u.id]);
  if (dup.length) return { ok: false, error: "You've already reviewed this agent." };
  await q("insert into agent_reviews (agent_id, user_id, author, rating, body, deal_type) values ($1,$2,$3,$4,$5,$6)", [d.agent_id, u.id, u.name, d.rating, d.body, d.deal_type]);
  revalidatePath(`/agents/${d.agent_id}`);
  return { ok: true, message: "Thanks for your review" };
}
