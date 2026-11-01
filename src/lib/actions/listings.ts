"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth";
import { CITY_BY_SLUG, normalizeLocality } from "../geo";
import { firstError, formObject, optNum, reqNum, type FormState } from "./util";

const listingSchema = z
  .object({
    id: z.coerce.number().int().optional(),
    listing_type: z.enum(["sale", "rent"]),
    property_type: z.enum(["apartment", "builder_floor", "independent_house", "villa", "plot"]),
    city: z.string().refine((c) => !!CITY_BY_SLUG[c], "Pick a city"),
    locality: z.string().min(2, "Enter the locality").max(60),
    society: z.string().max(80).default(""),
    address: z.string().min(3, "Enter the address").max(200),
    pincode: z.string().regex(/^(\d{6})?$/, "Pincode must be 6 digits").default(""),
    lat: reqNum("Drop a pin on the map").pipe(z.number().min(6).max(37.5, "Pin must be in India")),
    lng: reqNum("Drop a pin on the map").pipe(z.number().min(68).max(97.5, "Pin must be in India")),
    bhk: z.coerce.number().int().min(0).max(10),
    bathrooms: z.coerce.number().int().min(0).max(10),
    balconies: z.coerce.number().int().min(0).max(10),
    carpet_sqft: reqNum("Enter carpet area").pipe(z.number().int().min(100, "Carpet area looks too small").max(100000)),
    builtup_sqft: optNum,
    super_sqft: optNum,
    floor: optNum,
    total_floors: optNum,
    facing: z.string().max(20).default(""),
    furnishing: z.enum(["unfurnished", "semi", "full"]),
    age_years: optNum,
    possession: z.enum(["ready", "under_construction"]),
    possession_date: z.string().optional(),
    price: reqNum("Enter the price").pipe(z.number().min(1000, "Price looks too low").max(5e10)),
    deposit: optNum,
    maintenance_monthly: optNum,
    negotiable: z.string().optional(),
    parking_covered: z.coerce.number().int().min(0).max(10).default(0),
    parking_open: z.coerce.number().int().min(0).max(10).default(0),
    amenities: z.array(z.string().max(40)).max(40).default([]),
    tenant_pref: z.enum(["any", "family", "bachelors", "women"]).default("any"),
    pets_allowed: z.string().optional(),
    ownership: z.enum(["freehold", "leasehold", "co-operative", "power_of_attorney"]),
    rera_id: z.string().max(60).default(""),
    survey_no: z.string().max(60).default(""),
    posted_by: z.enum(["owner", "agent", "builder"]),
    photos: z.array(z.string().regex(/^\/(uploads|img)\/|^https:\/\//, "Bad photo URL").max(400)).max(30).default([]),
    available_from: z.string().optional(),
    description: z.string().max(4000).default(""),
    publish: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.property_type !== "plot" && d.bhk < 1) ctx.addIssue({ code: "custom", message: "Choose the number of bedrooms (BHK)" });
    if (d.listing_type === "rent" && d.property_type === "plot") ctx.addIssue({ code: "custom", message: "Plots can only be listed for sale" });
    if (d.floor != null && d.total_floors != null && d.floor > d.total_floors) ctx.addIssue({ code: "custom", message: "Floor can't be above total floors" });
    if (d.possession === "under_construction" && d.listing_type === "sale" && !d.rera_id)
      ctx.addIssue({ code: "custom", message: "Under-construction projects must show their RERA registration number" });
  });

export async function saveListing(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/post-property");
  const parsed = listingSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  const locality = normalizeLocality(d.city, d.locality);
  const status = d.publish === "draft" ? "draft" : "active";
  const [agent] = d.posted_by === "agent" ? await q<{ id: number }>("select id from agents where user_id = $1", [u.id]) : [];
  if (d.posted_by === "agent" && !agent) return { ok: false, error: "Create your agent profile first, or post as owner." };

  const values = [
    d.listing_type, d.property_type, d.city, locality, d.society, d.address, d.pincode, d.lat, d.lng, d.bhk, d.bathrooms, d.balconies,
    d.carpet_sqft, d.builtup_sqft ?? null, d.super_sqft ?? null, d.floor ?? null, d.total_floors ?? null, d.facing, d.furnishing,
    d.age_years ?? null, d.possession, d.possession_date || null, d.price, d.deposit ?? null, d.maintenance_monthly ?? null,
    d.negotiable === "on", d.parking_covered, d.parking_open, d.amenities, d.tenant_pref, d.pets_allowed === "on", d.ownership,
    d.rera_id, d.posted_by, d.photos, d.available_from || null, d.description, status, agent?.id ?? null, d.survey_no,
  ];
  const cols = `listing_type, property_type, city, locality, society, address, pincode, lat, lng, bhk, bathrooms, balconies,
    carpet_sqft, builtup_sqft, super_sqft, floor, total_floors, facing, furnishing, age_years, possession, possession_date, price, deposit,
    maintenance_monthly, negotiable, parking_covered, parking_open, amenities, tenant_pref, pets_allowed, ownership, rera_id, posted_by,
    photos, available_from, description, status, agent_id, survey_no`;

  let id = d.id;
  if (id) {
    const [old] = await q<{ price: number; status: string }>("select price, status from properties where id = $1 and owner_id = $2", [id, u.id]);
    if (!old) return { ok: false, error: "Listing not found." };
    const sets = cols.split(",").map((c, i) => `${c.trim()} = $${i + 1}`).join(", ");
    await q(`update properties set ${sets}, updated_at = now() where id = $${values.length + 1} and owner_id = $${values.length + 2}`, [...values, id, u.id]);
    if (old.price !== d.price && status === "active") await q("insert into price_events (property_id, event, price, date) values ($1, 'price_change', $2, current_date)", [id, d.price]);
    if (old.status === "draft" && status === "active") await q("insert into price_events (property_id, event, price, date) values ($1, 'listed', $2, current_date)", [id, d.price]);
  } else {
    const ph = values.map((_, i) => `$${i + 1}`).join(", ");
    const [row] = await q<{ id: number }>(`insert into properties (${cols}, owner_id) values (${ph}, $${values.length + 1}) returning id`, [...values, u.id]);
    id = row.id;
    if (status === "active") await q("insert into price_events (property_id, event, price, date) values ($1, 'listed', $2, current_date)", [id, d.price]);
  }
  revalidatePath("/my-listings");
  redirect(status === "draft" ? "/my-listings" : `/property/${id}?posted=1`);
}

export async function updateListingStatus(fd: FormData) {
  const u = await requireUser("/my-listings");
  const id = Number(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["active", "sold", "rented", "off_market"].includes(status)) return;
  const q = await db();
  const [p] = await q<{ price: number; status: string }>("update properties set status = $1, updated_at = now() where id = $2 and owner_id = $3 returning price, status", [status, id, u.id]);
  if (p) {
    const ev = status === "active" ? "relisted" : status === "off_market" ? "delisted" : status;
    const price = Number(fd.get("final_price")) || p.price;
    await q("insert into price_events (property_id, event, price, date) values ($1, $2, $3, current_date)", [id, ev, price]);
  }
  revalidatePath("/my-listings");
}

export async function changePrice(fd: FormData) {
  const u = await requireUser("/my-listings");
  const id = Number(fd.get("id"));
  const price = Number(String(fd.get("price") ?? "").replace(/[,₹\s]/g, ""));
  if (!(price >= 1000)) return;
  const q = await db();
  const res = await q("update properties set price = $1, updated_at = now() where id = $2 and owner_id = $3 and price <> $1 returning id", [price, id, u.id]);
  if (res.length) await q("insert into price_events (property_id, event, price, date) values ($1, 'price_change', $2, current_date)", [id, price]);
  revalidatePath("/my-listings");
}

export async function deleteListing(fd: FormData) {
  const u = await requireUser("/my-listings");
  const q = await db();
  await q("delete from properties where id = $1 and owner_id = $2", [Number(fd.get("id")), u.id]);
  revalidatePath("/my-listings");
}
