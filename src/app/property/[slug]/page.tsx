import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BadgeCheck, Bath, BedDouble, Building, CalendarClock, Car, Compass, Eye, Layers, Ruler, Sofa, TrendingDown, TrendingUp } from "lucide-react";
import { getProperty, nearbyClosed, priceHistory, propertyEstimates, recordView, similarHomes, type PropertyDetail } from "@/lib/queries/properties";
import { trend } from "@/lib/queries/market";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedIds } from "@/lib/queries/user";
import { CITY_BY_SLUG } from "@/lib/geo";
import { FURNISHING_LABEL, PROPERTY_TYPES, TENANT_LABEL } from "@/lib/types";
import { fmtDate, inr, listingPrice, pct, priceLabel, sqft, timeAgo } from "@/lib/format";
import { EstimateBlock } from "@/components/property/estimate-block";
import { Gallery } from "@/components/property/gallery";
import { ContactPanel } from "@/components/property/contact-panel";
import { RentCosts, SaleCosts } from "@/components/property/cost-calculator";
import { PointMap } from "@/components/property/point-map";
import { ApplyButton, ShareButton, WhatsAppButton } from "@/components/property/actions-bar";
import { RecordsCheck } from "@/components/property/records-check";
import { SaveButton } from "@/components/save-button";
import { PropertyCard, propertyHref } from "@/components/property-card";
import { LineChart, monthLabel } from "@/components/line-chart";
import { Footer } from "@/components/footer";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

const idOf = (slug: string) => Number(slug.split("-")[0]);

function title(p: Pick<PropertyDetail, "bhk" | "property_type" | "listing_type" | "locality" | "city">) {
  const city = CITY_BY_SLUG[p.city]?.name ?? p.city;
  return `${p.bhk ? `${p.bhk} BHK ` : ""}${PROPERTY_TYPES[p.property_type] ?? "Home"} for ${p.listing_type === "sale" ? "sale" : "rent"} in ${p.locality}, ${city}`;
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  await connection();
  const p = await getProperty(idOf((await params).slug));
  if (!p) return { title: "Home not found" };
  return {
    title: `${title(p)} — ${listingPrice(p.price, p.listing_type)}`,
    description: p.description.slice(0, 160),
  };
}

export default function Page(props: Props) {
  return (
    <>
      <Suspense fallback={<div className="mx-auto h-[600px] max-w-7xl animate-pulse rounded-xl bg-paper px-4" />}>
        <Detail {...props} />
      </Suspense>
      <Footer />
    </>
  );
}

