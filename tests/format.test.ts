import { describe, expect, it } from "vitest";
import { listingPrice, parseAmount, pinLabel, priceLabel } from "@/lib/format";

describe("Indian price formatting", () => {
  it("uses lakh and crore", () => {
    expect(priceLabel(1_25_00_000)).toBe("₹1.25 Cr");
    expect(priceLabel(85_00_000)).toBe("₹85 L");
    expect(priceLabel(2_00_00_000)).toBe("₹2 Cr");
    expect(priceLabel(45_000)).toBe("₹45,000");
  });
  it("formats rents per month with Indian grouping", () => {
    expect(listingPrice(125000, "rent")).toBe("₹1,25,000/mo");
  });
  it("makes short map pin labels", () => {
    expect(pinLabel(1_24_00_000)).toBe("₹1.2Cr");
    expect(pinLabel(85_40_000)).toBe("₹85L");
    expect(pinLabel(25_500)).toBe("₹26K");
  });
  it("parses typed amounts", () => {
    expect(parseAmount("1.5 cr")).toBe(1_50_00_000);
    expect(parseAmount("85L")).toBe(85_00_000);
    expect(parseAmount("₹45,000")).toBe(45_000);
    expect(parseAmount("20k")).toBe(20_000);
    expect(parseAmount("abc")).toBeNull();
  });
});
