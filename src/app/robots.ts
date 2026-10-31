import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/inbox", "/saved", "/my-listings", "/landlords/dashboard", "/renter-profile"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
