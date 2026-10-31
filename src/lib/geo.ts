// Indian cities and localities. `markets` carry demo market levels used to seed data and
// as a fallback for estimates: ppsf = sale price per sq ft of carpet area, rentPsf = monthly
// rent per sq ft of carpet area. These are illustrative, not authoritative.

export type Market = { name: string; lat: number; lng: number; ppsf: number; rentPsf: number };
export type City = {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  /** Typical security deposit for rentals, in months of rent. */
  depositMonths: [number, number];
  markets: Market[];
  /** Extra locality names offered as suggestions (no market data). */
  suggest?: string[];
};

const m = (name: string, lat: number, lng: number, ppsf: number, rentPsf: number): Market => ({ name, lat, lng, ppsf, rentPsf });

export const CITIES: City[] = [
  {
    slug: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, depositMonths: [3, 6],
    markets: [
      m("Andheri West", 19.1364, 72.8296, 27000, 70), m("Powai", 19.1176, 72.906, 25000, 65),
      m("Bandra West", 19.0596, 72.8295, 50000, 110), m("Goregaon East", 19.1663, 72.8526, 21000, 55),
      m("Malad West", 19.1872, 72.8484, 20000, 52), m("Borivali West", 19.2307, 72.8567, 20000, 48),
      m("Chembur", 19.0522, 72.9005, 22000, 55), m("Lower Parel", 18.9953, 72.8302, 45000, 100),
      m("Worli", 19.0176, 72.8162, 55000, 115), m("Ghatkopar East", 19.079, 72.908, 22000, 55),
    ],
    suggest: ["Kandivali West", "Andheri East", "Santacruz", "Juhu", "Mulund West", "Dadar"],
  },
  {
    slug: "bengaluru", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, depositMonths: [5, 10],
    markets: [
      m("Whitefield", 12.9698, 77.75, 8500, 30), m("HSR Layout", 12.9116, 77.6474, 11000, 40),
      m("Koramangala", 12.9352, 77.6245, 14000, 48), m("Indiranagar", 12.9784, 77.6408, 16000, 50),
      m("Electronic City", 12.8452, 77.6602, 6000, 22), m("Marathahalli", 12.9569, 77.7011, 8500, 32),
      m("Sarjapur Road", 12.91, 77.687, 8000, 30), m("Hebbal", 13.0358, 77.597, 11000, 35),
      m("JP Nagar", 12.9063, 77.5857, 10000, 34), m("Bellandur", 12.926, 77.6762, 9500, 36),
    ],
    suggest: ["BTM Layout", "Jayanagar", "Yelahanka", "Hennur", "Bannerghatta Road", "Rajajinagar"],
  },
  {
    slug: "delhi", name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, depositMonths: [2, 3],
    markets: [
      m("Dwarka", 28.5921, 77.046, 12000, 30), m("Rohini", 28.7383, 77.0822, 11000, 26),
      m("Saket", 28.5245, 77.2066, 22000, 45), m("Vasant Kunj", 28.52, 77.159, 20000, 42),
      m("Mayur Vihar", 28.6045, 77.2946, 12000, 28), m("Lajpat Nagar", 28.5677, 77.2433, 22000, 45),
      m("Janakpuri", 28.6219, 77.0878, 14000, 30), m("Laxmi Nagar", 28.6304, 77.2777, 9000, 24),
    ],
    suggest: ["Greater Kailash", "Hauz Khas", "Pitampura", "Karol Bagh", "Malviya Nagar"],
  },
  {
    slug: "gurugram", name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, depositMonths: [2, 3],
    markets: [
      m("Golf Course Road", 28.4507, 77.097, 20000, 45), m("Sohna Road", 28.4089, 77.042, 11000, 28),
      m("DLF Phase 3", 28.4936, 77.0937, 15000, 38), m("Golf Course Extension Road", 28.4, 77.09, 14000, 32),
      m("Sector 56", 28.4244, 77.1027, 12000, 30), m("New Gurgaon", 28.396, 76.96, 8000, 20),
    ],
    suggest: ["Dwarka Expressway", "MG Road", "Sector 49", "Palam Vihar"],
  },
  {
    slug: "noida", name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391, depositMonths: [2, 3],
    markets: [
      m("Sector 62", 28.627, 77.365, 8500, 24), m("Sector 75", 28.577, 77.386, 7500, 22),
      m("Sector 137", 28.511, 77.409, 7500, 22), m("Sector 50", 28.572, 77.364, 11000, 28),
      m("Noida Extension", 28.6, 77.43, 5000, 15),
    ],
    suggest: ["Sector 150", "Sector 18", "Sector 76", "Sector 44"],
  },
  {
    slug: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, depositMonths: [2, 3],
    markets: [
      m("Gachibowli", 17.4401, 78.3489, 9500, 32), m("Madhapur", 17.4483, 78.3915, 10500, 36),
      m("Kondapur", 17.46, 78.357, 9000, 30), m("Kukatpally", 17.4948, 78.3996, 7000, 24),
      m("HITEC City", 17.4435, 78.3772, 10500, 36), m("Manikonda", 17.405, 78.386, 7500, 26),
      m("Banjara Hills", 17.4156, 78.4347, 15000, 40), m("Kokapet", 17.396, 78.329, 10000, 30),
      m("Miyapur", 17.496, 78.357, 6500, 22),
    ],
    suggest: ["Jubilee Hills", "Narsingi", "Tellapur", "Begumpet", "Uppal"],
  },
  {
    slug: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, depositMonths: [2, 4],
    markets: [
      m("Hinjewadi", 18.5913, 73.7389, 7500, 28), m("Wakad", 18.599, 73.762, 8000, 28),
      m("Baner", 18.559, 73.7868, 10500, 35), m("Kharadi", 18.551, 73.94, 9500, 33),
      m("Viman Nagar", 18.5679, 73.9143, 11000, 36), m("Hadapsar", 18.5089, 73.926, 7000, 24),
      m("Kothrud", 18.5074, 73.8077, 11500, 33), m("Wagholi", 18.58, 73.98, 5500, 18),
      m("Aundh", 18.558, 73.807, 12000, 36),
    ],
    suggest: ["Magarpatta", "Balewadi", "Pimple Saudagar", "Undri", "Koregaon Park"],
  },
  {
    slug: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, depositMonths: [3, 6],
    markets: [
      m("Sholinganallur", 12.901, 80.2279, 7000, 24), m("Velachery", 12.9815, 80.218, 9000, 28),
      m("Anna Nagar", 13.085, 80.2101, 14000, 35), m("Adyar", 13.0012, 80.2565, 16000, 40),
      m("Porur", 13.0382, 80.1565, 7000, 22), m("Tambaram", 12.9249, 80.1, 5500, 17),
      m("T Nagar", 13.0418, 80.2341, 16000, 38),
    ],
    suggest: ["OMR", "Perungudi", "Thoraipakkam", "Mylapore", "Pallavaram"],
  },
  {
    slug: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, depositMonths: [2, 3],
    markets: [
      m("Salt Lake", 22.5867, 88.4171, 9000, 24), m("New Town", 22.592, 88.4847, 6000, 18),
      m("Rajarhat", 22.62, 88.45, 5000, 15), m("Behala", 22.498, 88.31, 5500, 15),
      m("Garia", 22.463, 88.388, 5000, 14), m("Ballygunge", 22.527, 88.365, 14000, 32),
    ],
    suggest: ["EM Bypass", "Tollygunge", "Dum Dum", "Howrah"],
  },
  {
    slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, depositMonths: [2, 3],
    markets: [
      m("Satellite", 23.03, 72.517, 6500, 18), m("Bopal", 23.033, 72.465, 5000, 14),
      m("Prahlad Nagar", 23.012, 72.51, 7000, 20), m("Vastrapur", 23.039, 72.529, 7000, 19),
      m("Thaltej", 23.05, 72.505, 7500, 20), m("Gota", 23.1, 72.54, 4500, 12),
      m("Chandkheda", 23.11, 72.59, 4200, 12), m("Shela", 23.0, 72.46, 4500, 13),
    ],
    suggest: ["SG Highway", "Maninagar", "Navrangpura", "South Bopal"],
  },
  {
    slug: "vadodara", name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, depositMonths: [2, 3],
    markets: [
      m("Vasna-Bhayli Road", 22.296, 73.135, 4200, 13), m("Gotri", 22.315, 73.14, 4500, 14),
      m("Sevasi", 22.32, 73.115, 4000, 12), m("Alkapuri", 22.31, 73.17, 6500, 18),
      m("Akota", 22.295, 73.165, 5500, 16), m("Manjalpur", 22.265, 73.19, 3800, 11),
      m("Sama", 22.34, 73.19, 3800, 11), m("New VIP Road", 22.33, 73.21, 3600, 11),
    ],
    suggest: ["Old Padra Road", "Karelibaug", "Waghodia Road", "Gorwa", "Harni", "Atladra"],
  },
  {
    slug: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, depositMonths: [2, 3],
    markets: [
      m("Malviya Nagar", 26.853, 75.805, 6000, 15), m("Vaishali Nagar", 26.911, 75.743, 6000, 15),
      m("Mansarovar", 26.859, 75.764, 4800, 12), m("Jagatpura", 26.825, 75.855, 4200, 11),
      m("C Scheme", 26.91, 75.8, 9000, 20),
    ],
    suggest: ["Tonk Road", "Ajmer Road", "Raja Park"],
  },
  {
    slug: "kochi", name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, depositMonths: [3, 6],
    markets: [
      m("Kakkanad", 10.0159, 76.3419, 5500, 16), m("Edappally", 10.0261, 76.3125, 6500, 18),
      m("Kaloor", 9.997, 76.299, 7000, 18), m("Vyttila", 9.968, 76.318, 6000, 16),
      m("Palarivattom", 10.004, 76.309, 6500, 17),
    ],
    suggest: ["Marine Drive", "Aluva", "Fort Kochi"],
  },
  // Cities open for listings without seeded market data.
  { slug: "thane", name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, depositMonths: [3, 5], markets: [], suggest: ["Ghodbunder Road", "Majiwada", "Kolshet Road", "Hiranandani Estate", "Naupada"] },
  { slug: "navi-mumbai", name: "Navi Mumbai", state: "Maharashtra", lat: 19.033, lng: 73.0297, depositMonths: [3, 5], markets: [], suggest: ["Kharghar", "Vashi", "Nerul", "Belapur", "Airoli", "Ulwe"] },
  { slug: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, depositMonths: [2, 3], markets: [], suggest: ["Adajan", "Vesu", "Pal", "Piplod", "Athwa", "Katargam"] },
  { slug: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538, depositMonths: [2, 3], markets: [], suggest: ["Indirapuram", "Vaishali", "Raj Nagar Extension", "Crossings Republik"] },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, depositMonths: [2, 3], markets: [], suggest: ["Gomti Nagar", "Indira Nagar", "Aliganj", "Hazratganj"] },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, depositMonths: [2, 3], markets: [], suggest: ["Sector 22", "Sector 35", "Sector 44", "Manimajra"] },
  { slug: "mohali", name: "Mohali", state: "Punjab", lat: 30.7046, lng: 76.7179, depositMonths: [2, 3], markets: [], suggest: ["Sector 70", "Kharar", "Aerocity", "Zirakpur"] },
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, depositMonths: [2, 3], markets: [], suggest: ["Vijay Nagar", "Palasia", "Nipania", "Bhawarkua"] },
  { slug: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, depositMonths: [2, 3], markets: [], suggest: ["Arera Colony", "MP Nagar", "Kolar Road"] },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, depositMonths: [2, 3], markets: [], suggest: ["Dharampeth", "Manish Nagar", "Wardha Road", "Civil Lines"] },
  { slug: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, depositMonths: [3, 5], markets: [], suggest: ["RS Puram", "Saravanampatti", "Peelamedu", "Gandhipuram"] },
  { slug: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, depositMonths: [2, 3], markets: [], suggest: ["Patia", "Chandrasekharpur", "Saheed Nagar"] },
  { slug: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, depositMonths: [2, 3], markets: [], suggest: ["MVP Colony", "Madhurawada", "Gajuwaka"] },
  { slug: "guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, depositMonths: [2, 3], markets: [], suggest: ["Beltola", "Six Mile", "Zoo Road", "Ganeshguri"] },
  { slug: "patna", name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, depositMonths: [2, 3], markets: [], suggest: ["Boring Road", "Kankarbagh", "Bailey Road"] },
  { slug: "dehradun", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, depositMonths: [2, 3], markets: [], suggest: ["Rajpur Road", "Sahastradhara Road", "Prem Nagar"] },
  { slug: "goa", name: "Goa", state: "Goa", lat: 15.4909, lng: 73.8278, depositMonths: [2, 3], markets: [], suggest: ["Panaji", "Porvorim", "Margao", "Mapusa"] },
];

export const CITY_BY_SLUG = Object.fromEntries(CITIES.map((c) => [c.slug, c])) as Record<string, City>;
export const CITY_BY_NAME = Object.fromEntries(CITIES.map((c) => [c.name.toLowerCase(), c])) as Record<string, City>;
export const STATES = [...new Set(CITIES.map((c) => c.state))].sort();

export function localityNames(city: City) {
  return [...city.markets.map((x) => x.name), ...(city.suggest ?? [])];
}

export function findMarket(citySlug: string, locality: string) {
  const c = CITY_BY_SLUG[citySlug];
  return c?.markets.find((x) => x.name.toLowerCase() === locality.toLowerCase());
}

export function normalizeLocality(citySlug: string, raw: string) {
  const clean = raw.replace(/\s+/g, " ").trim().slice(0, 60);
  const c = CITY_BY_SLUG[citySlug];
  return (c && localityNames(c).find((l) => l.toLowerCase() === clean.toLowerCase())) || clean;
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
