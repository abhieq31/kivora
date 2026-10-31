import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { CardListing } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";
import { listingPrice, priceLabel, timeAgo, fmtDate } from "@/lib/format";
import { CITY_BY_SLUG } from "@/lib/geo";
import { SaveButton } from "./save-button";

export function propertyHref(l: Pick<CardListing, "id" | "bhk" | "property_type" | "locality" | "city">) {
  const slug = [l.bhk ? `${l.bhk}-bhk` : "", l.property_type.replace("_", "-"), l.locality, l.city]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/property/${l.id}-${slug}`;
}

export function statusBadge(l: CardListing) {
  if (l.status === "sold") return { text: `Sold${l.closed_on ? " " + fmtDate(l.closed_on) : ""}`, cls: "bg-slate-700 text-white" };
  if (l.status === "rented") return { text: "Rented", cls: "bg-slate-700 text-white" };
  if (l.possession === "under_construction") return { text: "New launch", cls: "bg-amber-400 text-ink" };
  const days = (Date.now() - new Date(l.created_at).getTime()) / 86400000;
  if (days < 3) return { text: `New · ${timeAgo(l.created_at)}`, cls: "bg-white text-ink" };
  if (l.price_cut && l.price_cut > 0) return { text: `Price cut ${l.listing_type === "rent" ? "₹" + l.price_cut.toLocaleString("en-IN") : priceLabel(l.price_cut)}`, cls: "bg-white text-bad" };
  if (l.posted_by === "owner") return { text: "By owner", cls: "bg-white text-ink" };
  return null;
}

export function PropertyCard({ l, saved = false, onHover, compact }: { l: CardListing; saved?: boolean; onHover?: (id: number | null) => void; compact?: boolean }) {
  const badge = statusBadge(l);
  const city = CITY_BY_SLUG[l.city]?.name ?? l.city;
  return (
    <Link
      href={propertyHref(l)}
      className="group block overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md"
      onMouseEnter={onHover ? () => onHover(l.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <div className={`relative ${compact ? "aspect-[16/10]" : "aspect-[3/2]"} overflow-hidden bg-paper`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.photos[0] ?? "/img/demo/tower/1.svg"} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {badge && <span className={`rounded-md px-2 py-1 text-xs font-semibold shadow-sm ${badge.cls}`}>{badge.text}</span>}
          {l.is_demo && <span className="rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">Demo</span>}
        </div>
        <div className="absolute right-2 top-2">
          <SaveButton id={l.id} initial={saved} />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold tracking-tight">{listingPrice(l.price, l.listing_type)}</p>
          {l.verified && <BadgeCheck className="h-4 w-4 text-good" aria-label="Verified" />}
        </div>
        <p className="mt-0.5 text-sm">
          {l.bhk > 0 && <><b>{l.bhk}</b> BHK · </>}
          {l.bathrooms > 0 && <><b>{l.bathrooms}</b> ba · </>}
          <b>{l.carpet_sqft.toLocaleString("en-IN")}</b> sq ft · {PROPERTY_TYPES[l.property_type] ?? l.property_type}
          {l.listing_type === "sale" ? " for sale" : " for rent"}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted">
          {l.society ? `${l.society}, ` : ""}{l.locality}, {city}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
          {l.posted_by === "owner" ? "Listed by owner" : l.posted_by === "builder" ? "Listed by builder" : "Listed by agent"}
        </p>
      </div>
    </Link>
  );
}
