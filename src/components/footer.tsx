import Link from "next/link";
import { CITIES } from "@/lib/geo";
import { LogoMark } from "./logo";

const COLS: [string, [string, string][]][] = [
  ["Buy & rent", [["/buy", "Homes for sale"], ["/rent", "Homes for rent"], ["/sold", "Recently sold"], ["/new-projects", "New projects"], ["/research", "Market trends"]]],
  ["Sell & own", [["/sell", "Sell your home"], ["/post-property", "Post a property"], ["/home-value", "Home value estimate"], ["/landlords", "Rental manager"], ["/agents", "Find an agent"]]],
  ["Tools", [["/home-loans", "Home loan EMI"], ["/home-loans/affordability", "Affordability"], ["/calculators/stamp-duty", "Stamp duty"], ["/calculators/rent-vs-buy", "Rent vs buy"], ["/land-records", "Check land records (7/12, Khatauni…)"], ["/services", "Rent agreement & title check"]]],
  ["Company", [["/about", "About Nakshly"], ["/about#data", "Data & methodology"], ["/invite", "Invite & earn"], ["/terms", "Terms"], ["/privacy", "Privacy"]]],
];

export function Footer() {
  const top = CITIES.filter((c) => c.markets.length);
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <LogoMark className="h-9 w-9" />
            <p className="mt-3 text-sm text-muted">
              Find, value, buy, sell and rent homes across India with transparent prices and published fees.
            </p>
          </div>
          {COLS.map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-sm font-semibold">{title}</p>
              <ul className="space-y-2 text-sm text-muted">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-ink">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-line pt-6">
          <p className="mb-2 text-sm font-semibold">Popular cities</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {top.map((c) => (
              <span key={c.slug} className="flex gap-2">
                <Link href={`/buy/${c.slug}`} className="hover:text-ink">Flats for sale in {c.name}</Link>
                <span>·</span>
                <Link href={`/rent/${c.slug}`} className="hover:text-ink">Rent in {c.name}</Link>
              </span>
            ))}
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">
          © Nakshly. Listings marked “Demo” and all estimates built from demo data are illustrative.
          Nakshly Estimate is not an appraisal. Verify RERA registration at your state RERA portal.
        </p>
      </div>
    </footer>
  );
}
