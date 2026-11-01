import { describe, expect, it } from "vitest";
import { agreementClauses, endDate, type AgreementTerms } from "@/lib/agreement-text";

const terms: AgreementTerms = {
  landlordName: "A", landlordAddress: "", tenantName: "B", tenantAddress: "", propertyAddress: "Flat 1, Vadodara",
  propertyDescription: "2 BHK flat", furnishings: "", rent: 10000, deposit: 20000, maintenance: 0, dueDay: 5,
  startDate: "2026-09-01", months: 11, noticeMonths: 1, lockInMonths: 0, renewalHikePct: 5, depositRefundDays: 7,
  occupants: 2, petsAllowed: false, extraClauses: "Parking slot B-14",
};

describe("agreement text", () => {
  it("ends the term the day before the anniversary", () => {
    expect(endDate(terms)).toBe("2027-07-31");
  });
  it("includes the fair defaults and the parties' own terms", () => {
    const c = agreementClauses(terms, "Gujarat");
    const all = c.map((x) => x.body).join(" ");
    expect(all).toContain("within 7 days");
    expect(all).toContain("24 hours' notice");
    expect(all).toContain("Gujarat Police Citizen Portal");
    expect(c.at(-1)).toEqual({ title: "Additional term", body: "Parking slot B-14" });
    expect(all).not.toMatch(/\. the Licens/);
  });
});
