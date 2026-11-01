import { inr } from "./format";
import { rentRulesFor } from "./rent-rules";

export type AgreementTerms = {
  landlordName: string;
  landlordAddress: string;
  tenantName: string;
  tenantAddress: string;
  propertyAddress: string;
  propertyDescription: string;
  furnishings: string;
  rent: number;
  deposit: number;
  maintenance: number; // 0 = included in rent
  dueDay: number;
  startDate: string; // yyyy-mm-dd
  months: number;
  noticeMonths: number;
  lockInMonths: number;
  renewalHikePct: number;
  depositRefundDays: number;
  occupants: number;
  petsAllowed: boolean;
  extraClauses: string; // one per line, written by the parties
};

export type AgreementStepId = "agreed" | "stamp" | "signed" | "police" | "inventory";
export type AgreementSteps = Partial<Record<Exclude<AgreementStepId, "agreed">, string>>; // ISO date when done

export function endDate(t: Pick<AgreementTerms, "startDate" | "months">) {
  const d = new Date(`${t.startDate}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + t.months);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

/**
 * The agreement as numbered clauses. Defaults follow the Model Tenancy Act, 2021: a capped
 * deposit with a fixed refund date, notice before entry, owner pays structural repairs, and no
 * eviction without notice.
 */
export function agreementClauses(t: AgreementTerms, state: string): { title: string; body: string }[] {
  const rules = rentRulesFor(state);
  const owner = "the Licensor (owner)";
  const tenant = "the Licensee (tenant)";
  const clauses = [
    { title: "Premises", body: `${owner} allows ${tenant} to use ${t.propertyDescription} at ${t.propertyAddress}${t.furnishings ? `, with these fittings and furnishings: ${t.furnishings}` : ""}, for residential use only.` },
    { title: "Term", body: `${t.months} months from ${longDate(t.startDate)} to ${longDate(endDate(t))}.${t.lockInMonths ? ` Neither party will end the agreement in the first ${t.lockInMonths} month${t.lockInMonths > 1 ? "s" : ""} except for a breach of this agreement.` : ""}` },
    { title: "Rent", body: `${inr(t.rent)} per month, paid in advance by the ${ordinal(t.dueDay)} of each month by bank transfer or UPI. ${owner} will give a receipt (a UPI or bank record is enough).${t.maintenance ? ` Society maintenance of ${inr(t.maintenance)} per month is paid by ${tenant}.` : " Society maintenance is included in the rent."}` },
    { title: "Security deposit", body: `${inr(t.deposit)}, refundable without interest. ${owner} returns it within ${t.depositRefundDays} days of ${tenant} handing back the keys, less only unpaid rent or bills and the cost of damage beyond normal wear and tear, each itemised in writing with receipts.` },
    { title: "Utilities", body: `${tenant} pays electricity, gas and internet bills for the term according to meter readings, and shares the final readings at move-out. Property tax is paid by ${owner}.` },
    { title: "Repairs", body: `${tenant} keeps the home clean and makes small day-to-day repairs (bulbs, taps, minor fixtures) and pays for damage they or their guests cause. ${owner} pays for structural repairs, water-tank and pump repairs, plumbing and wiring faults, seepage, and anything due to age. Urgent repairs reported in writing will be attended to within 7 days.` },
    { title: "Owner's visits", body: `${owner} may enter the home for inspection or repairs after giving at least 24 hours' notice in writing (a message is enough), between 7 am and 8 pm, except in an emergency.` },
    { title: "Essential services", body: `${owner} will not cut off or restrict water, electricity, lift, parking or other services to the home during the term.` },
    { title: "Occupants and use", body: `Up to ${t.occupants} people will live in the home. Pets are ${t.petsAllowed ? "allowed, and the tenant is responsible for any damage they cause" : "not allowed without the owner's written consent"}. ${tenant} will follow the society's bye-laws, will not sublet, and will not make structural changes without written consent.` },
    { title: "Ending the agreement", body: `Either party may end this agreement by giving ${t.noticeMonths} month${t.noticeMonths > 1 ? "s'" : "'s"} written notice. ${owner} may end it earlier only if ${tenant} does not pay rent for two consecutive months or seriously breaches this agreement, and only after written notice of the breach and 15 days to fix it.` },
    { title: "Renewal", body: `The parties may renew by a new written agreement.${t.renewalHikePct ? ` Any increase on renewal will not exceed ${t.renewalHikePct}% unless both agree otherwise.` : ""}` },
    { title: "Handing back", body: `At the end of the term ${tenant} returns the keys and the home in the condition received, apart from normal wear and tear. Both parties will do a joint walk-through using the move-in inventory.` },
    { title: "Paperwork", body: `This agreement will be executed on e-stamp paper as required in ${state}${rules.registrationRequired ? " and registered as the law requires" : ""}. Stamp duty${rules.registrationRequired ? ", registration fee" : ""} and notary charges are shared equally. ${owner} will complete the police tenant registration with the local police${rules.police ? ` (${rules.police.name})` : ""} within 7 days of move-in, and ${tenant} will give the details and ID needed.` },
    { title: "Disputes", body: `The parties will first try to settle any dispute by talking. Failing that, it will be decided under the rent and tenancy laws applicable in ${state}.` },
  ];
  for (const line of t.extraClauses.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 10)) {
    clauses.push({ title: "Additional term", body: line });
  }
  // Sentences that open with a party name start with lowercase "the".
  return clauses.map((c) => ({ ...c, body: c.body.replace(/(^|[.!?] )the (Licensor|Licensee)/g, "$1The $2") }));
}

export const STEP_LABELS: Record<AgreementStepId, string> = {
  agreed: "Both agree the terms online",
  stamp: "Buy the e-stamp paper",
  signed: "Sign (and register where required)",
  police: "Police tenant registration",
  inventory: "Move-in inventory recorded",
};
