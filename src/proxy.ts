import { NextResponse, type NextRequest } from "next/server";

/** Remember who invited this visitor (?ref=CODE) for 30 days so sign-up can credit them. */
export function proxy(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const res = NextResponse.next();
  if (ref && /^[a-z0-9]{4,12}$/.test(ref) && !req.cookies.has("nk_ref")) {
    res.cookies.set("nk_ref", ref, { maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = { matcher: ["/((?!api|_next|img|uploads|.*\\.).*)"] };
