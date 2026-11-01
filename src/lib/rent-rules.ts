// How renting works in each state: what the agreement is called, stamp duty, whether it must be
// registered, and where the landlord files the police tenant registration.
// General information, checked Nov 2026 — every screen that shows it says to confirm with the
// state portal. Leases of 12 months or more must be registered everywhere (Registration Act, s.17).

export type RentRules = {
  state: string;
  agreementName: string;
  /** Typical stamp duty for an 11-month residential agreement, in words. */
  stampDuty: string;
  /** Fixed amount we can pre-fill, when the state charges a flat fee. */
  stampFlat?: number;
  registration: string;
  registrationRequired: boolean;
  police: { name: string; url: string; note: string };
  /** State-specific points tenants and owners trip over. */
  notes: string[];
};

const DIGITAL_POLICE = { name: "Digital Police portal (MHA)", url: "https://digitalpolice.gov.in", note: "National portal for tenant verification requests; your state police site may have its own form." };

export const RENT_RULES: Record<string, RentRules> = {
  Maharashtra: {
    state: "Maharashtra", agreementName: "Leave and Licence agreement",
    stampDuty: "0.25% of total rent for the term plus a notional amount on the deposit (calculated on the IGR portal)",
    registration: "Compulsory for every leave and licence agreement, even 11 months. Can be done fully online on the IGR portal with Aadhaar biometric, including at home.",
    registrationRequired: true,
    police: { name: "Mumbai Police tenant information / Pune Police", url: "https://mumbaipolice.gov.in/TenantForm", note: "Owners must inform the local police. Mumbai and Pune accept it online; elsewhere at the police station." },
    notes: ["An unregistered leave and licence agreement is hard to enforce in Maharashtra — insist on registration.", "Registration fee is about ₹1,000 in municipal areas and ₹500 elsewhere."],
  },
  Gujarat: {
    state: "Gujarat", agreementName: "Leave and Licence / rent agreement",
    stampDuty: "Under Article 30 of the Gujarat Stamp Act, on rent and deposit — buy it as an e-stamp from SHCIL (a typical 11-month city flat is a few hundred rupees)",
    registration: "Not compulsory for up to 11 months; most agreements are notarised. Register if the term is 12 months or more.",
    registrationRequired: false,
    police: { name: "Gujarat Police Citizen Portal", url: "https://gujhome.gujarat.gov.in", note: "Police commissioner orders in Ahmedabad, Vadodara, Surat and Rajkot require owners to register tenants. Do it online the week the tenant moves in." },
    notes: ["Never share your Citizen Portal password with a broker or write it on the agreement — the portal lets you add the tenant yourself in 10 minutes."],
  },
  Delhi: {
    state: "Delhi", agreementName: "Rent agreement",
    stampDuty: "₹100 e-stamp for up to 11 months", stampFlat: 100,
    registration: "Not compulsory for up to 11 months. Register for 12 months or more.",
    registrationRequired: false,
    police: { name: "Delhi Police tenant registration", url: "https://delhipolice.gov.in", note: "Tenant registration is mandatory and can be filed online under Citizen Services." },
    notes: [],
  },
  Haryana: {
    state: "Haryana", agreementName: "Rent agreement", stampDuty: "Based on rent and deposit; buy as an e-stamp",
    registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Haryana Police (Harsamay)", url: "https://harsamay.gov.in", note: "Tenant verification is available online." },
    notes: ["In Gurugram, check whether the society requires its own tenant form too."],
  },
  "Uttar Pradesh": {
    state: "Uttar Pradesh", agreementName: "Rent agreement (UP Urban Premises Tenancy Act, 2021)",
    stampDuty: "Small fixed amount for short agreements; the state has proposed lower rates to encourage registration — check IGRS UP",
    registration: "The 2021 Act requires the agreement to be informed to the Rent Authority.", registrationRequired: false,
    police: { name: "UP Police (UPCOP)", url: "https://uppolice.gov.in", note: "Tenant verification online through UPCOP." },
    notes: ["UP's 2021 tenancy law follows the Model Tenancy Act: deposit capped at 2 months for homes."],
  },
  Karnataka: {
    state: "Karnataka", agreementName: "Rental agreement", stampDuty: "Small amount for 11-month agreements; buy as a Karnataka e-stamp",
    registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Karnataka State Police / Bengaluru City Police", url: "https://ksp.karnataka.gov.in", note: "Tenant verification through the police app or station." },
    notes: ["Bengaluru deposits are often 6–10 months' rent — the Model Tenancy Act suggests 2. You can negotiate."],
  },
  Telangana: {
    state: "Telangana", agreementName: "Rental agreement", stampDuty: "Based on rent and deposit; buy as an e-stamp",
    registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Telangana Police", url: "https://www.tspolice.gov.in", note: "Tenant information through the police citizen app or station." },
    notes: [],
  },
  "Tamil Nadu": {
    state: "Tamil Nadu", agreementName: "Tenancy agreement (TN Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017)",
    stampDuty: "Based on rent; buy on stamp paper or e-stamp",
    registration: "Every tenancy must be registered with the Rent Authority within 90 days under the 2017 Act.", registrationRequired: true,
    police: { name: "Tamil Nadu Police citizen services", url: "https://eservices.tnpolice.gov.in", note: "Tenant verification online." },
    notes: ["Tamil Nadu's tenancy law requires a written agreement registered with the Rent Authority — keep the registration number."],
  },
  Kerala: {
    state: "Kerala", agreementName: "Rent agreement", stampDuty: "Based on rent and deposit", registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Kerala Police Thuna", url: "https://thuna.keralapolice.gov.in", note: "Tenant verification through the Thuna portal." }, notes: [],
  },
  "West Bengal": {
    state: "West Bengal", agreementName: "Rent agreement (WB Premises Tenancy Act, 1997)", stampDuty: "Based on rent; buy on stamp paper or e-stamp",
    registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Kolkata Police", url: "https://kolkatapolice.gov.in", note: "Tenant information at the local police station or online where available." }, notes: [],
  },
  Rajasthan: {
    state: "Rajasthan", agreementName: "Rent agreement", stampDuty: "Based on rent and deposit; buy as an e-stamp",
    registration: "Not compulsory for up to 11 months.", registrationRequired: false,
    police: { name: "Rajasthan Police", url: "https://police.rajasthan.gov.in", note: "Tenant verification online or at the station." }, notes: [],
  },
};

