import "server-only";
import { db } from "../db";
import type { CardListing } from "../types";

export async function savedIds(userId: number | undefined) {
  if (!userId) return new Set<number>();
  const q = await db();
  const rows = await q<{ property_id: number }>("select property_id from saved_homes where user_id = $1", [userId]);
  return new Set(rows.map((r) => r.property_id));
}

export async function savedHomes(userId: number) {
  const q = await db();
  return q<CardListing>(
    `select p.id, p.listing_type, p.status, p.property_type, p.bhk, p.bathrooms, p.carpet_sqft, p.super_sqft, p.price, p.city, p.locality,
       p.society, p.photos, p.lat, p.lng, p.created_at, p.posted_by, p.verified, p.is_demo, p.possession, p.furnishing
     from saved_homes s join properties p on p.id = s.property_id where s.user_id = $1 order by s.created_at desc`,
    [userId],
  );
}

export async function savedSearches(userId: number) {
  const q = await db();
  return q<{ id: number; name: string; path: string; notify: boolean; created_at: string }>(
    "select * from saved_searches where user_id = $1 order by created_at desc",
    [userId],
  );
}

export async function myListings(userId: number) {
  const q = await db();
  return q<CardListing & { views: number; leads: number; saves: number; updated_at: string }>(
    `select p.id, p.listing_type, p.status, p.property_type, p.bhk, p.bathrooms, p.carpet_sqft, p.super_sqft, p.price, p.city, p.locality,
       p.society, p.photos, p.lat, p.lng, p.created_at, p.updated_at, p.posted_by, p.verified, p.is_demo, p.possession, p.furnishing, p.views,
       (select count(*)::int from inquiries i where i.property_id = p.id) as leads,
       (select count(*)::int from saved_homes s where s.property_id = p.id) as saves
     from properties p where p.owner_id = $1 order by p.created_at desc`,
    [userId],
  );
}

export type Thread = {
  id: number;
  created_at: string;
  kind: string;
  name: string;
  phone: string;
  email: string;
  tour_date: string | null;
  tour_mode: string | null;
  status: string;
  property_id: number | null;
  agent_id: number | null;
  project_id: number | null;
  from_user_id: number | null;
  to_user_id: number | null;
  subject: string;
  photo: string | null;
  last_body: string | null;
  last_at: string;
  unread: boolean;
};

/** Inquiries the user sent or received (as listing owner or as the agent behind a profile). */
export async function threads(userId: number) {
  const q = await db();
  return q<Thread>(
    `select i.*,
       coalesce(
         case when p.id is not null then p.bhk || ' BHK ' || replace(p.property_type, '_', ' ') || ', ' || p.locality end,
         case when pr.id is not null then pr.name end,
         case when a.id is not null then 'Agent: ' || a.name end, 'Inquiry') as subject,
       coalesce(p.photos[1], pr.photos[1]) as photo,
       (select body from messages m where m.inquiry_id = i.id order by m.created_at desc limit 1) as last_body,
       coalesce((select max(created_at) from messages m where m.inquiry_id = i.id), i.created_at) as last_at,
       false as unread
     from inquiries i
     left join properties p on p.id = i.property_id
     left join projects pr on pr.id = i.project_id
     left join agents a on a.id = i.agent_id
     where i.from_user_id = $1 or i.to_user_id = $1
     order by last_at desc limit 100`,
    [userId],
  );
}

export async function thread(userId: number, id: number) {
  const q = await db();
  const [t] = (await threads(userId)).filter((x) => x.id === id);
  if (!t) return null;
  const msgs = await q<{ id: number; sender_id: number | null; sender_name: string; body: string; created_at: string }>(
    "select id, sender_id, sender_name, body, created_at from messages where inquiry_id = $1 order by created_at",
    [id],
  );
  return { thread: t, messages: msgs };
}

export async function renterProfile(userId: number) {
  const q = await db();
  const [r] = await q<{
    full_name: string; phone: string; occupation: string; employer: string; monthly_income: number | null; household: string;
    occupants: number; move_in: string | null; pets: boolean; vegetarian: boolean | null; about: string; updated_at: string;
  }>("select * from renter_profiles where user_id = $1", [userId]);
  return r ?? null;
}

export async function myApplications(userId: number) {
  const q = await db();
  return q<{ id: number; status: string; created_at: string; property_id: number; locality: string; city: string; price: number; bhk: number; photos: string[] }>(
    `select a.id, a.status, a.created_at, p.id as property_id, p.locality, p.city, p.price, p.bhk, p.photos
     from applications a join properties p on p.id = a.property_id where a.user_id = $1 order by a.created_at desc`,
    [userId],
  );
}

export async function applicationsReceived(userId: number) {
  const q = await db();
  return q<{
    id: number; status: string; created_at: string; property_id: number; locality: string; bhk: number;
    full_name: string; phone: string; occupation: string; employer: string; monthly_income: number | null; occupants: number;
    household: string; move_in: string | null; pets: boolean; about: string; price: number;
  }>(
    `select a.id, a.status, a.created_at, p.id as property_id, p.locality, p.bhk, p.price, r.full_name, r.phone, r.occupation, r.employer,
       r.monthly_income, r.occupants, r.household, r.move_in, r.pets, r.about
     from applications a join properties p on p.id = a.property_id join renter_profiles r on r.user_id = a.user_id
     where p.owner_id = $1 or p.agent_id in (select id from agents where user_id = $1) order by a.created_at desc`,
    [userId],
  );
}

export async function leases(userId: number) {
  const q = await db();
  return q<{
    id: number; label: string; tenant_name: string; tenant_phone: string; rent: number; deposit: number; due_day: number;
    start_date: string; end_date: string; escalation_pct: number; property_id: number | null;
    payments: { month: string; amount: number; paid_on: string | null; method: string }[];
  }>(
    `select l.*, coalesce((select json_agg(json_build_object('month', to_char(month, 'YYYY-MM'), 'amount', amount, 'paid_on', paid_on, 'method', method) order by month)
       from rent_payments rp where rp.lease_id = l.id), '[]'::json) as payments
     from leases l where l.landlord_id = $1 order by l.start_date desc`,
    [userId],
  );
}

export async function trackedHomes(userId: number) {
  const q = await db();
  return q<{ id: number; city: string; locality: string; property_type: string; bhk: number; carpet_sqft: number; floor: number | null; age_years: number | null; label: string }>(
    "select * from home_owners where user_id = $1 order by created_at desc",
    [userId],
  );
}
