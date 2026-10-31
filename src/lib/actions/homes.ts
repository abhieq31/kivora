"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { getUser, requireUser } from "../auth";
import { firstError, formObject, phoneSchema, type FormState } from "./util";

export async function toggleSave(propertyId: number): Promise<{ saved: boolean } | { login: true }> {
  const u = await getUser();
  if (!u) return { login: true };
  const q = await db();
  const del = await q("delete from saved_homes where user_id = $1 and property_id = $2 returning 1", [u.id, propertyId]);
  if (del.length) return { saved: false };
  await q("insert into saved_homes (user_id, property_id) values ($1, $2) on conflict do nothing", [u.id, propertyId]);
  return { saved: true };
}

export async function saveSearch(name: string, path: string): Promise<{ ok: boolean; login?: true }> {
  const u = await getUser();
  if (!u) return { ok: false, login: true };
  if (!path.startsWith("/") || path.length > 600) return { ok: false };
  const q = await db();
  await q("insert into saved_searches (user_id, name, path) values ($1, $2, $3)", [u.id, name.slice(0, 120), path]);
  revalidatePath("/saved");
  return { ok: true };
}

export async function deleteSavedSearch(fd: FormData) {
  const u = await requireUser("/saved");
  const q = await db();
  await q("delete from saved_searches where id = $1 and user_id = $2", [Number(fd.get("id")), u.id]);
  revalidatePath("/saved");
}

const inquirySchema = z.object({
  kind: z.enum(["contact", "tour", "callback"]),
  property_id: z.coerce.number().int().optional(),
  agent_id: z.coerce.number().int().optional(),
  project_id: z.coerce.number().int().optional(),
  name: z.string().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  email: z.union([z.literal(""), z.string().email("Enter a valid email")]).optional(),
  message: z.string().max(1000).optional(),
  tour_date: z.string().optional(),
  tour_mode: z.enum(["in_person", "video"]).optional(),
});

/** Contact a lister / request a tour. Creates an inbox thread for both sides. */
export async function sendInquiry(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = inquirySchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  if (!d.property_id && !d.agent_id && !d.project_id) return { ok: false, error: "Nothing to contact." };
  if (d.kind === "tour") {
    const t = d.tour_date ? new Date(d.tour_date) : null;
    if (!t || Number.isNaN(t.getTime()) || t.getTime() < Date.now() - 86400000) return { ok: false, error: "Pick a date for the tour." };
  }
  const u = await getUser();
  const q = await db();

  // Route to the account behind the listing: owner, else the agent's user.
  let toUser: number | null = null;
  let agentId = d.agent_id ?? null;
  if (d.property_id) {
    const [p] = await q<{ owner_id: number | null; agent_id: number | null; status: string }>("select owner_id, agent_id, status from properties where id = $1", [d.property_id]);
    if (!p) return { ok: false, error: "Listing not found." };
    toUser = p.owner_id;
    agentId = agentId ?? p.agent_id;
  }
  if (!toUser && agentId) {
    const [a] = await q<{ user_id: number | null }>("select user_id from agents where id = $1", [agentId]);
    toUser = a?.user_id ?? null;
  }
  if (u && toUser === u.id) return { ok: false, error: "This is your own listing." };

  const recent = await q(
    "select 1 from inquiries where phone = $1 and coalesce(property_id, 0) = $2 and coalesce(agent_id, 0) = $3 and created_at > now() - interval '10 minutes'",
    [d.phone, d.property_id ?? 0, d.agent_id ?? 0],
  );
  if (recent.length) return { ok: true, message: "We already sent your request." };

  const [inq] = await q<{ id: number }>(
    `insert into inquiries (property_id, agent_id, project_id, from_user_id, to_user_id, kind, name, phone, email, tour_date, tour_mode)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
    [d.property_id ?? null, agentId, d.project_id ?? null, u?.id ?? null, toUser, d.kind, d.name, d.phone, d.email ?? "",
      d.kind === "tour" ? d.tour_date : null, d.kind === "tour" ? d.tour_mode ?? "in_person" : null],
  );
  const body = d.message?.trim() ||
    (d.kind === "tour"
      ? `I'd like to tour this home on ${new Date(d.tour_date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} (${d.tour_mode === "video" ? "video call" : "in person"}).` : "I'm interested in this home. Please get in touch.");
  await q("insert into messages (inquiry_id, sender_id, sender_name, body) values ($1, $2, $3, $4)", [inq.id, u?.id ?? null, d.name, body]);
  revalidatePath("/inbox");
  return { ok: true, id: inq.id, message: d.kind === "tour" ? "Tour requested" : "Message sent" };
}

export async function replyToThread(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/inbox");
  const id = Number(fd.get("inquiry_id"));
  const body = String(fd.get("body") ?? "").trim().slice(0, 2000);
  if (!body) return { ok: false, error: "Write a message." };
  const q = await db();
  const [t] = await q("select 1 from inquiries where id = $1 and (from_user_id = $2 or to_user_id = $2)", [id, u.id]);
  if (!t) return { ok: false, error: "Conversation not found." };
  await q("insert into messages (inquiry_id, sender_id, sender_name, body) values ($1, $2, $3, $4)", [id, u.id, u.name, body]);
  await q("update inquiries set status = 'replied' where id = $1", [id]);
  revalidatePath(`/inbox/${id}`);
  return { ok: true };
}

export async function applyToRental(propertyId: number): Promise<{ ok: boolean; error?: string; needProfile?: true; login?: true }> {
  const u = await getUser();
  if (!u) return { ok: false, login: true };
  const q = await db();
  const [prof] = await q("select 1 from renter_profiles where user_id = $1", [u.id]);
  if (!prof) return { ok: false, needProfile: true };
  const [p] = await q<{ owner_id: number | null; listing_type: string; status: string }>(
    "select coalesce(p.owner_id, a.user_id) as owner_id, p.listing_type, p.status from properties p left join agents a on a.id = p.agent_id where p.id = $1",
    [propertyId],
  );
  if (!p || p.listing_type !== "rent" || p.status !== "active") return { ok: false, error: "This home is not taking applications." };
  if (p.owner_id === u.id) return { ok: false, error: "You can't apply to your own listing." };
  await q("insert into applications (property_id, user_id) values ($1, $2) on conflict (property_id, user_id) do nothing", [propertyId, u.id]);
  revalidatePath("/renter-profile");
  return { ok: true };
}

const renterSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  occupation: z.string().max(80).default(""),
  employer: z.string().max(100).default(""),
  monthly_income: z.preprocess((v) => (v === "" ? null : Number(v)), z.number().min(0).max(1e8).nullable()),
  household: z.enum(["family", "bachelors", "couple", "single", "women"]),
  occupants: z.coerce.number().int().min(1).max(20),
  move_in: z.string().optional(),
  pets: z.string().optional(),
  vegetarian: z.string().optional(),
  about: z.string().max(1000).default(""),
  next: z.string().optional(),
});