export function rentRulesFor(state: string): RentRules {
  return RENT_RULES[state] ?? {
    state, agreementName: "Rent agreement", stampDuty: "Set by the state on rent and deposit; buy as an e-stamp",
    registration: "Not usually compulsory for up to 11 months; compulsory for 12 months or more.", registrationRequired: false,
    police: DIGITAL_POLICE, notes: [],
  };
}

/** Defaults from the Model Tenancy Act, 2021 — the central model law. We use them as fair baseline terms. */
export const FAIR_TERMS = [
  { title: "Deposit", body: "At most 2 months' rent for a home, returned when you hand back the keys, minus only itemised, receipted deductions." },
  { title: "Entering the home", body: "The owner gives at least 24 hours' written notice and visits between 7 am and 8 pm." },
  { title: "Essential services", body: "Water, electricity, lift and parking can't be cut off to pressure a tenant." },
  { title: "Repairs", body: "Structural repairs, external painting, plumbing and wiring faults are the owner's; day-to-day upkeep and damage the tenant causes are the tenant's." },
  { title: "Normal wear and tear", body: "Fading paint, worn fittings and age-related wear are not deducted from the deposit." },
  { title: "Rent increases", body: "Only as written in the agreement, with notice — not mid-term." },
  { title: "Leaving early", body: "Either side gives the notice in the agreement (usually one month). No eviction without notice." },
];

/** Clauses that often appear in broker templates and tilt the deal. Shown as warnings in the checker. */
export const UNFAIR_PATTERNS = [
  { id: "evict-no-notice", label: "Eviction without notice", why: "Clauses like \"vacate within 24 hours without notice\" ignore the agreed notice period." },
  { id: "deposit-any-damage", label: "Deposit cut for 'any damage'", why: "Should exclude normal wear and tear, and deductions should be itemised with receipts." },
  { id: "no-refund-timeline", label: "No deposit refund date", why: "Ask for a fixed date — e.g. within 7 days of handing back the keys." },
  { id: "excessive-deposit", label: "Deposit above 2 months", why: "The Model Tenancy Act suggests 2 months for homes." },
  { id: "tenant-pays-structural", label: "Tenant pays for owner's repairs", why: "Motor, tank, plumbing and structural repairs are normally the owner's cost." },
  { id: "usage-restrictions", label: "Unreasonable house rules", why: "Rules about where to wash clothes or utensils, or deep-cleaning walls and ceilings every month, go beyond normal care." },
  { id: "third-party-eviction", label: "Eviction if neighbours or society object", why: "Ending a tenancy should depend on a breach of the agreement, not a third party's objection." },
  { id: "all-costs-tenant", label: "All agreement costs on the tenant", why: "Stamp duty and registration are commonly split 50:50." },
  { id: "auto-hike", label: "Fixed hike on renewal", why: "A renewal is a new agreement — the increase is negotiable, typically 5–10%." },
];
