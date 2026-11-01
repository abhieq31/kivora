import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/geo";
import { db } from "@/lib/db";
import { propertyHref } from "@/components/property-card";
import { LAND_RECORDS } from "@/lib/land-records";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const statics = ["", "/buy", "/rent", "/sold", "/sell", "/home-value", "/home-loans", "/home-loans/affordability", "/calculators/stamp-duty", "/calculators/rent-vs-buy", "/agents", "/new-projects", "/research", "/landlords", "/about", "/land-records", "/agreements", "/agreements/check", "/renters-rights", "/services", "/list-free", "/societies", "/pros"];
  const cityPages = CITIES.flatMap((c) => [`/buy/${c.slug}`, `/rent/${c.slug}`, ...(c.markets.length ? [`/research/${c.slug}`] : [])]);
  const recordPages = LAND_RECORDS.map((r) => `/land-records/${r.slug}`);
  const q = await db();
  const props = await q<{ id: number; bhk: number; property_type: string; locality: string; city: string; updated_at: string }>(
    "select id, bhk, property_type, locality, city, updated_at from properties where status = 'active' order by updated_at desc limit 5000",
  );
  return [
    ...[...statics, ...cityPages, ...recordPages].map((p) => ({ url: base + p })),
    ...props.map((p) => ({ url: base + propertyHref(p), lastModified: new Date(p.updated_at) })),
  ];
}
