// What each state calls its land and property records, and where to check them online.
// Links point to official state portals only. Portals get renamed (Dharani → Bhu Bharati),
// so every page shows a "report a broken link" path.

export type Portal = { name: string; url: string; what: string };
export type StateRecords = {
  slug: string;
  state: string;
  /** Local names people actually search for, e.g. "7/12", "Khatauni". */
  terms: string[];
  /** Plain-language explanation of the main record. */
  summary: string;
  portals: Portal[];
  /** Number printed on the record that identifies the land. */
  idLabel: string;
};

export const LAND_RECORDS: StateRecords[] = [
  {
    slug: "gujarat", state: "Gujarat", terms: ["7/12", "8-A", "AnyROR", "Index-2", "VF-6 (Hakk Patrak)"], idLabel: "Survey / Block no.",
    summary: "The 7/12 extract shows who owns a survey number, its area and any loans or rights on it. 8-A lists every survey number held by one khata (account holder). For flats in cities, Index-2 from the sub-registrar is the record of a registered sale.",
    portals: [
      { name: "AnyROR", url: "https://anyror.gujarat.gov.in", what: "7/12, 8-A and mutation entries (rural and urban)" },
      { name: "GARVI", url: "https://garvi.gujarat.gov.in", what: "Index-2, registered documents and jantri rates" },
      { name: "GujRERA", url: "https://gujrera.gujarat.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "maharashtra", state: "Maharashtra", terms: ["7/12 (Satbara)", "8-A", "Property Card", "Index-II"], idLabel: "Gat / Survey / CTS no.",
    summary: "Satbara (7/12) is the record of rights for agricultural and non-city land; in cities the Property Card plays that role for a CTS number. Index-II from the IGR shows registered sales and leave-and-licence agreements.",
    portals: [
      { name: "Mahabhumi", url: "https://bhulekh.mahabhumi.gov.in", what: "7/12, 8-A and Property Card" },
      { name: "IGR Maharashtra", url: "https://igrmaharashtra.gov.in", what: "Index-II, ready reckoner rates, e-registration" },
      { name: "MahaRERA", url: "https://maharera.maharashtra.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "karnataka", state: "Karnataka", terms: ["RTC (Pahani)", "Khata", "E-Khata", "EC"], idLabel: "Survey no.",
    summary: "The RTC (Pahani) is the record of rights, tenancy and crops for land. In Bengaluru, a property's Khata (A or B) with the BBMP decides whether it can get a loan or building plan — ask for an A-Khata. Kaveri gives the Encumbrance Certificate.",
    portals: [
      { name: "Bhoomi", url: "https://landrecords.karnataka.gov.in", what: "RTC / Pahani and mutation" },
      { name: "Kaveri Online", url: "https://kaveri.karnataka.gov.in", what: "Encumbrance Certificate and registered deeds" },
      { name: "RERA Karnataka", url: "https://rera.karnataka.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "telangana", state: "Telangana", terms: ["Pahani", "Bhu Bharati", "Dharani", "EC"], idLabel: "Survey no.",
    summary: "Bhu Bharati replaced Dharani as the land record system. Check the Pahani and pattadar passbook details for land, and the Encumbrance Certificate for any registered sale or mortgage on a flat.",
    portals: [
      { name: "Bhu Bharati", url: "https://bhubharati.telangana.gov.in", what: "Land records and pattadar details" },
      { name: "Registration & Stamps", url: "https://registration.telangana.gov.in", what: "Encumbrance Certificate and market value" },
      { name: "TG RERA", url: "https://rera.telangana.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "andhra-pradesh", state: "Andhra Pradesh", terms: ["Adangal", "1-B", "Meebhoomi", "EC"], idLabel: "Survey no.",
    summary: "Adangal (village account) and ROR 1-B show who holds a survey number. Get the Encumbrance Certificate from the registration department for any property you buy.",
    portals: [
      { name: "Meebhoomi", url: "https://meebhoomi.ap.gov.in", what: "Adangal, 1-B and village maps" },
      { name: "IGRS Andhra Pradesh", url: "https://registration.ap.gov.in", what: "Encumbrance Certificate and market value" },
      { name: "AP RERA", url: "https://rera.ap.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "tamil-nadu", state: "Tamil Nadu", terms: ["Patta", "Chitta", "A-Register", "EC"], idLabel: "Survey / subdivision no.",
    summary: "Patta is the revenue record of ownership; Chitta gives the land's type and area. The Encumbrance Certificate from TNREGINET lists every registered transaction on the property.",
    portals: [
      { name: "TN e-Services", url: "https://eservices.tn.gov.in", what: "Patta, Chitta and FMB sketch" },
      { name: "TNREGINET", url: "https://tnreginet.gov.in", what: "Encumbrance Certificate and guideline value" },
      { name: "TNRERA", url: "https://rera.tn.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "kerala", state: "Kerala", terms: ["Thandaper", "Possession Certificate", "EC"], idLabel: "Re-survey no.",
    summary: "The Thandaper account and possession certificate from the village office show who holds the land. Check the Encumbrance Certificate and basic tax receipt before paying an advance.",
    portals: [
      { name: "Kerala Revenue (ReLIS)", url: "https://revenue.kerala.gov.in", what: "Land records and tax receipts" },
      { name: "Kerala Registration", url: "https://keralaregistration.gov.in", what: "Encumbrance Certificate and fair value" },
      { name: "K-RERA", url: "https://rera.kerala.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "uttar-pradesh", state: "Uttar Pradesh", terms: ["Khatauni", "Khasra", "Bhulekh"], idLabel: "Khasra / Gata no.",
    summary: "Khatauni lists the landholders of a khata; Khasra gives each plot's area and use. For flats in Noida or Lucknow, check the authority allotment, the registered sale deed and an encumbrance search on IGRS.",
    portals: [
      { name: "UP Bhulekh", url: "https://upbhulekh.gov.in", what: "Khatauni and Khasra" },
      { name: "IGRS UP", url: "https://igrsup.gov.in", what: "Encumbrance and registered deeds" },
      { name: "UP RERA", url: "https://up-rera.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "delhi", state: "Delhi", terms: ["Khasra", "Khatauni", "Jamabandi", "Lal Dora"], idLabel: "Khasra no.",
    summary: "Most Delhi homes are freehold or DDA leasehold flats — check the conveyance deed and mutation with the municipal corporation. For land, ask for the Khasra and Jamabandi, and be careful with Lal Dora and unauthorised colonies.",
    portals: [
      { name: "Delhi Land Records", url: "https://dlrc.delhigovt.nic.in", what: "Khasra, Khatauni and Jamabandi" },
      { name: "DDA", url: "https://dda.gov.in", what: "DDA flat allotment and conversion" },
      { name: "Delhi RERA", url: "https://rera.delhi.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "haryana", state: "Haryana", terms: ["Jamabandi", "Fard", "Intkal (mutation)"], idLabel: "Khewat / Khasra no.",
    summary: "The Jamabandi (and the Fard copy of it) is Haryana's record of rights. Intkal entries show mutations after a sale. In Gurugram, also check the licence and occupation certificate of the colony.",
    portals: [
      { name: "Jamabandi Haryana", url: "https://jamabandi.nic.in", what: "Jamabandi, Fard and mutation" },
      { name: "HARERA Gurugram", url: "https://haryanarera.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "punjab", state: "Punjab", terms: ["Jamabandi", "Fard", "Intkal"], idLabel: "Khewat / Khasra no.",
    summary: "Fard is the copy of the Jamabandi that shows owners, cultivators and shares. Check mutation (Intkal) and that the colony is approved before buying a plot.",
    portals: [
      { name: "PLRS Jamabandi", url: "https://jamabandi.punjab.gov.in", what: "Fard, Jamabandi and mutation" },
      { name: "RERA Punjab", url: "https://rera.punjab.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "rajasthan", state: "Rajasthan", terms: ["Jamabandi", "Apna Khata", "Khasra"], idLabel: "Khasra no.",
    summary: "Apna Khata gives the Jamabandi and Khasra for land. For plots in Jaipur, check JDA approval and the patta issued by the authority.",
    portals: [
      { name: "Apna Khata", url: "https://apnakhata.rajasthan.gov.in", what: "Jamabandi and Khasra" },
      { name: "Rajasthan e-Panjiyan", url: "https://epanjiyan.rajasthan.gov.in", what: "Registered documents and DLC rates" },
      { name: "RERA Rajasthan", url: "https://rera.rajasthan.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "west-bengal", state: "West Bengal", terms: ["Khatian", "Dag / Plot no.", "Banglarbhumi"], idLabel: "Dag / Khatian no.",
    summary: "The Khatian is the record of rights; each plot is a Dag number. Check the Khatian is mutated in the seller's name (and the municipal mutation for flats) before signing.",
    portals: [
      { name: "Banglarbhumi", url: "https://banglarbhumi.gov.in", what: "Khatian and plot information" },
      { name: "WB Registration", url: "https://wbregistration.gov.in", what: "Registered deeds and market value" },
      { name: "WB RERA", url: "https://rera.wb.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "madhya-pradesh", state: "Madhya Pradesh", terms: ["Khasra", "B-1", "Bhu Abhilekh"], idLabel: "Khasra no.",
    summary: "Khasra shows the plot and its holder; B-1 lists a holder's khata. Check the diversion order before buying land for a house.",
    portals: [
      { name: "MP Bhulekh", url: "https://mpbhulekh.gov.in", what: "Khasra, B-1 and maps" },
      { name: "MP RERA", url: "https://rera.mp.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "bihar", state: "Bihar", terms: ["Jamabandi Register", "Khatiyan", "Bhumi Jankari"], idLabel: "Khata / Khesra no.",
    summary: "Register-II (Jamabandi) shows who pays rent on the land; the Khatiyan is the survey record. Check the online Jamabandi is in the seller's name.",
    portals: [
      { name: "Bihar Bhumi", url: "https://biharbhumi.bihar.gov.in", what: "Jamabandi, mutation and maps" },
      { name: "RERA Bihar", url: "https://rera.bihar.gov.in", what: "RERA project and agent registration" },
    ],
  },
  {
    slug: "odisha", state: "Odisha", terms: ["ROR", "Khatiyan", "Bhulekh"], idLabel: "Khata / Plot no.",
    summary: "Bhulekh Odisha gives the Record of Rights (Khatiyan) for each khata and plot.",
    portals: [
      { name: "Bhulekh Odisha", url: "https://bhulekh.ori.nic.in", what: "Record of Rights and plot details" },
      { name: "ORERA", url: "https://rera.odisha.gov.in", what: "RERA project and agent registration" },
    ],
  },
];

export const LAND_BY_STATE: Record<string, StateRecords> = Object.fromEntries(LAND_RECORDS.map((r) => [r.state, r]));
export const LAND_BY_SLUG: Record<string, StateRecords> = Object.fromEntries(LAND_RECORDS.map((r) => [r.slug, r]));

/** What to ask for before paying a token, for every state. */
export const BUY_CHECKLIST = [
  "Record of rights (above) in the seller's name, matching the area being sold",
  "Title chain: previous sale deeds going back 30 years, ideally reviewed by a lawyer",
  "Encumbrance Certificate for the same period — no loans or court cases on the property",
  "For new flats: RERA registration, approved plan and commencement certificate",
  "For ready flats: occupancy / completion certificate and society NOC for transfer",
  "Latest property tax receipt and electricity bill in the seller's name",
];

export const RENT_CHECKLIST = [
  "Owner's ID matches the name on the property tax or electricity bill",
  "Written rent agreement, stamped and registered where your state requires it",
  "Receipt for the deposit, and a dated photo inventory of fittings on move-in",
];
