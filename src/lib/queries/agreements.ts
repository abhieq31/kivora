import "server-only";
import { db } from "@/lib/db";
import type { AgreementSteps, AgreementTerms } from "@/lib/agreement-text";

export type Agreement = {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  landlord_id: number | null;
  tenant_id: number | null;
  property_id: number | null;
  state: string;
  city: string;
  terms: AgreementTerms;
  token: string;
  landlord_accepted_at: string | null;
  tenant_accepted_at: string | null;
  steps: AgreementSteps;
  landlord_email: string | null;
  tenant_email: string | null;
};

/** The agreement, only if this user is one of its two parties. */
export async function agreementFor(id: number, userId: number) {
  const q = await db();
  const [a] = await q<Agreement>(
    `select a.*, l.email as landlord_email, t.email as tenant_email
     from agreements a left join users l on l.id = a.landlord_id left join users t on t.id = a.tenant_id
     where a.id = $1 and (a.landlord_id = $2 or a.tenant_id = $2 or a.created_by = $2)`, [id, userId]);
  return a ?? null;
}

export async function myAgreements(userId: number) {
  const q = await db();
  return q<Pick<Agreement, "id" | "terms" | "state" | "landlord_id" | "tenant_id" | "landlord_accepted_at" | "tenant_accepted_at" | "updated_at">>(
    `select id, terms, state, landlord_id, tenant_id, landlord_accepted_at, tenant_accepted_at, updated_at
     from agreements where landlord_id = $1 or tenant_id = $1 or created_by = $1 order by updated_at desc`, [userId]);
}

export async function agreementNotes(id: number) {
  const q = await db();
  return q<{ id: number; created_at: string; kind: string; body: string; author: string; user_id: number }>(
    `select n.id, n.created_at, n.kind, n.body, n.user_id, u.name as author
     from agreement_notes n join users u on u.id = n.user_id where n.agreement_id = $1 order by n.created_at desc`, [id]);
}

export async function agreementReviews(id: number) {
  const q = await db();
  return q<{ author_id: number; about: string; rating: number; body: string; created_at: string }>(
    "select author_id, about, rating, body, created_at from tenancy_reviews where agreement_id = $1", [id]);
}

/** Ratings tenants left for this owner, from agreements both sides accepted on Nakshly. */
export async function landlordRating(ownerId: number | null) {
  if (!ownerId) return null;
  const q = await db();
  const [r] = await q<{ avg: number | null; n: number }>(
    `select round(avg(r.rating)::numeric, 1)::float as avg, count(*)::int as n
     from tenancy_reviews r join agreements a on a.id = r.agreement_id
     where r.about = 'landlord' and a.landlord_id = $1`, [ownerId]);
  return r.n ? r : null;
}
