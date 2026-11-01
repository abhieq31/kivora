import { describe, expect, it } from "vitest";
import { parseAd } from "@/lib/ad-parse";

describe("parseAd", () => {
  it("reads a WhatsApp sale ad in Indian number format", () => {
    const ad = parseAd("2BHK fully furnished\n₹46,00,000 negotiable.\nShukan-1", "vadodara");
    expect(ad).toMatchObject({ bhk: 2, furnishing: "full", price: 4_600_000, negotiable: true, listing_type: "sale", property_type: "apartment", city: "vadodara" });
  });

  it("reads a rental with deposit and area", () => {
    const ad = parseAd("1 BHK flat for rent in Gotri, Vadodara. Semi furnished, 650 sq ft, 3rd floor. Rent 12k per month, deposit 24,000. Family only.");
    expect(ad).toMatchObject({ bhk: 1, listing_type: "rent", price: 12_000, deposit: 24_000, carpet_sqft: 650, floor: 3, furnishing: "semi", tenant_pref: "family", city: "vadodara", locality: "Gotri" });
  });

  it("understands crore and lakh", () => {
    expect(parseAd("3 bhk villa for sale 1.25 cr").price).toBe(12_500_000);
    expect(parseAd("Resale flat 85 lakh, 2 bhk").price).toBe(8_500_000);
  });
});
