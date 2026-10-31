import { NextResponse, type NextRequest } from "next/server";
import { estimateFor } from "@/lib/queries/properties";
import { CITY_BY_SLUG, findMarket } from "@/lib/geo";

/** Price suggestion for the listing wizard and the home value tool. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const city = sp.get("city") ?? "";
  const c = CITY_BY_SLUG[city];
  if (!c) return NextResponse.json({ error: "city" }, { status: 400 });
  const locality = sp.get("locality") ?? "";
  const mk = findMarket(city, locality);
  const lat = Number(sp.get("lat")) || mk?.lat || c.lat;
  const lng = Number(sp.get("lng")) || mk?.lng || c.lng;
  const carpet = Number(sp.get("sqft"));
  if (!(carpet > 100)) return NextResponse.json({ error: "sqft" }, { status: 400 });
  const kind = sp.get("kind") === "rent" ? "rent" : "sale";
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : null);
  const est = await estimateFor(kind, {
    city, locality, lat, lng, propertyType: sp.get("type") ?? "apartment", bhk: num("bhk") ?? 2, carpetSqft: carpet,
    floor: num("floor"), totalFloors: num("total"), ageYears: num("age"), furnishing: sp.get("furnishing"), facing: sp.get("facing"), coveredParking: num("parking"),
  });
  return NextResponse.json(est ? { value: est.value, low: est.low, high: est.high, confidence: est.confidence, comps: est.compsUsed } : null);
}
