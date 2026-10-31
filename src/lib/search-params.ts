// Shared URL <-> SearchParams conversion used by pages, the API and the client.
import { parseAmount } from "./format";
import type { Mode, SearchParams } from "./types";
import { PROPERTY_TYPES } from "./types";

type Raw = Record<string, string | string[] | undefined> | URLSearchParams;

function get(raw: Raw, k: string) {
  if (raw instanceof URLSearchParams) return raw.get(k) ?? undefined;
  const v = raw[k];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}
const num = (s?: string) => {
  if (!s) return undefined;
  const n = parseAmount(s);
  return n == null || !Number.isFinite(n) ? undefined : n;
};

export function parseSearch(mode: Mode, city: string | undefined, raw: Raw): SearchParams {
  const types = get(raw, "type")?.split(",").filter((t) => t in PROPERTY_TYPES);
  const b = get(raw, "bounds")?.split(",").map(Number);
  return {
    mode,
    city,
    q: get(raw, "q")?.slice(0, 80) || undefined,
    minPrice: num(get(raw, "min")),
    maxPrice: num(get(raw, "max")),
    beds: num(get(raw, "beds")),
    baths: num(get(raw, "baths")),
    types: types?.length ? types : undefined,
    furnishing: ["unfurnished", "semi", "full"].includes(get(raw, "furnishing") ?? "") ? get(raw, "furnishing") : undefined,
    possession: ["ready", "under_construction"].includes(get(raw, "possession") ?? "") ? get(raw, "possession") : undefined,
    postedBy: ["owner", "agent", "builder"].includes(get(raw, "by") ?? "") ? get(raw, "by") : undefined,
    minSqft: num(get(raw, "minSqft")),
    maxSqft: num(get(raw, "maxSqft")),
    tenant: ["family", "bachelors", "women"].includes(get(raw, "tenant") ?? "") ? get(raw, "tenant") : undefined,
    verified: get(raw, "verified") === "1" || undefined,
    bounds: b && b.length === 4 && b.every(Number.isFinite) ? { n: b[0], s: b[1], e: b[2], w: b[3] } : undefined,
    sort: ["newest", "price_asc", "price_desc", "sqft_desc", "ppsf_asc"].includes(get(raw, "sort") ?? "") ? get(raw, "sort") : undefined,
    page: Math.max(1, Math.min(50, num(get(raw, "page")) ?? 1)),
  };
}

export function toQuery(p: Partial<SearchParams>) {
  const s = new URLSearchParams();
  if (p.q) s.set("q", p.q);
  if (p.minPrice) s.set("min", String(p.minPrice));
  if (p.maxPrice) s.set("max", String(p.maxPrice));
  if (p.beds) s.set("beds", String(p.beds));
  if (p.baths) s.set("baths", String(p.baths));
  if (p.types?.length) s.set("type", p.types.join(","));
  if (p.furnishing) s.set("furnishing", p.furnishing);
  if (p.possession) s.set("possession", p.possession);
  if (p.postedBy) s.set("by", p.postedBy);
  if (p.minSqft) s.set("minSqft", String(p.minSqft));
  if (p.maxSqft) s.set("maxSqft", String(p.maxSqft));
  if (p.tenant) s.set("tenant", p.tenant);
  if (p.verified) s.set("verified", "1");
  if (p.bounds) s.set("bounds", [p.bounds.n, p.bounds.s, p.bounds.e, p.bounds.w].map((x) => x.toFixed(4)).join(","));
  if (p.sort) s.set("sort", p.sort);
  if (p.page && p.page > 1) s.set("page", String(p.page));
  return s.toString();
}

export function searchPath(p: Partial<SearchParams> & { mode: Mode }) {
  const qs = toQuery(p);
  return `/${p.mode}${p.city ? `/${p.city}` : ""}${qs ? `?${qs}` : ""}`;
}
