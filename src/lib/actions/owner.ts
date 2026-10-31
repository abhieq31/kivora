"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth";
import { CITY_BY_SLUG, normalizeLocality } from "../geo";
import { firstError, formObject, optNum, type FormState } from "./util";

const homeSchema = z.object({
  city: z.string().refine((c) => !!CITY_BY_SLUG[c], "Pick a city"),
  locality: z.string().min(2, "Enter the locality").max(60),
  property_type: z.enum(["apartment", "builder_floor", "independent_house", "villa"]),
  bhk: z.coerce.number().int().min(1).max(10),
  carpet_sqft: z.coerce.number().int().min(100, "Enter carpet area").max(100000),
  floor: optNum,
  age_years: optNum,
  label: z.string().max(60).default("My home"),
});

/** "Claim" a home to track its estimate over time (Zillow's owner dashboard). */
export async function trackHome(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/home-value/my-homes");
  const parsed = homeSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  await q(
    "insert into home_owners (user_id, city, locality, property_type, bhk, carpet_sqft, floor, age_years, label) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [u.id, d.city, normalizeLocality(d.city, d.locality), d.property_type, d.bhk, d.carpet_sqft, d.floor ?? null, d.age_years ?? null, d.label || "My home"],
  );
  revalidatePath("/home-value/my-homes");
  redirect("/home-value/my-homes");
}

export async function untrackHome(fd: FormData) {
  const u = await requireUser("/home-value/my-homes");
  const q = await db();
  await q("delete from home_owners where id = $1 and user_id = $2", [Number(fd.get("id")), u.id]);
  revalidatePath("/home-value/my-homes");
}
