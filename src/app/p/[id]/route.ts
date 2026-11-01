import { NextResponse } from "next/server";
import { getProperty } from "@/lib/queries/properties";
import { propertyHref } from "@/components/property-card";

/** Short link for QR codes and SMS: /p/123 → the full listing URL, keeping the utm tag. */
export async function GET(req: Request, { params }: RouteContext<"/p/[id]">) {
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await getProperty(id) : null;
  const url = new URL(req.url);
  const dest = new URL(p ? propertyHref(p) : "/", url.origin);
  dest.search = url.search;
  return NextResponse.redirect(dest, 302);
}
