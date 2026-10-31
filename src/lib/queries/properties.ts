import "server-only";
import { db } from "../db";
import { CITY_BY_SLUG, findMarket } from "../geo";
import { estimate, type Comp, type EstimateResult } from "../estimate";
import type { CardListing, Pin, SearchParams } from "../types";

const CARD_COLS = `p.id, p.listing_type, p.status, p.property_type, p.bhk, p.bathrooms, p.carpet_sqft, p.super_sqft, p.price,
  p.city, p.locality, p.society, p.photos, p.lat, p.lng, p.created_at, p.posted_by, p.verified, p.is_demo, p.possession, p.furnishing`;

function where(p: SearchParams) {
  const w: string[] = [];
  const v: unknown[] = [];
  const add = (sql: string, ...vals: unknown[]) => {
    let s = sql;
    for (const val of vals) {
      v.push(val);
      s = s.replace("?", `$${v.length}`);
    }
    w.push(s);
  };
  if (p.mode === "buy") add("p.listing_type = 'sale' and p.status = 'active'");
  else if (p.mode === "rent") add("p.listing_type = 'rent' and p.status = 'active'");
  else add("p.status in ('sold', 'rented') and p.updated_at > now() - interval '24 months'");
  if (p.city) add("p.city = ?", p.city);
  if (p.q) add("(p.locality ilike ? or p.society ilike ? or p.address ilike ?)", `%${p.q}%`, `%${p.q}%`, `%${p.q}%`);
  if (p.minPrice) add("p.price >= ?", p.minPrice);
  if (p.maxPrice) add("p.price <= ?", p.maxPrice);
  if (p.beds) add(p.beds >= 5 ? "p.bhk >= ?" : "p.bhk >= ?", p.beds);
  if (p.baths) add("p.bathrooms >= ?", p.baths);
  if (p.types?.length) add("p.property_type = any(?::text[])", p.types);
  if (p.furnishing) add("p.furnishing = ?", p.furnishing);
  if (p.possession) add("p.possession = ?", p.possession);
  if (p.postedBy) add("p.posted_by = ?", p.postedBy);
  if (p.minSqft) add("p.carpet_sqft >= ?", p.minSqft);
  if (p.maxSqft) add("p.carpet_sqft <= ?", p.maxSqft);
  if (p.tenant) add("p.tenant_pref in ('any', ?)", p.tenant);
  if (p.verified) add("p.verified");
  if (p.bounds) add("p.lat between ? and ? and p.lng between ? and ?", p.bounds.s, p.bounds.n, p.bounds.w, p.bounds.e);
  return { sql: w.length ? `where ${w.join(" and ")}` : "", values: v };
}

const ORDER: Record<string, string> = {
  newest: "p.created_at desc",
  price_asc: "p.price asc",
  price_desc: "p.price desc",
  sqft_desc: "p.carpet_sqft desc",
  ppsf_asc: "p.price / nullif(p.carpet_sqft, 0) asc",
};

export const PAGE_SIZE = 24;

export async function searchProperties(p: SearchParams): Promise<{ total: number; items: CardListing[]; pins: Pin[] }> {
  const q = await db();
  const { sql, values } = where(p);
  const order = ORDER[p.sort ?? ""] ?? (p.mode === "sold" ? "p.updated_at desc" : "p.verified desc, p.created_at desc");
  const offset = ((p.page ?? 1) - 1) * PAGE_SIZE;
  const [items, [{ total }], pins] = await Promise.all([
    q<CardListing>(
      `select ${CARD_COLS},
        (select e.date from price_events e where e.property_id = p.id and e.event in ('sold','rented') order by e.date desc limit 1) as closed_on,
        (select first.price - p.price from price_events first where first.property_id = p.id and first.event = 'listed' order by first.date desc limit 1) as price_cut
       from properties p ${sql} order by ${order} limit ${PAGE_SIZE} offset ${offset}`,
      values,
    ),
    q<{ total: number }>(`select count(*)::int as total from properties p ${sql}`, values),
    q<Pin>(`select p.id, p.lat, p.lng, p.price, p.listing_type, p.status from properties p ${sql} order by ${order} limit 600`, values),
  ]);
  return { total, items, pins };
}

export type PropertyDetail = CardListing & {
  description: string;
  address: string;
  pincode: string;
  balconies: number;
  builtup_sqft: number | null;
  floor: number | null;
  total_floors: number | null;
  facing: string;
  age_years: number | null;
  possession_date: string | null;
  deposit: number | null;
  maintenance_monthly: number | null;
  negotiable: boolean;
  parking_covered: number;
  parking_open: number;
  amenities: string[];
  tenant_pref: string;
  pets_allowed: boolean;
  ownership: string;
  rera_id: string;
  owner_id: number | null;
  agent_id: number | null;
  project_id: number | null;
  available_from: string | null;
  views: number;
  updated_at: string;
  owner_name: string | null;
  agent: { id: number; name: string; agency: string; phone: string; rera_id: string; verified: boolean; rating: number | null; reviews: number } | null;
  project: { id: number; name: string; builder: string; rera_id: string } | null;
};

