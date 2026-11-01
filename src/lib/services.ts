// Everything Nakshly charges for. Search, listing, contacting owners and the Estimate stay free;
// these are optional, fixed-fee services that replace what a broker used to bundle in.

export type Service = {
  id: string;
  name: string;
  price: number | null; // null = free to the user (a partner pays us)
  unit?: string;
  pitch: string;
  includes: string[];
  audience: "renters" | "buyers" | "owners" | "pros";
};

export const SERVICES: Service[] = [
  {
    id: "rent-agreement", name: "Rent agreement", price: 499, audience: "renters",
    pitch: "The paperwork brokers charge ₹1,500–3,000 for. Drafted, e-stamped and delivered.",
    includes: ["11-month or longer agreement drafted for your state", "E-stamp paper at government rate (charged at actuals)", "Doorstep biometric registration where required (e.g. leave & licence in Maharashtra) — extra at actuals"],
  },
  {
    id: "tenant-verification", name: "Tenant verification", price: 299, audience: "owners",
    pitch: "ID check and the police verification form most cities require, filed for you.",
    includes: ["Aadhaar / PAN match", "Police tenant verification submitted", "Copy for your records"],
  },
  {
    id: "title-check", name: "Lawyer's title check", price: 2999, audience: "buyers",
    pitch: "A property lawyer reads 30 years of title before you pay a token.",
    includes: ["Record of rights (7/12, Khatauni, RTC…) and mutation entries", "Encumbrance Certificate search", "RERA, approvals and OC check", "Written report in 3 working days"],
  },
  {
    id: "sale-registration", name: "Sale deed & registration", price: 4999, audience: "buyers",
    pitch: "Draft, stamp duty calculation, appointment and a person with you at the sub-registrar.",
    includes: ["Sale deed drafted and reviewed", "Stamp duty and registration fee calculated (paid to government at actuals)", "Sub-registrar appointment booked and attended"],
  },
  {
    id: "home-loan", name: "Home loan", price: null, audience: "buyers",
    pitch: "Compare offers from banks and HFCs. Free to you — the lender pays us when your loan is disbursed.",
    includes: ["Eligibility check across lenders", "Document pickup", "Help until disbursement"],
  },
  {
    id: "boost", name: "Boost your listing", price: 299, unit: "14 days", audience: "owners",
    pitch: "Show your home at the top of your locality's search with a Featured badge.",
    includes: ["Top of search in your locality", "Featured badge", "Owner listings stay free — boosting is optional"],
  },
  {
    id: "pro", name: "Nakshly Pro for agents & builders", price: 2999, unit: "month, per locality", audience: "pros",
    pitch: "Get enquiries from buyers and sellers in your locality, with your fee shown up front.",
    includes: ["Featured agent slot in up to 2 localities", "Builders: pay per verified lead instead", "RERA registration required"],
  },
];

export const SERVICE_BY_ID: Record<string, Service> = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