async function Detail({ params, searchParams }: Props) {
  await connection();
  const { slug } = await params;
  const id = idOf(slug);
  if (!Number.isInteger(id)) notFound();
  const p = await getProperty(id);
  if (!p) notFound();
  const sp = await searchParams;
  const user = await getUser();
  const q = await db();
  const [history, est, similar, closed, saleTrend, rentTrend, saved, applied] = await Promise.all([
    priceHistory(id),
    propertyEstimates(p),
    similarHomes(p),
    nearbyClosed(p),
    trend("sale", p.city, p.locality),
    trend("rent", p.city, p.locality),
    savedIds(user?.id),
    user ? q("select 1 from applications where property_id = $1 and user_id = $2", [id, user.id]) : Promise.resolve([]),
    recordView(id),
  ]);
  const city = CITY_BY_SLUG[p.city];
  const sale = p.listing_type === "sale";
  const mainEst = sale ? est.sale : est.rent;
  const isOwner = user?.id != null && user.id === p.owner_id;
  const who = p.posted_by === "agent" && p.agent
    ? { kind: "agent" as const, name: p.agent.name, sub: p.agent.agency, rating: p.agent.rating, reviews: p.agent.reviews, verified: p.agent.verified, agentId: p.agent.id }
    : p.posted_by === "builder"
      ? { kind: "builder" as const, name: p.project?.builder ?? "Builder" }
      : { kind: "owner" as const, name: p.owner_name ?? "Owner" };

  const facts: [React.ReactNode, string, string][] = [
    [<BedDouble key="i" className="h-5 w-5" />, "Bedrooms", p.bhk ? `${p.bhk} BHK` : "—"],
    [<Bath key="i" className="h-5 w-5" />, "Bathrooms", p.bathrooms ? String(p.bathrooms) : "—"],
    [<Ruler key="i" className="h-5 w-5" />, "Carpet area", sqft(p.carpet_sqft)],
    [<Layers key="i" className="h-5 w-5" />, "Floor", p.floor != null && p.total_floors ? `${p.floor === 0 ? "Ground" : p.floor} of ${p.total_floors}` : "—"],
    [<Compass key="i" className="h-5 w-5" />, "Facing", p.facing ? p.facing.replace(/^\w/, (c) => c.toUpperCase()) : "—"],
    [<Sofa key="i" className="h-5 w-5" />, "Furnishing", FURNISHING_LABEL[p.furnishing] ?? p.furnishing],
    [<Car key="i" className="h-5 w-5" />, "Parking", p.parking_covered + p.parking_open ? `${p.parking_covered} covered, ${p.parking_open} open` : "None"],
    [<CalendarClock key="i" className="h-5 w-5" />, sale ? "Age" : "Available", sale ? (p.possession === "under_construction" ? `Possession ${p.possession_date ? fmtDate(p.possession_date) : "TBA"}` : p.age_years != null ? `${p.age_years} yrs old` : "—") : p.available_from ? fmtDate(p.available_from) : "Now"],
  ];

  const ppsf = Math.round(p.price / p.carpet_sqft);
  const diff = mainEst ? (p.price - mainEst.value) / mainEst.value : null;

  return (
    <article className="mx-auto max-w-7xl px-4 pb-10 pt-4">
      {sp.posted && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your listing is live. <Link className="font-semibold underline" href={`/property/${p.id}/board`}>Print your {sale ? "For Sale" : "To-Let"} board with a QR code</Link> for your gate, share it on WhatsApp, or <Link className="underline" href="/my-listings">manage it from My listings</Link>.
        </p>
      )}
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href={`/${sale ? "buy" : "rent"}/${p.city}`} className="hover:underline">{city?.name ?? p.city}</Link> ›
        <Link href={`/${sale ? "buy" : "rent"}/${p.city}?q=${encodeURIComponent(p.locality)}`} className="hover:underline">{p.locality}</Link> ›
        <span>{p.society || PROPERTY_TYPES[p.property_type]}</span>
        <span className="ml-auto flex gap-2">
          <SaveButton id={p.id} initial={saved.has(p.id)} variant="button" />
          <WhatsAppButton text={`${title(p)} — ${listingPrice(p.price, p.listing_type)}${p.posted_by === "owner" ? " · direct from owner, no brokerage" : ""}`} />
          <ShareButton title={title(p)} />
        </span>
      </nav>

      <Gallery photos={p.photos} alt={title(p)} />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "active" ? (sale ? "bg-brand-soft text-brand-dark" : "bg-emerald-50 text-good") : "bg-slate-100 text-slate-700"}`}>
                ● {p.status === "active" ? (sale ? (p.possession === "under_construction" ? "New launch · For sale" : "For sale") : "For rent") : p.status === "sold" ? "Sold" : p.status === "rented" ? "Rented" : "Off market"}
              </span>
              {p.verified && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-good"><BadgeCheck className="h-3.5 w-3.5" /> Verified listing</span>}
              {p.posted_by === "owner" && (
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-accent">
                  Owner listing · you save ~{sale ? priceLabel(p.price * 0.01) : inr(p.price)} brokerage
                </span>
              )}
              {p.is_demo && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Demo data</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{listingPrice(p.price, p.listing_type)}</h1>
              <p className="pb-1 text-lg">
                {p.bhk > 0 && <><b>{p.bhk}</b> BHK · </>}
                {p.bathrooms > 0 && <><b>{p.bathrooms}</b> baths · </>}
                <b>{p.carpet_sqft.toLocaleString("en-IN")}</b> sq ft carpet
              </p>
            </div>
            <p className="mt-1 text-muted">{p.address}{p.pincode ? ` – ${p.pincode}` : ""}, {city?.name}</p>
            <p className="mt-1 text-sm text-muted">
              {sale && <>{inr(ppsf)}/sq ft carpet{p.super_sqft ? ` · ${sqft(p.super_sqft)} super built-up` : ""} · </>}
              {!sale && p.deposit ? <>Deposit {inr(p.deposit)} · </> : null}
              {p.maintenance_monthly ? <>Maintenance {inr(p.maintenance_monthly)}/mo · </> : null}
              {p.negotiable ? "Negotiable" : "Fixed price"}
            </p>
            {mainEst && (
              <a href="#estimate" className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
                <span className="font-semibold text-brand">Nakshly Estimate</span>
                <b>{listingPrice(mainEst.value, p.listing_type)}</b>
                {diff != null && Math.abs(diff) >= 0.02 && (
                  <span className={diff > 0 ? "text-bad" : "text-good"}>
                    · asking is {pct(Math.abs(diff), 0)} {diff > 0 ? "above" : "below"} estimate
                  </span>
                )}
                {!sale && est.sale && <span className="text-muted">· Est. value {priceLabel(est.sale.value)}</span>}
                {sale && est.rent && <span className="text-muted">· Rent estimate {inr(est.rent.value)}/mo</span>}
              </a>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <span>{timeAgo(p.created_at)} on Nakshly</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {p.views.toLocaleString("en-IN")} views</span>
              <span>{p.posted_by === "owner" ? "Posted by owner" : p.posted_by === "builder" ? "Posted by builder" : "Posted by agent"}</span>
            </div>
          </header>

          <section>
            <h2 className="h-section">Overview</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map(([icon, k, v]) => (
                <div key={k} className="rounded-xl border border-line p-3">
                  <div className="text-muted">{icon}</div>
                  <p className="mt-2 text-xs text-muted">{k}</p>
                  <p className="font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 whitespace-pre-line leading-relaxed">{p.description}</p>
          </section>

          <section>
            <h2 className="h-section">Facts & features</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
              <FactGroup title="Property" rows={[
                ["Type", PROPERTY_TYPES[p.property_type]],
                ["Carpet area", sqft(p.carpet_sqft)],
                ["Built-up area", sqft(p.builtup_sqft)],
                ["Super built-up area", sqft(p.super_sqft)],
                ["Balconies", String(p.balconies)],
                ["Ownership", p.ownership.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())],
              ]} />
              <FactGroup title={sale ? "Deal" : "Rental terms"} rows={sale ? [
                ["Price", priceLabel(p.price)],
                ["Price per sq ft", `${inr(ppsf)} (carpet)`],
                ["Possession", p.possession === "ready" ? "Ready to move" : `Under construction${p.possession_date ? `, ${fmtDate(p.possession_date)}` : ""}`],
                ["RERA registration", p.rera_id || (p.possession === "ready" ? "Not required (ready resale)" : "—")],
                ["Maintenance", p.maintenance_monthly ? `${inr(p.maintenance_monthly)}/month` : "—"],
                ["Project", p.project ? p.project.name : "—"],
              ] : [
                ["Monthly rent", inr(p.price)],
                ["Security deposit", p.deposit ? `${inr(p.deposit)} (${Math.round(p.deposit / p.price)} months)` : "—"],
                ["Maintenance", p.maintenance_monthly ? `${inr(p.maintenance_monthly)}/month` : "Included"],
                ["Preferred tenants", TENANT_LABEL[p.tenant_pref] ?? p.tenant_pref],
                ["Pets", p.pets_allowed ? "Allowed" : "Not allowed"],
                ["Available from", p.available_from ? fmtDate(p.available_from) : "Immediately"],
              ]} />
            </div>
            {p.amenities.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 font-semibold">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map((a) => <span key={a} className="rounded-full bg-paper px-3 py-1 text-sm">{a}</span>)}
                </div>
              </div>
            )}
            {p.project && (
              <Link href={`/new-projects/${p.project.id}`} className="mt-6 flex items-center gap-3 rounded-xl border border-line p-4 hover:border-brand">
                <Building className="h-6 w-6 text-brand" />
                <div><p className="font-semibold">{p.project.name}</p><p className="text-sm text-muted">by {p.project.builder} · RERA {p.project.rera_id}</p></div>
              </Link>
            )}
          </section>

          <section id="estimate" className="scroll-mt-20">
            <h2 className="h-section">Nakshly Estimate</h2>
            {mainEst ? <EstimateBlock est={mainEst} kind={p.listing_type} price={p.price} /> : <p className="mt-2 text-sm text-muted">Not enough nearby transactions to estimate this home yet.</p>}
            {(sale ? saleTrend : rentTrend).length > 2 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">{p.locality}: median {sale ? "price" : "rent"} per sq ft (carpet), last 24 months</p>
                <LineChart
                  series={[{ name: p.locality, color: "#3b3fd8", points: (sale ? saleTrend : rentTrend).map((t) => ({ x: t.month, y: t.ppsf })) }]}
                  format={(n) => (sale ? `₹${Math.round(n / 100) / 10}k` : `₹${Math.round(n)}`)}
                  xLabel={monthLabel}
                />
              </div>
            )}
          </section>

          <section>
            <h2 className="h-section">Price & listing history</h2>
            {history.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-line text-muted"><tr><th className="py-2">Date</th><th>Event</th><th>Price</th><th>Change</th></tr></thead>
                  <tbody>
                    {history.map((h, i) => {
                      const prev = history[i + 1];
                      const ch = prev ? (h.price - prev.price) / prev.price : null;
                      return (
                        <tr key={i} className="border-b border-line last:border-0">
                          <td className="py-2">{fmtDate(h.date)}</td>
                          <td className="capitalize">{h.event.replace("_", " ")}</td>
                          <td className="font-semibold">{listingPrice(h.price, p.listing_type)}</td>
                          <td className={ch == null ? "" : ch < 0 ? "text-good" : "text-bad"}>
                            {ch == null || Math.abs(ch) < 0.001 ? "—" : <span className="flex items-center gap-1">{ch < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}{pct(ch)}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-2 text-sm text-muted">No history yet.</p>}
          </section>

          <section>
            <h2 className="h-section">{sale ? "Monthly payment & purchase costs" : "What it costs to rent"}</h2>
            <div className="mt-4">
              {sale ? (
                <SaleCosts price={p.price} state={city?.state ?? ""} maintenance={p.maintenance_monthly} underConstruction={p.possession === "under_construction"} />
              ) : (
                <RentCosts rent={p.price} deposit={p.deposit} maintenance={p.maintenance_monthly} viaAgent={p.posted_by === "agent"} />
              )}
            </div>
            {sale && <Link href={`/home-loans?amount=${Math.round(p.price * 0.8)}`} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">Compare home loan offers →</Link>}
          </section>

          <RecordsCheck state={city?.state ?? ""} sale={sale} surveyNo={p.survey_no} />

          <section>
            <h2 className="h-section">Neighbourhood: {p.locality}</h2>
            <div className="mt-4"><PointMap lat={p.lat} lng={p.lng} label={listingPrice(p.price, p.listing_type).replace("/mo", "")} /></div>
            <p className="mt-2 text-xs text-muted">Pin shows the approximate location. Exact address is shared after you contact the {who.kind}.</p>
            {closed.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 font-semibold">Recent {sale ? "registered sales" : "signed rentals"} nearby</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="border-b border-line text-muted"><tr><th className="py-2">Date</th><th>Home</th><th>{sale ? "Price" : "Rent"}</th><th>Per sq ft</th></tr></thead>
                    <tbody>
                      {closed.map((c, i) => (
                        <tr key={i} className="border-b border-line last:border-0">
                          <td className="py-2">{fmtDate(c.date)}</td>
                          <td>{c.bhk ? `${c.bhk} BHK, ` : ""}{c.carpet_sqft.toLocaleString("en-IN")} sq ft · {c.locality}</td>
                          <td className="font-semibold">{listingPrice(c.price, p.listing_type)}</td>
                          <td>{inr(c.price / c.carpet_sqft)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Link href={`/research/${p.city}`} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">See {city?.name} market trends →</Link>
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="h-section">Similar homes nearby</h2>
              <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
                {similar.map((s) => (
                  <div key={s.id} className="w-72 shrink-0 snap-start"><PropertyCard l={s} saved={saved.has(s.id)} compact /></div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {isOwner ? (
            <div className="card p-5">
              <p className="font-semibold">This is your listing</p>
              <p className="mt-1 text-sm text-muted">{p.views} views so far.</p>
              <Link href={`/post-property?edit=${p.id}`} className="btn mt-4 w-full">Edit listing</Link>
              <Link href={`/property/${p.id}/board`} className="btn-outline mt-2 w-full">Print {sale ? "For Sale" : "To-Let"} board (QR)</Link>
              <Link href="/my-listings" className="btn-ghost mt-2 w-full">Manage leads & status</Link>
            </div>
          ) : p.status === "active" ? (
            <>
              <ContactPanel propertyId={p.id} who={who} rental={!sale} defaults={{ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" }} />
              {!sale && <ApplyButton propertyId={p.id} applied={applied.length > 0} />}
            </>
          ) : (
            <div className="card p-5">
              <p className="font-semibold">This home is {p.status.replace("_", " ")}.</p>
              <Link href={`/${sale ? "buy" : "rent"}/${p.city}?q=${encodeURIComponent(p.locality)}`} className="btn mt-4 w-full">See homes in {p.locality}</Link>
            </div>
          )}
          <Link href={`/home-value?city=${p.city}&locality=${encodeURIComponent(p.locality)}&bhk=${p.bhk}&sqft=${p.carpet_sqft}&type=${p.property_type}`} className="card block p-4 text-sm hover:border-brand">
            <p className="font-semibold">Own a similar home nearby?</p>
            <p className="text-muted">See what it&apos;s worth with a free Nakshly Estimate →</p>
          </Link>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Residence", name: title(p),
        address: { "@type": "PostalAddress", addressLocality: p.locality, addressRegion: city?.state, addressCountry: "IN" },
        geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
        url: propertyHref(p),
      }).replace(/</g, "\\u003c") }} />
    </article>
  );
}

function FactGroup({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v ?? "—"}</dd></div>
        ))}
      </dl>
    </div>
  );
}

