// Turns the ad an owner already wrote for OLX, Facebook or a WhatsApp group into a listing draft,
// so moving to Nakshly takes one paste. Only fills fields it is confident about.
import { CITIES, CITY_BY_SLUG, localityNames } from "./geo";
import { parseAmount } from "./format";

export type ParsedAd = Partial<{
  listing_type: "sale" | "rent";
  property_type: string;
  bhk: number;
  price: number;
  deposit: number;
  carpet_sqft: number;
  furnishing: "full" | "semi" | "unfurnished";
  floor: number;
  total_floors: number;
  tenant_pref: string;
  negotiable: boolean;
  city: string;
  locality: string;
  society: string;
  description: string;
}>;

const AMOUNT = /(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|l|k|thousand)?\b/gi;

function amounts(text: string) {
  const out: { value: number; explicit: boolean; index: number }[] = [];
  for (const m of text.matchAll(AMOUNT)) {
    const after = text.slice(m.index! + m[0].length, m.index! + m[0].length + 12).toLowerCase();
    if (/^\s*(sq|sft|square|bhk|bed|rk|floor|st\b|nd\b|rd\b|th\b|yrs?|years?|km|min|mins|minutes)/.test(after)) continue;
    const unit = (m[2] ?? "").toLowerCase().replace("thousand", "k");
    const v = parseAmount(`${m[1]}${unit.replace(/s$/, "").replace("lac", "l")}`);
    if (!v) continue;
    out.push({ value: v, explicit: !!unit || /₹|rs|inr/i.test(m[0]), index: m.index! });
  }
  return out;
}

export function parseAd(raw: string, citySlug?: string): ParsedAd {
  const text = raw.replace(/\s+/g, " ").trim();
  const t = text.toLowerCase();
  const ad: ParsedAd = { description: raw.trim().slice(0, 3000) };

  const bhk = t.match(/(\d)\s*\.?\s*bhk/) ?? t.match(/(\d)\s*(?:bed ?rooms?|beds?)\b/);
  if (bhk) ad.bhk = Number(bhk[1]);
  else if (/\b1\s*rk\b/.test(t)) ad.bhk = 1;

  if (/\bvilla\b/.test(t)) ad.property_type = "villa";
  else if (/\b(bungalow|independent house|row ?house|tenement|duplex house)\b/.test(t)) ad.property_type = "independent_house";
  else if (/\bbuilder floor\b/.test(t)) ad.property_type = "builder_floor";
  else if (/\b(plot|land|na plot)\b/.test(t) && !ad.bhk) ad.property_type = "plot";
  else if (ad.bhk || /\b(flat|apartment)\b/.test(t)) ad.property_type = "apartment";

  if (/\b(fully|full)[ -]?furnished\b/.test(t)) ad.furnishing = "full";
  else if (/\bsemi[ -]?furnished\b/.test(t)) ad.furnishing = "semi";
  else if (/\bun-?furnished\b/.test(t)) ad.furnishing = "unfurnished";

  const sq = t.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*(?:sq\.?\s*ft|sqft|sft|square feet|sq\.? feet)/);
  if (sq) ad.carpet_sqft = Number(sq[1].replace(/,/g, ""));

  if (/\bground floor\b/.test(t)) ad.floor = 0;
  else {
    const fl = t.match(/(\d+)(?:st|nd|rd|th)?\s*floor/);
    if (fl) ad.floor = Number(fl[1]);
  }
  const of = t.match(/(?:floor\s*)?\d+\s*(?:\/|of|out of)\s*(\d+)\s*(?:floors?)?/);
  if (of && /floor/.test(of[0])) ad.total_floors = Number(of[1]);

  if (/\bbachelors?\b/.test(t)) ad.tenant_pref = "bachelors";
  else if (/\bfamily only\b|\bonly family\b|\bfamil(y|ies)\b/.test(t)) ad.tenant_pref = "family";
  if (/\bnegotiable\b/.test(t)) ad.negotiable = true;

  const rentWords = /\b(rent|rental|to[ -]?let|on rent|per month|\/\s*month|p\.?m\.?|monthly)\b/.test(t);
  const saleWords = /\b(sale|sell|selling|resale|ownership)\b/.test(t);

  const dep = t.match(/deposit[^\d₹]{0,15}((?:₹|rs\.?)?\s*[\d,.]+\s*(?:k|l|lakhs?|lacs?|thousand)?)/);
  if (dep) {
    const d = amounts(dep[1])[0];
    if (d) ad.deposit = d.value;
  }
  const depIndex = dep ? t.indexOf(dep[0]) : -1;
  const cands = amounts(text).filter((a) => a.value >= 1000 && (depIndex < 0 || a.index < depIndex || a.index > depIndex + dep![0].length));
  const best = cands.filter((a) => a.explicit).sort((a, b) => b.value - a.value)[0] ?? cands.sort((a, b) => b.value - a.value)[0];
  if (best) ad.price = best.value;

  ad.listing_type = rentWords && !saleWords ? "rent" : saleWords && !rentWords ? "sale" : ad.price != null ? (ad.price >= 500_000 ? "sale" : "rent") : rentWords ? "rent" : undefined;

  const city = citySlug ? CITY_BY_SLUG[citySlug] : CITIES.find((c) => t.includes(c.name.toLowerCase()));
  if (city) {
    ad.city = city.slug;
    const loc = localityNames(city).sort((a, b) => b.length - a.length).find((l) => t.includes(l.toLowerCase()));
    if (loc) ad.locality = loc;
  }
  return ad;
}
