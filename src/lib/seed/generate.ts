// Deterministic demo dataset. Everything produced here is flagged is_demo and uses
// fictional societies, people and companies.
import { CITIES, type City, type Market } from "../geo";
import { featureFactor, type Kind } from "../estimate";
import { AMENITIES, FACINGS } from "../constants";

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type R = () => number;
const pick = <T,>(r: R, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
const between = (r: R, a: number, b: number) => a + r() * (b - a);
const int = (r: R, a: number, b: number) => Math.floor(between(r, a, b + 1));
const gauss = (r: R) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
const weighted = <T,>(r: R, items: [T, number][]) => {
  const total = items.reduce((t, [, w]) => t + w, 0);
  let x = r() * total;
  for (const [v, w] of items) if ((x -= w) <= 0) return v;
  return items[items.length - 1][0];
};

const SOC_A = ["Green", "Royal", "Silver", "Sunrise", "Lake", "Palm", "Orchid", "Emerald", "Skyline", "Harmony", "Maple", "Cedar", "Coral", "Amber", "Ivory", "Lotus", "Banyan", "Neel", "Akash", "Saffron"];
const SOC_B = ["Residency", "Heights", "Enclave", "Towers", "Gardens", "Apartments", "Park", "Vista", "Meadows", "Court", "Greens", "Habitat", "Square", "Crest"];
const FIRST = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Rohan", "Kabir", "Arjun", "Vihaan", "Ananya", "Diya", "Isha", "Meera", "Priya", "Riya", "Sneha", "Kavya", "Nikhil", "Rahul", "Sanjay", "Pooja", "Farhan", "Zoya", "Imran", "Neha", "Harpreet", "Gurpreet", "Lakshmi", "Karthik", "Suresh", "Deepa", "Arnab", "Moumita", "Hemant", "Jignesh", "Nisha", "Tanvi"];
const LAST = ["Sharma", "Patel", "Iyer", "Reddy", "Nair", "Gupta", "Singh", "Mehta", "Rao", "Das", "Khan", "Kulkarni", "Joshi", "Menon", "Banerjee", "Chopra", "Desai", "Pillai", "Verma", "Shah", "Bose", "Naidu", "Kapoor", "Mishra"];
const AGENCY_A = ["Keystone", "Northstar", "Brickline", "Openhouse", "Truenorth", "Cityscape", "Landmark", "Homeward", "Pinnacle", "Urbanest"];
const AGENCY_B = ["Realty", "Property Advisors", "Homes", "Estates", "Realtors"];
const BUILDERS = ["Aurelia Developers", "Banyan Buildcon", "Cedarline Homes", "Meridian Infra", "Northfield Realty", "Solace Constructions", "Verdant Spaces", "Horizon Habitats"];
const PROJECT_A = ["Aurelia", "Skyline", "Riverstone", "The Orchards", "Celeste", "Palm Grove", "Evergreen", "Sapphire", "Monarch", "Serenity"];
const PROJECT_B = ["Residences", "Towers", "Park", "Heights", "One", "Phase II", "Gardens"];
const LANGS = ["English", "Hindi", "Marathi", "Kannada", "Telugu", "Tamil", "Bengali", "Gujarati", "Malayalam", "Punjabi"];
const CITY_LANG: Record<string, string> = { Maharashtra: "Marathi", Karnataka: "Kannada", Telangana: "Telugu", "Tamil Nadu": "Tamil", "West Bengal": "Bengali", Gujarat: "Gujarati", Kerala: "Malayalam" };
const REVIEW_LINES = [
  "Showed us only homes that matched our budget, no time wasted.",
  "Very clear about fees up front. Paperwork was handled smoothly.",
  "Helped negotiate the price down and checked the title documents.",
  "Responsive on WhatsApp and arranged visits on weekends.",
  "Knew every society in the area and their maintenance charges.",
  "Good experience overall, though a couple of visits got rescheduled.",
  "Honest advice — told us not to buy a flat with pending OC.",
  "Got the rent agreement and police verification done in two days.",
];

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export type Seed = ReturnType<typeof generate>;

export function generate(now = new Date()) {
  const r = rng(20261031);
  const agents: Record<string, unknown>[] = [];
  const reviews: { agentIndex: number; author: string; rating: number; body: string; deal_type: string; created_at: string }[] = [];
  const projects: Record<string, unknown>[] = [];
  const properties: Record<string, unknown>[] = [];
  const events: { propertyIndex: number; event: string; price: number; date: string }[] = [];
  const transactions: Record<string, unknown>[] = [];
  const projectRefs: number[] = []; // propertyIndex -> project index or -1
  const agentRefs: number[] = [];

  const name = () => `${pick(r, FIRST)} ${pick(r, LAST)}`;
  const jitter = (mk: Market, km = 0.9) => ({ lat: mk.lat + gauss(r) * km / 111, lng: mk.lng + gauss(r) * km / (111 * Math.cos((mk.lat * Math.PI) / 180)) });

  const homeShape = (city: City, kind: Kind, forceType?: string) => {
    const ncr = ["delhi", "gurugram", "noida"].includes(city.slug);
    const type = forceType ?? weighted(r, [
      ["apartment", 72], ["builder_floor", ncr ? 18 : 3], ["independent_house", 8], ["villa", 4], ...(kind === "sale" ? [["plot", 3] as [string, number]] : []),
    ]);
    const bhk = type === "plot" ? 0 : weighted(r, [[1, 18], [2, 40], [3, 30], [4, 9], [5, 3]]);
    const baseSqft = type === "plot" ? int(r, 1000, 3600) : [0, 450, 720, 1050, 1600, 2400][bhk];
    const carpet = Math.round((baseSqft * between(r, 0.85, 1.25) * (type === "villa" ? 1.5 : 1)) / 5) * 5;
    const high = ["mumbai", "gurugram", "noida", "bengaluru", "hyderabad", "pune", "thane"].includes(city.slug);
    const total = type === "apartment" ? int(r, 4, high ? 38 : 14) : type === "builder_floor" ? 4 : type === "plot" ? null : int(r, 1, 3);
    const floor = total == null ? null : type === "apartment" ? int(r, 0, total) : type === "builder_floor" ? int(r, 0, 3) : 0;
    const age = type === "plot" ? null : weighted(r, [[0, 12], [int(r, 1, 5), 35], [int(r, 6, 12), 30], [int(r, 13, 30), 23]]);
    return {
      type, bhk, carpet, floor, total, age,
      facing: pick(r, FACINGS),
      furnishing: type === "plot" ? "unfurnished" : weighted(r, [["unfurnished", 40], ["semi", 42], ["full", 18]]),
      coveredParking: type === "plot" ? 0 : weighted(r, [[0, 25], [1, 60], [2, 15]]),
    };
  };

  // Agents
  const agentsByCity: Record<string, number[]> = {};
  for (const city of CITIES.filter((c) => c.markets.length)) {
    agentsByCity[city.slug] = [];
    for (let i = 0; i < 8; i++) {
      const n = name();
      const locs = [...city.markets].sort(() => r() - 0.5).slice(0, int(r, 2, 4)).map((x) => x.name);
      const fixed = r() < 0.5;
      agentsByCity[city.slug].push(agents.length);
      agents.push({
        name: n,
        agency: `${pick(r, AGENCY_A)} ${pick(r, AGENCY_B)}`,
        phone: "90000" + String(10000 + agents.length).slice(-5),
        email: `${n.toLowerCase().replace(/\s/g, ".")}@example.com`,
        city: city.slug,
        localities: locs,
        rera_id: `DEMO-RERA-A-${String(1000 + agents.length)}`,
        experience_years: int(r, 2, 22),
        deals_closed: int(r, 15, 400),
        sale_fee: fixed ? `Flat ₹${pick(r, [49, 75, 99, 149])},000 per purchase` : `${pick(r, ["0.5", "0.75", "1"])}% of price`,
        rent_fee: fixed ? `Flat ₹${pick(r, [4999, 7499, 9999]).toLocaleString("en-IN")}` : pick(r, ["15 days' rent", "1 month's rent"]),
        languages: ["English", "Hindi", CITY_LANG[city.state]].filter((x, i2, a) => x && a.indexOf(x) === i2).concat(r() < 0.3 ? [pick(r, LANGS)] : []).filter((x, i2, a) => a.indexOf(x) === i2),
        bio: `Helping families in ${locs.join(", ")} buy and rent homes since ${now.getFullYear() - int(r, 2, 15)}. Every listing I share is visited and verified by me first.`,
        verified: r() < 0.8,
        is_demo: true,
      });
      const nr = int(r, 2, 9);
      for (let k = 0; k < nr; k++) {
        reviews.push({
          agentIndex: agents.length - 1,
          author: name(),
          rating: weighted(r, [[5, 55], [4, 30], [3, 10], [2, 5]]),
          body: pick(r, REVIEW_LINES),
          deal_type: pick(r, ["buy", "rent", "sell"]),
          created_at: new Date(now.getTime() - int(r, 5, 700) * DAY).toISOString(),
        });
      }
    }
  }

  // Projects (new construction)
  const projectsByCity: Record<string, number[]> = {};
  for (const city of CITIES.filter((c) => c.markets.length)) {
    projectsByCity[city.slug] = [];
    for (let i = 0; i < 3; i++) {
      const mk = pick(r, city.markets);
      const pos = jitter(mk, 1.2);
      const configs = ["2 BHK", "3 BHK", ...(r() < 0.5 ? ["4 BHK"] : []), ...(r() < 0.3 ? ["1 BHK"] : [])].sort();
      const lo = mk.ppsf * 1.08 * 700;
      projectsByCity[city.slug].push(projects.length);
      projects.push({
        name: `${pick(r, PROJECT_A)} ${pick(r, PROJECT_B)}`,
        builder: pick(r, BUILDERS),
        city: city.slug,
        locality: mk.name,
        lat: pos.lat,
        lng: pos.lng,
        rera_id: `DEMO/RERA/P/${city.slug.slice(0, 3).toUpperCase()}/${2024 + int(r, 0, 2)}/${String(100 + projects.length)}`,
        possession_date: iso(new Date(now.getTime() + int(r, 8, 40) * 30 * DAY)),
        status: r() < 0.8 ? "under_construction" : "ready",
        price_min: Math.round(lo / 1e5) * 1e5,
        price_max: Math.round((lo * between(r, 2.2, 3.5)) / 1e5) * 1e5,
        configurations: configs,
        amenities: [...AMENITIES].sort(() => r() - 0.5).slice(0, int(r, 10, 16)),
        towers: int(r, 2, 9),
        units_total: int(r, 180, 1400),
        land_acres: Math.round(between(r, 2, 18) * 10) / 10,
        description: `A gated community in ${mk.name} with ${configs.join(", ")} homes, landscaped podium gardens and a clubhouse. Construction-linked payment plan available.`,
        photos: [0, 1, 2, 3].map((k) => `/img/demo/${k === 0 ? "tower" : pick(r, ["living", "bedroom", "kitchen", "balcony"])}/${int(r, 1, 99999)}.svg`),
        is_demo: true,
      });
    }
  }

  // Listings + public transactions
  for (const city of CITIES.filter((c) => c.markets.length)) {
    for (const mk of city.markets) {
      const growth = between(r, 0.04, 0.12);
      const level = (kind: Kind, monthsAgo: number) => (kind === "sale" ? mk.ppsf : mk.rentPsf) * Math.pow(1 + growth * (kind === "rent" ? 0.8 : 1), -monthsAgo / 12);

      // Transactions (registered sales / signed rent agreements) over the last 24 months
      for (const [kind, count] of [["sale", 42], ["rent", 34]] as [Kind, number][]) {
        for (let i = 0; i < count; i++) {
          const h = homeShape(city, kind);
          const monthsAgo = between(r, 0, 24);
          const f = featureFactor(kind, { propertyType: h.type, bhk: h.bhk, carpetSqft: h.carpet, floor: h.floor, totalFloors: h.total, ageYears: h.age, furnishing: h.furnishing, facing: h.facing, coveredParking: h.coveredParking });
          const price = level(kind, monthsAgo) * h.carpet * f * Math.exp(gauss(r) * 0.09);
          const pos = jitter(mk);
          transactions.push({
            kind, city: city.slug, locality: mk.name, property_type: h.type, bhk: h.bhk, carpet_sqft: h.carpet,
            floor: h.floor, age_years: h.age,
            price: kind === "rent" ? Math.round(price / 500) * 500 : Math.round(price / 1e4) * 1e4,
            date: iso(new Date(now.getTime() - monthsAgo * 30.44 * DAY)),
            lat: pos.lat, lng: pos.lng, source: kind === "sale" ? "demo-registry" : "demo-agreement", is_demo: true,
          });
        }
      }

      // Active (and some recently closed) listings
      for (const [kind, count] of [["sale", 10], ["rent", 8]] as [Kind, number][]) {
        for (let i = 0; i < count; i++) {
          const underConstruction = kind === "sale" && r() < 0.12;
          const h = homeShape(city, kind, underConstruction ? "apartment" : undefined);
          if (underConstruction) h.age = 0;
          const f = featureFactor(kind, { propertyType: h.type, bhk: h.bhk, carpetSqft: h.carpet, floor: h.floor, totalFloors: h.total, ageYears: h.age, furnishing: h.furnishing, facing: h.facing, coveredParking: h.coveredParking });
          // Asking prices sit a little above transaction levels.
          const ask = level(kind, 0) * h.carpet * f * Math.exp(gauss(r) * 0.1) * (kind === "sale" ? 1.05 : 1.03);
          const price = kind === "rent" ? Math.round(ask / 500) * 500 : Math.round(ask / (ask > 1e7 ? 1e5 : 1e4)) * (ask > 1e7 ? 1e5 : 1e4);
          const pos = jitter(mk);
          const daysListed = int(r, 0, 120);
          const listed = new Date(now.getTime() - daysListed * DAY);
          const closed = r() < 0.12;
          const postedBy = underConstruction ? "builder" : weighted(r, [["owner", 50], ["agent", 50]]);
          const society = h.type === "apartment" ? `${pick(r, SOC_A)} ${pick(r, SOC_B)}` : "";
          const projIdx = underConstruction ? pick(r, projectsByCity[city.slug]) : -1;
          const agentIdx = postedBy === "agent" ? pick(r, agentsByCity[city.slug]) : -1;
          const photoKinds = h.type === "plot" ? ["plot", "plot"] : [h.type === "apartment" || h.type === "builder_floor" ? "tower" : h.type === "villa" ? "villa" : "house", "living", "bedroom", "kitchen", "bathroom", ...(h.bhk >= 2 ? ["bedroom"] : []), "balcony"];
          const idx = properties.length;
          projectRefs.push(projIdx);
          agentRefs.push(agentIdx);
          const deposit = kind === "rent" ? price * int(r, city.depositMonths[0], city.depositMonths[1]) : null;
          properties.push({
            listing_type: kind,
            status: closed ? (kind === "sale" ? "sold" : "rented") : "active",
            property_type: h.type,
            description: describe(r, h, mk.name, kind, society),
            city: city.slug,
            locality: mk.name,
            society,
            address: society ? `${society}, ${mk.name}` : `${pick(r, ["Lane", "Road", "Cross"])} ${int(r, 1, 18)}, ${mk.name}`,
            pincode: "",
            lat: pos.lat,
            lng: pos.lng,
            bhk: h.bhk,
            bathrooms: h.bhk === 0 ? 0 : Math.max(1, h.bhk - (r() < 0.4 ? 1 : 0)),
            balconies: h.type === "plot" ? 0 : int(r, 0, Math.min(3, h.bhk)),
            carpet_sqft: h.carpet,
            builtup_sqft: h.type === "plot" ? null : Math.round(h.carpet * 1.2),
            super_sqft: h.type === "apartment" ? Math.round(h.carpet * between(r, 1.28, 1.42)) : null,
            floor: h.floor,
            total_floors: h.total,
            facing: h.facing,
            furnishing: h.furnishing,
            age_years: h.age,
            possession: underConstruction ? "under_construction" : "ready",
            possession_date: underConstruction ? iso(new Date(now.getTime() + int(r, 6, 36) * 30 * DAY)) : null,
            price,
            deposit,
            maintenance_monthly: h.type === "apartment" ? Math.round((h.carpet * 1.3 * between(r, 2, 5)) / 100) * 100 : null,
            negotiable: r() < 0.5,
            parking_covered: h.coveredParking,
            parking_open: r() < 0.2 ? 1 : 0,
            amenities: h.type === "apartment" ? [...AMENITIES].sort(() => r() - 0.5).slice(0, int(r, 5, 14)) : [...AMENITIES.slice(0, 4)].filter(() => r() < 0.6),
            tenant_pref: kind === "rent" ? weighted(r, [["any", 50], ["family", 30], ["bachelors", 12], ["women", 8]]) : "any",
            pets_allowed: kind === "rent" ? r() < 0.35 : true,
            ownership: weighted(r, [["freehold", 80], ["co-operative", 10], ["leasehold", 10]]),
            rera_id: underConstruction ? `DEMO/RERA/P/${city.slug.slice(0, 3).toUpperCase()}/${int(r, 1000, 9999)}` : "",
            posted_by: postedBy,
            photos: photoKinds.map((k) => `/img/demo/${k}/${int(r, 1, 99999)}.svg`),
            available_from: kind === "rent" ? iso(new Date(now.getTime() + int(r, 0, 45) * DAY)) : null,
            views: int(r, 20, 2400),
            verified: r() < 0.7,
            is_demo: true,
            created_at: listed.toISOString(),
            updated_at: listed.toISOString(),
          });

          // Price history: previous transactions for this home, listing, drops, closing.
          if (kind === "sale" && h.age && h.age > 3 && r() < 0.45) {
            const yrs = int(r, 3, Math.min(12, h.age));
            events.push({ propertyIndex: idx, event: "sold", price: Math.round((price * Math.pow(1 + growth, -yrs) * between(r, 0.9, 1.0)) / 1e4) * 1e4, date: iso(new Date(now.getTime() - yrs * 365 * DAY - int(r, 0, 200) * DAY)) });
          }
          if (kind === "rent" && r() < 0.5) {
            const yrs = int(r, 1, 3);
            events.push({ propertyIndex: idx, event: "rented", price: Math.round((price * Math.pow(1.06, -yrs)) / 500) * 500, date: iso(new Date(now.getTime() - yrs * 365 * DAY)) });
          }
          const firstPrice = r() < 0.22 ? Math.round((price * between(r, 1.03, 1.1)) / (kind === "rent" ? 500 : 1e4)) * (kind === "rent" ? 500 : 1e4) : price;
          events.push({ propertyIndex: idx, event: "listed", price: firstPrice, date: iso(listed) });
          if (firstPrice !== price) events.push({ propertyIndex: idx, event: "price_change", price, date: iso(new Date(listed.getTime() + Math.max(1, Math.floor(daysListed / 2)) * DAY)) });
          if (closed) events.push({ propertyIndex: idx, event: kind === "sale" ? "sold" : "rented", price: kind === "sale" ? Math.round((price * between(r, 0.93, 0.99)) / 1e4) * 1e4 : price, date: iso(new Date(now.getTime() - int(r, 0, 10) * DAY)) });
        }
      }
    }
  }

  return { agents, reviews, projects, properties, events, transactions, projectRefs, agentRefs };
}

function describe(r: R, h: { type: string; bhk: number; carpet: number; floor: number | null; total: number | null; facing: string; furnishing: string }, locality: string, kind: Kind, society: string) {
  const what = h.type === "plot" ? `${h.carpet} sq ft residential plot` : `${h.bhk} BHK ${h.type.replace("_", " ")}`;
  const lines = [
    `${kind === "sale" ? "Well-maintained" : "Spacious"} ${what} in ${society ? society + ", " : ""}${locality}.`,
    h.floor != null && h.total ? `On floor ${h.floor} of ${h.total}, ${h.facing}-facing with good cross ventilation.` : `${h.facing[0].toUpperCase() + h.facing.slice(1)}-facing.`,
    h.type !== "plot" ? `${h.furnishing === "full" ? "Fully furnished with wardrobes, ACs and appliances." : h.furnishing === "semi" ? "Semi-furnished with modular kitchen, wardrobes and lights/fans." : "Unfurnished, ready to set up your way."}` : "Clear title, approved layout, road-facing.",
    pick(r, ["Schools, hospitals and supermarkets within 2 km.", "Close to the metro and main road, yet quiet inside.", "Walking distance to daily needs and parks.", "Easy commute to major tech parks and offices."]),
  ];
  return lines.join(" ");
}
