// Indian number formatting: lakh (1,00,000) and crore (1,00,00,000).

const trim = (n: number, digits: number) => n.toFixed(digits).replace(/\.0+$|(\.\d*?)0+$/, "$1");

export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** ₹1.25 Cr, ₹85 L, ₹45,000 */
export function priceLabel(n: number) {
  if (n >= 1e7) return `₹${trim(n / 1e7, 2)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5, 2)} L`;
  return inr(n);
}

/** Compact label for map pins: 1.2Cr, 85L, 25K */
export function pinLabel(n: number) {
  if (n >= 1e7) return `₹${trim(n / 1e7, 1)}Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5, 0)}L`;
  if (n >= 1e3) return `₹${trim(n / 1e3, 0)}K`;
  return `₹${n}`;
}

export function listingPrice(price: number, kind: "sale" | "rent") {
  return kind === "rent" ? `${inr(price)}/mo` : priceLabel(price);
}

export function sqft(n: number | null | undefined) {
  return n ? `${Math.round(n).toLocaleString("en-IN")} sq ft` : "—";
}

export function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
  const days = Math.round(s / 86400);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} mo ago` : `${trim(months / 12, 1)} yr ago`;
}

export function fmtDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Parse "1.2 cr", "85 lakh", "85L", "45000", "45k" into rupees. */
export function parseAmount(raw: string): number | null {
  const s = raw.toLowerCase().replace(/[₹,\s]/g, "");
  const mt = s.match(/^(\d+(?:\.\d+)?)(cr|crore|crores|l|lac|lakh|lakhs|k)?$/);
  if (!mt) return null;
  const n = parseFloat(mt[1]);
  const unit = mt[2] ?? "";
  if (unit.startsWith("c")) return Math.round(n * 1e7);
  if (unit.startsWith("l")) return Math.round(n * 1e5);
  if (unit === "k") return Math.round(n * 1e3);
  return Math.round(n);
}
