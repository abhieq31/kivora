import { NextResponse, type NextRequest } from "next/server";
import { CITIES } from "@/lib/geo";
import { db } from "@/lib/db";

export type Suggestion = { type: "city" | "locality" | "project"; label: string; sub: string; city: string; q?: string; id?: number };

export async function GET(req: NextRequest) {
  const term = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 60);
  if (term.length < 2) return NextResponse.json([]);
  const out: Suggestion[] = [];
  for (const c of CITIES) {
    if (c.name.toLowerCase().startsWith(term) || c.slug.startsWith(term)) out.push({ type: "city", label: c.name, sub: c.state, city: c.slug });
  }
  for (const c of CITIES) {
    for (const l of [...c.markets.map((m) => m.name), ...(c.suggest ?? [])]) {
      if (l.toLowerCase().includes(term)) out.push({ type: "locality", label: l, sub: c.name, city: c.slug, q: l });
    }
  }
  const q = await db();
  const projects = await q<{ id: number; name: string; city: string; locality: string }>(
    "select id, name, city, locality from projects where name ilike $1 limit 4",
    [`%${term}%`],
  );
  for (const p of projects) out.push({ type: "project", label: p.name, sub: `${p.locality}`, city: p.city, id: p.id });
  // Localities typed in by users that aren't in our list.
  const extra = await q<{ city: string; locality: string }>(
    "select distinct city, locality from properties where locality ilike $1 limit 8",
    [`%${term}%`],
  );
  for (const e of extra) {
    if (!out.some((o) => o.type === "locality" && o.label.toLowerCase() === e.locality.toLowerCase() && o.city === e.city)) {
      out.push({ type: "locality", label: e.locality, sub: CITIES.find((c) => c.slug === e.city)?.name ?? e.city, city: e.city, q: e.locality });
    }
  }
  return NextResponse.json(out.slice(0, 10));
}
