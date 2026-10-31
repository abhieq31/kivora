import { describe, expect, it } from "vitest";
import { affordability, emi, maxLoanForPrice, principalForEmi, purchaseCosts } from "@/lib/finance";

describe("home loan maths", () => {
  it("computes the standard EMI", () => {
    // ₹50 L at 8.5% for 20 years ≈ ₹43,391
    expect(Math.round(emi(50_00_000, 8.5, 20))).toBe(43391);
  });
  it("inverts EMI to principal", () => {
    const p = principalForEmi(emi(40_00_000, 9, 15), 9, 15);
    expect(Math.round(p)).toBe(40_00_000);
  });
  it("applies RBI loan-to-value caps", () => {
    expect(maxLoanForPrice(30_00_000)).toBe(27_00_000); // 90%
    expect(maxLoanForPrice(80_00_000)).toBe(64_00_000); // 80%
    expect(maxLoanForPrice(2_00_00_000)).toBe(1_50_00_000); // 75%
  });
  it("never lets loan + savings fall short of the price", () => {
    const a = affordability({ monthlyIncome: 2_00_000, existingEmis: 10_000, savings: 30_00_000, ratePct: 8.5, years: 20 });
    expect(a.maxLoan + 30_00_000).toBeGreaterThanOrEqual(a.maxPrice - 1);
    expect(emi(a.maxLoan, 8.5, 20)).toBeLessThanOrEqual(a.maxEmi + 1);
  });
  it("applies women's stamp duty concession and registration caps", () => {
    const m = purchaseCosts(1_00_00_000, "Maharashtra", "male");
    const f = purchaseCosts(1_00_00_000, "Maharashtra", "female");
    expect(f.stamp).toBeLessThan(m.stamp);
    expect(m.registration).toBe(30000);
    expect(purchaseCosts(50_00_000, "Gujarat", "female").registration).toBe(0);
  });
});
