// Nakshly Estimate: a comparable-sales valuation model.
//
// 1. Every comparable transaction is normalised to a "standard home" price per sq ft by
//    dividing out its feature factor (floor, age, furnishing, facing, size, type).
// 2. Normalised values are moved to today using a growth rate fitted on the comps.
// 3. A weighted median is taken, weighting comps by distance, recency, locality and BHK.
// 4. The subject's own feature factor is applied back, giving the estimate.
// 5. The range widens with dispersion and with fewer comps.

import { distanceKm } from "./geo";

export type Kind = "sale" | "rent";
export type PropertyType = "apartment" | "builder_floor" | "independent_house" | "villa" | "plot";

export type Features = {
  propertyType: PropertyType | string;
  bhk: number;
  carpetSqft: number;
  floor?: number | null;
  totalFloors?: number | null;
  ageYears?: number | null;
  furnishing?: string | null;
  facing?: string | null;
  coveredParking?: number | null;
};

export type Comp = {
  price: number;
  carpet_sqft: number;
  bhk: number;
  property_type: string;
  floor: number | null;
  age_years: number | null;
  lat: number;
  lng: number;
  date: string | Date;
  locality: string;
};

export type Subject = Features & { lat: number; lng: number; locality: string };

export type EstimateResult = {
  value: number;
  low: number;
  high: number;
  ppsf: number;
  confidence: "high" | "medium" | "low";
  compsUsed: number;
  annualGrowth: number;
  comps: (Comp & { weight: number; distanceKm: number })[];
};

const VASTU_PREFERRED = new Set(["east", "north", "north-east"]);

export function featureFactor(kind: Kind, f: Features): number {
  let x = 1;
  const sqft = Math.max(150, f.carpetSqft || 0);
  x *= Math.pow(sqft / 800, -0.06);

  const typeFactor: Record<string, number> = kind === "sale"
    ? { apartment: 1, builder_floor: 0.93, independent_house: 1.1, villa: 1.22, plot: 0.72 }
    : { apartment: 1, builder_floor: 0.95, independent_house: 1.02, villa: 1.15, plot: 1 };
  x *= typeFactor[f.propertyType] ?? 1;

  if ((f.propertyType === "apartment" || f.propertyType === "builder_floor") && f.floor != null) {
    if (f.floor <= 0) x *= 0.96;
    else x *= 1 + Math.min(0.08, f.floor * 0.006);
    if (f.totalFloors && f.totalFloors <= 4 && f.floor === f.totalFloors) x *= 0.98;
  }

  if (f.ageYears != null && f.propertyType !== "plot") {
    x *= kind === "sale" ? Math.max(0.75, 1 - 0.009 * f.ageYears) : Math.max(0.88, 1 - 0.004 * f.ageYears);
  }

  const furn = (f.furnishing ?? "").toLowerCase();
  if (kind === "rent") x *= furn === "full" ? 1.15 : furn === "semi" ? 1.06 : 1;
  else x *= furn === "full" ? 1.03 : furn === "semi" ? 1.01 : 1;

  if (f.facing && VASTU_PREFERRED.has(f.facing.toLowerCase())) x *= kind === "sale" ? 1.03 : 1.01;
  if (kind === "sale" && (f.coveredParking ?? 0) > 0) x *= 1.02;
  return x;
}

function monthsBetween(a: Date, b: Date) {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

function weightedMedian(values: { v: number; w: number }[]) {
  const s = [...values].sort((a, b) => a.v - b.v);
  const total = s.reduce((t, x) => t + x.w, 0);
  let acc = 0;
  for (const x of s) {
    acc += x.w;
    if (acc >= total / 2) return x.v;
  }
  return s[s.length - 1]?.v ?? 0;
}

/** Weighted least squares slope of log(ppsf) on months → annual growth rate. */
export function fitGrowth(points: { months: number; ppsf: number; w: number }[]) {
  const W = points.reduce((t, p) => t + p.w, 0);
  if (points.length < 8 || W === 0) return 0.06;
  const mx = points.reduce((t, p) => t + p.w * p.months, 0) / W;
  const my = points.reduce((t, p) => t + p.w * Math.log(p.ppsf), 0) / W;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += p.w * (p.months - mx) * (Math.log(p.ppsf) - my);
    den += p.w * (p.months - mx) ** 2;
  }
  if (den === 0) return 0.06;
  const monthly = num / den;
  return Math.min(0.2, Math.max(-0.08, Math.exp(monthly * 12) - 1));
}

export function estimate(kind: Kind, subject: Subject, comps: Comp[], opts: { now?: Date; fallbackPpsf?: number } = {}): EstimateResult | null {
  const now = opts.now ?? new Date();
  const subjFactor = featureFactor(kind, subject);

  const prepared = comps
    .filter((c) => c.carpet_sqft > 0 && c.price > 0)
    .map((c) => {
      const d = distanceKm(subject, c);
      const age = monthsBetween(new Date(c.date), now);
      const norm = c.price / c.carpet_sqft / featureFactor(kind, {
        propertyType: c.property_type, bhk: c.bhk, carpetSqft: c.carpet_sqft, floor: c.floor, ageYears: c.age_years,
      });
      const sameLoc = c.locality.toLowerCase() === subject.locality.toLowerCase();
      const w = Math.exp(-d / 1.5) * Math.exp(-Math.max(0, age) / 18) * (sameLoc ? 1.5 : 1) *
        (c.bhk === subject.bhk ? 1.2 : 1) * (c.property_type === subject.propertyType ? 1.2 : 0.8);
      return { c, d, age, norm, w };
    })
    .filter((x) => x.d <= 6 && x.age <= 36);

  if (prepared.length < 3) {
    if (!opts.fallbackPpsf) return null;
    const value = opts.fallbackPpsf * subject.carpetSqft * subjFactor;
    return { value, low: value * 0.8, high: value * 1.2, ppsf: value / subject.carpetSqft, confidence: "low", compsUsed: prepared.length, annualGrowth: 0, comps: [] };
  }

  const growth = fitGrowth(prepared.map((x) => ({ months: -x.age, ppsf: x.norm, w: x.w })));
  const adjusted = prepared.map((x) => ({ ...x, today: x.norm * Math.pow(1 + growth, x.age / 12) }));
  const base = weightedMedian(adjusted.map((x) => ({ v: x.today, w: x.w })));

  const totalW = adjusted.reduce((t, x) => t + x.w, 0);
  const relMad = weightedMedian(adjusted.map((x) => ({ v: Math.abs(x.today - base) / base, w: x.w })));
  const nEff = totalW ** 2 / adjusted.reduce((t, x) => t + x.w ** 2, 0);
  const spread = Math.min(0.25, Math.max(0.05, relMad * 0.9 + 0.03 + 0.25 / Math.sqrt(nEff)));

  const value = base * subject.carpetSqft * subjFactor;
  const confidence = nEff >= 10 && spread < 0.12 ? "high" : nEff >= 4 && spread < 0.2 ? "medium" : "low";
  const top = [...adjusted].sort((a, b) => b.w - a.w).slice(0, 6).map((x) => ({ ...x.c, weight: x.w / totalW, distanceKm: x.d }));

  return {
    value: round(value, kind),
    low: round(value * (1 - spread), kind),
    high: round(value * (1 + spread), kind),
    ppsf: Math.round(value / subject.carpetSqft),
    confidence,
    compsUsed: adjusted.length,
    annualGrowth: growth,
    comps: top,
  };
}

function round(v: number, kind: Kind) {
  const step = kind === "rent" ? 500 : v >= 1e7 ? 1e5 : 1e4;
  return Math.round(v / step) * step;
}