export async function saveRenterProfile(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser("/renter-profile");
  const parsed = renterSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const q = await db();
  await q(
    `insert into renter_profiles (user_id, full_name, phone, occupation, employer, monthly_income, household, occupants, move_in, pets, vegetarian, about, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now())
     on conflict (user_id) do update set full_name = excluded.full_name, phone = excluded.phone, occupation = excluded.occupation,
       employer = excluded.employer, monthly_income = excluded.monthly_income, household = excluded.household, occupants = excluded.occupants,
       move_in = excluded.move_in, pets = excluded.pets, vegetarian = excluded.vegetarian, about = excluded.about, updated_at = now()`,
    [u.id, d.full_name, d.phone, d.occupation, d.employer, d.monthly_income, d.household, d.occupants, d.move_in || null, d.pets === "on",
      d.vegetarian === "yes" ? true : d.vegetarian === "no" ? false : null, d.about],
  );
  revalidatePath("/renter-profile");
  if (d.next?.startsWith("/property/")) redirect(d.next);
  return { ok: true, message: "Profile saved" };
}

export async function setApplicationStatus(fd: FormData) {
  const u = await requireUser("/landlords/dashboard");
  const status = String(fd.get("status"));
  if (!["shortlisted", "accepted", "declined"].includes(status)) return;
  const q = await db();
  await q(
    `update applications a set status = $1 from properties p where a.id = $2 and p.id = a.property_id
     and (p.owner_id = $3 or p.agent_id in (select id from agents where user_id = $3))`,
    [status, Number(fd.get("id")), u.id],
  );
  revalidatePath("/landlords/dashboard");
}

const loanSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  city: z.string().min(2, "Pick a city"),
  monthly_income: z.coerce.number().min(0).max(1e8),
  loan_amount: z.coerce.number().min(100000, "Loan amount should be at least ₹1 L").max(1e10),
  employment: z.enum(["salaried", "self_employed"]),
});

export async function requestLoanCallback(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loanSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const u = await getUser();
  const q = await db();
  await q("insert into loan_leads (user_id, name, phone, city, monthly_income, loan_amount, employment) values ($1,$2,$3,$4,$5,$6,$7)",
    [u?.id ?? null, d.name, d.phone, d.city, d.monthly_income, d.loan_amount, d.employment]);
  return { ok: true, message: "Thanks — a loan advisor will call you within one working day." };
}
