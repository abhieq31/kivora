import { describe, expect, it } from "vitest";
import { parseSearch, searchPath } from "@/lib/search-params";

describe("search URL params", () => {
  it("round-trips filters", () => {
    const p = parseSearch("buy", "pune", new URLSearchParams("min=50L&max=1.5cr&beds=2&type=apartment,villa,bogus&sort=price_asc&page=2"));
    expect(p.minPrice).toBe(50_00_000);
    expect(p.maxPrice).toBe(1_50_00_000);
    expect(p.types).toEqual(["apartment", "villa"]);
    expect(searchPath(p)).toBe("/buy/pune?min=5000000&max=15000000&beds=2&type=apartment%2Cvilla&sort=price_asc&page=2");
  });
  it("rejects unknown enums and bad bounds", () => {
    const p = parseSearch("rent", undefined, new URLSearchParams("furnishing=palace&sort=drop table&bounds=1,2,x,4"));
    expect(p.furnishing).toBeUndefined();
    expect(p.sort).toBeUndefined();
    expect(p.bounds).toBeUndefined();
  });
});
