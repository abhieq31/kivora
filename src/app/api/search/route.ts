import { NextResponse, type NextRequest } from "next/server";
import { searchProperties } from "@/lib/queries/properties";
import { parseSearch } from "@/lib/search-params";
import { CITY_BY_SLUG } from "@/lib/geo";
import { getUser } from "@/lib/auth";
import { savedIds } from "@/lib/queries/user";
import type { Mode } from "@/lib/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = (["buy", "rent", "sold"].includes(sp.get("mode") ?? "") ? sp.get("mode") : "buy") as Mode;
  const city = sp.get("city") && CITY_BY_SLUG[sp.get("city")!] ? sp.get("city")! : undefined;
  const params = parseSearch(mode, city, sp);
  const [res, user] = await Promise.all([searchProperties(params), getUser()]);
  const saved = await savedIds(user?.id);
  return NextResponse.json({ ...res, saved: [...saved].filter((id) => res.items.some((i) => i.id === id)) });
}
