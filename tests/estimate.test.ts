import { describe, expect, it } from "vitest";
import { estimate, featureFactor, fitGrowth, type Comp } from "@/lib/estimate";
import { rng } from "@/lib/seed/generate";

const now = new Date("2026-10-01");

function makeComps(ppsf: number, n: number, growth = 0.08): Comp[] {
  const r = rng(7);
  return Array.from({ length: n }, (_, i) => {
    const months = r() * 24;
    const sqft = 600 + Math.round(r() * 900);
    const f = { propertyType: "apartment", bhk: 2, carpetSqft: sqft, floor: 5, ageYears: 5 };
    const price = ppsf * Math.pow(1 + growth, -months / 12) * sqft * featureFactor("sale", f) * (0.95 + r() * 0.1);
    return { price, carpet_sqft: sqft, bhk: 2, property_type: "apartment", floor: 5, age_years: 5, lat: 12.97 + (r() - 0.5) * 0.01, lng: 77.59 + (r() - 0.5) * 0.01, date: new Date(now.getTime() - months * 30.44 * 86400000), locality: i % 2 ? "A" : "B" };
  });
}

describe("Kivora Estimate", () => {
  it("recovers the underlying price level from comparables", () => {
    const comps = makeComps(10000, 60);
    const e = estimate("sale", { propertyType: "apartment", bhk: 2, carpetSqft: 1000, floor: 5, ageYears: 5, lat: 12.97, lng: 77.59, locality: "A" }, comps, { now })!;
    const expected = 10000 * 1000 * featureFactor("sale", { propertyType: "apartment", bhk: 2, carpetSqft: 1000, floor: 5, ageYears: 5 });
    expect(Math.abs(e.value - expected) / expected).toBeLessThan(0.05);
    expect(e.low).toBeLessThan(e.value);
    expect(e.high).toBeGreaterThan(e.value);
    expect(e.confidence).toBe("high");
  });
  it("fits growth from comparable dates", () => {
    const comps = makeComps(10000, 80, 0.1);
    const pts = comps.map((c) => ({ months: -(now.getTime() - new Date(c.date).getTime()) / (30.44 * 86400000), ppsf: c.price / c.carpet_sqft, w: 1 }));
    expect(fitGrowth(pts)).toBeGreaterThan(0.05);
    expect(fitGrowth(pts)).toBeLessThan(0.16);
  });
  it("values higher floors, newer buildings and Vastu-preferred facing higher", () => {
    const base = { propertyType: "apartment", bhk: 2, carpetSqft: 900 };
    expect(featureFactor("sale", { ...base, floor: 12 })).toBeGreaterThan(featureFactor("sale", { ...base, floor: 1 }));
    expect(featureFactor("sale", { ...base, ageYears: 2 })).toBeGreaterThan(featureFactor("sale", { ...base, ageYears: 20 }));
    expect(featureFactor("sale", { ...base, facing: "east" })).toBeGreaterThan(featureFactor("sale", { ...base, facing: "south" }));
  });
  it("falls back to market level with low confidence when comps are scarce", () => {
    const e = estimate("rent", { propertyType: "apartment", bhk: 2, carpetSqft: 800, lat: 0, lng: 0, locality: "X" }, [], { fallbackPpsf: 30 });
    expect(e?.confidence).toBe("low");
    expect(estimate("rent", { propertyType: "apartment", bhk: 2, carpetSqft: 800, lat: 0, lng: 0, locality: "X" }, [])).toBeNull();
  });
});