export async function getProperty(id: number): Promise<PropertyDetail | null> {
  const q = await db();
  const [row] = await q<PropertyDetail & { agent_json: unknown; project_json: unknown }>(
    `select p.*, u.name as owner_name,
       case when a.id is null then null else json_build_object('id', a.id, 'name', a.name, 'agency', a.agency, 'phone', a.phone,
         'rera_id', a.rera_id, 'verified', a.verified,
         'rating', (select round(avg(rating)::numeric, 1)::float from agent_reviews r where r.agent_id = a.id),
         'reviews', (select count(*)::int from agent_reviews r where r.agent_id = a.id)) end as agent_json,
       case when pr.id is null then null else json_build_object('id', pr.id, 'name', pr.name, 'builder', pr.builder, 'rera_id', pr.rera_id) end as project_json
     from properties p
     left join users u on u.id = p.owner_id
     left join agents a on a.id = p.agent_id
     left join projects pr on pr.id = p.project_id
     where p.id = $1 and p.status <> 'draft'`,
    [id],
  );
  if (!row) return null;
  const { agent_json, project_json, ...rest } = row;
  return { ...rest, agent: parseJson(agent_json), project: parseJson(project_json) } as PropertyDetail;
}

function parseJson<T>(v: unknown): T | null {
  if (v == null) return null;
  return (typeof v === "string" ? JSON.parse(v) : v) as T;
}

export async function getPropertyForOwner(id: number, userId: number) {
  const q = await db();
  const [row] = await q<PropertyDetail>("select * from properties where id = $1 and owner_id = $2", [id, userId]);
  return row ?? null;
}

export async function recordView(id: number) {
  const q = await db();
  await q("update properties set views = views + 1 where id = $1", [id]);
}

export async function priceHistory(id: number) {
  const q = await db();
  return q<{ event: string; price: number; date: string }>("select event, price, date from price_events where property_id = $1 order by date desc, id desc", [id]);
}

/** Comparable transactions near a point, for the estimate model. */
export async function compsNear(kind: "sale" | "rent", city: string, lat: number, lng: number) {
  const q = await db();
  return q<Comp>(
    `select price, carpet_sqft, bhk, property_type, floor, age_years, lat, lng, date, locality from transactions
     where kind = $1 and city = $2 and lat between $3 - 0.06 and $3 + 0.06 and lng between $4 - 0.06 and $4 + 0.06
       and date > now() - interval '36 months'
     limit 600`,
    [kind, city, lat, lng],
  );
}

export async function estimateFor(kind: "sale" | "rent", s: Parameters<typeof estimate>[1] & { city: string }): Promise<EstimateResult | null> {
  const comps = await compsNear(kind, s.city, s.lat, s.lng);
  const mk = findMarket(s.city, s.locality);
  return estimate(kind, s, comps, { fallbackPpsf: mk ? (kind === "sale" ? mk.ppsf : mk.rentPsf) : undefined });
}

export async function propertyEstimates(p: PropertyDetail) {
  if (p.property_type === "plot" && p.listing_type === "rent") return { sale: null, rent: null };
  const subject = {
    city: p.city, lat: p.lat, lng: p.lng, locality: p.locality, propertyType: p.property_type, bhk: p.bhk, carpetSqft: p.carpet_sqft,
    floor: p.floor, totalFloors: p.total_floors, ageYears: p.age_years, furnishing: p.furnishing, facing: p.facing, coveredParking: p.parking_covered,
  };
  const [sale, rent] = await Promise.all([
    estimateFor("sale", subject),
    p.property_type === "plot" ? Promise.resolve(null) : estimateFor("rent", subject),
  ]);
  return { sale, rent };
}

export async function similarHomes(p: PropertyDetail, limit = 8) {
  const q = await db();
  return q<CardListing>(
    `select ${CARD_COLS} from properties p
     where p.city = $1 and p.listing_type = $2 and p.status = 'active' and p.id <> $3
       and abs(p.bhk - $4) <= 1 and p.price between $5 * 0.7 and $5 * 1.3
     order by (p.locality = $6) desc, abs(p.lat - $7) + abs(p.lng - $8) limit ${limit}`,
    [p.city, p.listing_type, p.id, p.bhk, p.price, p.locality, p.lat, p.lng],
  );
}

export async function nearbyClosed(p: PropertyDetail, limit = 6) {
  const q = await db();
  return q<{ price: number; bhk: number; carpet_sqft: number; date: string; locality: string; property_type: string }>(
    `select price, bhk, carpet_sqft, date, locality, property_type from transactions
     where kind = $1 and city = $2 and lat between $3 - 0.02 and $3 + 0.02 and lng between $4 - 0.02 and $4 + 0.02
     order by date desc limit ${limit}`,
    [p.listing_type, p.city, p.lat, p.lng],
  );
}

export async function latestListings(city: string | null, kind: "sale" | "rent", limit = 8) {
  const q = await db();
  return q<CardListing>(
    `select ${CARD_COLS} from properties p where p.status = 'active' and p.listing_type = $1 and ($2::text is null or p.city = $2)
     order by p.verified desc, p.created_at desc limit ${limit}`,
    [kind, city],
  );
}

export async function cardsByIds(ids: number[]) {
  if (!ids.length) return [];
  const q = await db();
  return q<CardListing>(`select ${CARD_COLS} from properties p where p.id = any($1::int[])`, [ids]);
}

export function cityName(slug: string) {
  return CITY_BY_SLUG[slug]?.name ?? slug;
}
