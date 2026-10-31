// Home-loan and purchase-cost maths for India. Rates and duties are indicative defaults
// the user can edit; they are not quotes.

export function emi(principal: number, annualRatePct: number, years: number) {
  const n = Math.round(years * 12);
  const r = annualRatePct / 12 / 100;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

/** Loan principal that a given EMI supports. */
export function principalForEmi(monthly: number, annualRatePct: number, years: number) {
  const n = Math.round(years * 12);
  const r = annualRatePct / 12 / 100;
  if (monthly <= 0 || n <= 0) return 0;
  if (r === 0) return monthly * n;
  return (monthly * ((1 + r) ** n - 1)) / (r * (1 + r) ** n);
}

/** RBI loan-to-value caps for housing loans by loan size. */
export function maxLtv(loanAmount: number) {
  if (loanAmount <= 30_00_000) return 0.9;
  if (loanAmount <= 75_00_000) return 0.8;
  return 0.75;
}

/** Max LTV applicable to a property of this price (largest loan that respects the cap). */
export function maxLoanForPrice(price: number) {
  for (const ltv of [0.9, 0.8, 0.75]) {
    const loan = price * ltv;
    if (maxLtv(loan) >= ltv) return loan;
  }
  return price * 0.75;
}

export type Affordability = { maxEmi: number; maxLoan: number; maxPrice: number; downPayment: number };

/**
 * Lenders typically cap total EMIs at 40–60% of net monthly income (FOIR).
 * We use 50% by default.
 */
export function affordability(opts: { monthlyIncome: number; existingEmis: number; savings: number; ratePct: number; years: number; foir?: number }): Affordability {
  const maxEmi = Math.max(0, opts.monthlyIncome * (opts.foir ?? 0.5) - opts.existingEmis);
  const loanByIncome = principalForEmi(maxEmi, opts.ratePct, opts.years);
  // Price limited both by income-backed loan and by down payment available under LTV caps.
  let lo = 0;
  let hi = (loanByIncome + opts.savings) * 1.5 + 1;
  for (let i = 0; i < 60; i++) {
    const price = (lo + hi) / 2;
    const loan = Math.min(maxLoanForPrice(price), loanByIncome);
    if (loan + opts.savings >= price) lo = price;
    else hi = price;
  }
  const maxPrice = Math.floor(lo);
  const maxLoan = Math.min(maxLoanForPrice(maxPrice), loanByIncome);
  return { maxEmi, maxLoan, maxPrice, downPayment: Math.max(0, maxPrice - maxLoan) };
}

export type StampDuty = { male: number; female: number; registration: number; registrationCap?: number; note?: string };

// Indicative urban residential rates (fraction of transaction value). Verify with the state
// registration department; many states add cesses, slabs and municipal surcharges.
export const STAMP_DUTY: Record<string, StampDuty> = {
  Maharashtra: { male: 0.06, female: 0.05, registration: 0.01, registrationCap: 30000, note: "Includes 1% metro cess in Mumbai, Pune, Thane, Nagpur" },
  Karnataka: { male: 0.056, female: 0.056, registration: 0.01, note: "5% duty + surcharge and cess" },
  Delhi: { male: 0.06, female: 0.04, registration: 0.01 },
  Haryana: { male: 0.07, female: 0.05, registration: 0.01, note: "Urban areas" },
  "Uttar Pradesh": { male: 0.07, female: 0.06, registration: 0.01, note: "Women's concession applies up to a value limit" },
  Telangana: { male: 0.06, female: 0.06, registration: 0.005, note: "Includes transfer duty" },
  "Tamil Nadu": { male: 0.07, female: 0.07, registration: 0.02 },
  "West Bengal": { male: 0.07, female: 0.07, registration: 0.01, note: "6% below ₹1 Cr in some areas" },
  Gujarat: { male: 0.049, female: 0.049, registration: 0.01, note: "Registration fee waived for women buyers" },
  Rajasthan: { male: 0.06, female: 0.05, registration: 0.01 },
  Kerala: { male: 0.08, female: 0.08, registration: 0.02 },
  "Madhya Pradesh": { male: 0.075, female: 0.075, registration: 0.03 },
  Punjab: { male: 0.07, female: 0.05, registration: 0.01 },
  Chandigarh: { male: 0.06, female: 0.04, registration: 0.01 },
  Odisha: { male: 0.05, female: 0.04, registration: 0.02 },
  "Andhra Pradesh": { male: 0.05, female: 0.05, registration: 0.01 },
  Assam: { male: 0.08, female: 0.07, registration: 0.085, note: "Registration slabs vary" },
  Bihar: { male: 0.063, female: 0.057, registration: 0.02 },
  Uttarakhand: { male: 0.05, female: 0.0375, registration: 0.02 },
  Goa: { male: 0.035, female: 0.035, registration: 0.02, note: "Slab-based; ~3.5% for most homes" },
};

export function purchaseCosts(price: number, state: string, buyer: "male" | "female" | "joint") {
  const d = STAMP_DUTY[state] ?? { male: 0.06, female: 0.06, registration: 0.01 };
  const rate = buyer === "female" ? d.female : buyer === "joint" ? (d.male + d.female) / 2 : d.male;
  const stamp = price * rate;
  let registration = price * d.registration;
  if (d.registrationCap) registration = Math.min(registration, d.registrationCap);
  if (state === "Gujarat" && buyer === "female") registration = 0;
  // GST applies only to under-construction homes: 1% affordable, 5% otherwise (no ITC).
  return { stampRate: rate, stamp, registration, total: stamp + registration, note: d.note };
}

export function gstOnUnderConstruction(price: number, affordable: boolean) {
  return price * (affordable ? 0.01 : 0.05);
}

// Indicative floating home-loan rates (% p.a.) — editable defaults, not live quotes.
export const INDICATIVE_LENDERS = [
  { name: "Public sector bank", from: 8.0, to: 9.6, processing: "0.35% (capped)" },
  { name: "Large private bank", from: 8.35, to: 9.85, processing: "up to 0.5%" },
  { name: "Housing finance company", from: 8.5, to: 10.75, processing: "up to 1%" },
  { name: "Small finance bank", from: 9.5, to: 12.5, processing: "up to 1.5%" },
];
