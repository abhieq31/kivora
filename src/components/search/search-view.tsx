"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, List, Map as MapIcon } from "lucide-react";
import type { CardListing, Mode, Pin, SearchParams } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { searchPath, toQuery } from "@/lib/search-params";
import { saveSearch } from "@/lib/actions/homes";
import { PropertyCard } from "../property-card";
import { LocationSearch } from "../location-search";
import { Dropdown } from "./dropdown";
import { MapView, type Bounds } from "./map-view";

const BUY_PRICES = [10e5, 20e5, 30e5, 50e5, 75e5, 1e7, 1.5e7, 2e7, 3e7, 5e7, 1e8];
const RENT_PRICES = [5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000];
const PAGE_SIZE = 24;

type Results = { total: number; items: CardListing[]; pins: Pin[]; saved: number[] };

export function SearchView({
  initialParams, initial, cityName, center, zoom,
}: {
  initialParams: SearchParams;
  initial: Results;
  cityName: string | null;
  center: [number, number];
  zoom: number;
}) {
  const router = useRouter();
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [res, setRes] = useState<Results>(initial);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [moveSearch, setMoveSearch] = useState(true);
  const [fitKey, setFitKey] = useState(() => JSON.stringify({ ...initialParams, bounds: undefined, page: undefined }));
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [, start] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);
  const first = useRef(true);

  const run = useCallback(async (p: SearchParams) => {
    const id = ++reqId.current;
    setLoading(true);
    const qs = toQuery(p);
    const r = await fetch(`/api/search?mode=${p.mode}${p.city ? `&city=${p.city}` : ""}${qs ? `&${qs}` : ""}`);
    if (id !== reqId.current) return;
    if (r.ok) setRes(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    start(() => router.replace(searchPath(params), { scroll: false }));
    run(params);
  }, [params, router, run]);

  // Filter changes re-fit the map; map moves don't.
  const update = (patch: Partial<SearchParams>, refit = true) => {
    setParams((p) => {
      const next = { ...p, ...patch, page: patch.page ?? 1 };
      if (refit) {
        next.bounds = undefined;
        setFitKey(JSON.stringify({ ...next, bounds: undefined, page: undefined }));
      }
      return next;
    });
    if (!patch.page) listRef.current?.scrollTo({ top: 0 });
  };

  const onMove = useCallback((b: Bounds) => {
    if (!moveSearch) return;
    setParams((p) => ({ ...p, bounds: b, page: 1 }));
  }, [moveSearch]);

  const details = useMemo(() => Object.fromEntries(res.items.map((i) => [i.id, i])), [res.items]);
  const savedSet = useMemo(() => new Set(res.saved), [res.saved]);
  const prices = params.mode === "rent" ? RENT_PRICES : BUY_PRICES;
  const fmtP = (n: number) => (params.mode === "rent" ? (n >= 1e5 ? priceLabel(n) : `₹${n / 1000}K`) : priceLabel(n));
  const priceText = params.minPrice || params.maxPrice
    ? `${params.minPrice ? fmtP(params.minPrice) : "Any"} – ${params.maxPrice ? fmtP(params.maxPrice) : "Any"}`
    : "Price";
  const moreCount = [params.furnishing, params.possession, params.postedBy, params.minSqft, params.maxSqft, params.tenant, params.verified].filter(Boolean).length;
  const title = `${cityName ?? "India"} ${params.mode === "rent" ? "homes for rent" : params.mode === "sold" ? "recently sold homes" : "homes for sale"}${params.q ? ` in ${params.q}` : ""}`;
  const pages = Math.ceil(res.total / PAGE_SIZE);

  const onSaveSearch = async () => {
    const r = await saveSearch(title, searchPath({ ...params, page: undefined }));
    if (r.login) router.push(`/login?next=${encodeURIComponent(searchPath(params))}`);
    else if (r.ok) {
      setSavedMsg("Search saved. Find it under Saved.");
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-4 py-2">
        <div className="w-full sm:w-72">
          <LocationSearch mode={params.mode} size="sm" defaultValue={params.q ?? cityName ?? ""} />
        </div>
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
          <Dropdown label={params.mode === "rent" ? "For rent" : params.mode === "sold" ? "Sold" : "For sale"} active width="w-56">
            {(close) => (
              <div className="space-y-1">
                {(["buy", "rent", "sold"] as Mode[]).map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-paper">
                    <input type="radio" name="mode" checked={params.mode === m} onChange={() => { close(); router.push(searchPath({ mode: m, city: params.city, q: params.q })); }} />
                    {m === "buy" ? "For sale" : m === "rent" ? "For rent" : "Sold"}
                  </label>
                ))}
              </div>
            )}
          </Dropdown>
          <Dropdown label={priceText} active={!!(params.minPrice || params.maxPrice)}>
            {(close) => (
              <div>
                <p className="mb-2 text-sm font-semibold">{params.mode === "rent" ? "Monthly rent" : "Price"}</p>
                <div className="flex gap-2">
                  <select className="input" value={params.minPrice ?? ""} onChange={(e) => update({ minPrice: Number(e.target.value) || undefined })} aria-label="Minimum price">
                    <option value="">No min</option>
                    {prices.map((p) => <option key={p} value={p}>{fmtP(p)}</option>)}
                  </select>
                  <select className="input" value={params.maxPrice ?? ""} onChange={(e) => update({ maxPrice: Number(e.target.value) || undefined })} aria-label="Maximum price">
                    <option value="">No max</option>
                    {prices.map((p) => <option key={p} value={p}>{fmtP(p)}</option>)}
                  </select>
                </div>
                <button className="btn mt-3 w-full" onClick={close}>Done</button>
              </div>
            )}
          </Dropdown>
          <Dropdown label={params.beds ? `${params.beds}+ BHK` : "BHK"} active={!!(params.beds || params.baths)}>
            {(close) => (
              <div>
                <p className="mb-2 text-sm font-semibold">Bedrooms (BHK)</p>
                <div className="flex overflow-hidden rounded-lg border border-line">
                  {[0, 1, 2, 3, 4, 5].map((b) => (
                    <button key={b} onClick={() => update({ beds: b || undefined })} className={`flex-1 py-2 text-sm ${(params.beds ?? 0) === b ? "bg-brand text-white" : "hover:bg-paper"} border-r border-line last:border-0`}>
                      {b ? `${b}+` : "Any"}
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-4 text-sm font-semibold">Bathrooms</p>
                <div className="flex overflow-hidden rounded-lg border border-line">
                  {[0, 1, 2, 3, 4].map((b) => (
                    <button key={b} onClick={() => update({ baths: b || undefined })} className={`flex-1 py-2 text-sm ${(params.baths ?? 0) === b ? "bg-brand text-white" : "hover:bg-paper"} border-r border-line last:border-0`}>
                      {b ? `${b}+` : "Any"}
                    </button>
                  ))}
                </div>
                <button className="btn mt-3 w-full" onClick={close}>Done</button>
              </div>
            )}
          </Dropdown>
          <Dropdown label={params.types?.length ? `Home type (${params.types.length})` : "Home type"} active={!!params.types?.length}>
            {() => (
              <div className="space-y-1">
                {Object.entries(PROPERTY_TYPES).filter(([k]) => !(params.mode === "rent" && k === "plot")).map(([k, v]) => {
                  const on = params.types?.includes(k) ?? false;
                  return (
                    <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-paper">
                      <input type="checkbox" checked={on} onChange={() => {
                        const set = new Set(params.types ?? []);
                        if (on) set.delete(k); else set.add(k);
                        update({ types: set.size ? [...set] : undefined });
                      }} />
                      {v}
                    </label>
                  );
                })}
              </div>
            )}
          </Dropdown>
          <Dropdown label={moreCount ? `More (${moreCount})` : "More"} active={moreCount > 0} align="right" width="w-80">
            {(close) => (
              <div className="space-y-3 text-sm">
                <label className="block"><span className="label">Furnishing</span>
                  <select className="input" value={params.furnishing ?? ""} onChange={(e) => update({ furnishing: e.target.value || undefined })}>
                    <option value="">Any</option><option value="unfurnished">Unfurnished</option><option value="semi">Semi-furnished</option><option value="full">Fully furnished</option>
                  </select>
                </label>
                {params.mode !== "rent" && (
                  <label className="block"><span className="label">Possession</span>
                    <select className="input" value={params.possession ?? ""} onChange={(e) => update({ possession: e.target.value || undefined })}>
                      <option value="">Any</option><option value="ready">Ready to move</option><option value="under_construction">Under construction</option>
                    </select>
                  </label>
                )}
                {params.mode === "rent" && (
                  <label className="block"><span className="label">Tenant type</span>
                    <select className="input" value={params.tenant ?? ""} onChange={(e) => update({ tenant: e.target.value || undefined })}>
                      <option value="">Any</option><option value="family">Family</option><option value="bachelors">Bachelors</option><option value="women">Women</option>
                    </select>
                  </label>
                )}
                <label className="block"><span className="label">Listed by</span>
                  <select className="input" value={params.postedBy ?? ""} onChange={(e) => update({ postedBy: e.target.value || undefined })}>
                    <option value="">Anyone</option><option value="owner">Owner (no brokerage)</option><option value="agent">Agent</option><option value="builder">Builder</option>
                  </select>
                </label>
                <div><span className="label">Carpet area (sq ft)</span>
                  <div className="flex gap-2">
                    <input className="input" inputMode="numeric" placeholder="Min" defaultValue={params.minSqft ?? ""} onBlur={(e) => update({ minSqft: Number(e.target.value) || undefined })} />
                    <input className="input" inputMode="numeric" placeholder="Max" defaultValue={params.maxSqft ?? ""} onBlur={(e) => update({ maxSqft: Number(e.target.value) || undefined })} />
                  </div>
                </div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!params.verified} onChange={(e) => update({ verified: e.target.checked || undefined })} /> Verified listings only</label>
                <div className="flex gap-2 pt-1">
                  <button className="btn-ghost flex-1" onClick={() => update({ furnishing: undefined, possession: undefined, postedBy: undefined, minSqft: undefined, maxSqft: undefined, tenant: undefined, verified: undefined })}>Reset</button>
                  <button className="btn flex-1" onClick={close}>Done</button>
                </div>
              </div>
            )}
          </Dropdown>
          <button onClick={onSaveSearch} className="btn whitespace-nowrap py-1.5"><Bell className="h-4 w-4" /> Save search</button>
        </div>
        {savedMsg && <span className="text-sm text-good">{savedMsg}</span>}
      </div>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1">
        <div className={`${mobileView === "map" ? "block" : "hidden"} absolute inset-0 md:relative md:block md:w-[52%] lg:w-[56%]`}>
          <MapView pins={res.pins} center={center} zoom={zoom} hoverId={hover} details={details} fitKey={fitKey} onMove={onMove} onPinHover={setHover} />
          <label className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow">
            <input type="checkbox" checked={moveSearch} onChange={(e) => setMoveSearch(e.target.checked)} /> Search as I move the map
          </label>
          {loading && <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs text-white">Loading…</div>}
        </div>
        <div ref={listRef} className={`${mobileView === "list" ? "block" : "hidden"} w-full overflow-y-auto md:block md:w-[48%] lg:w-[44%]`}>
          <div className="px-4 pb-16 pt-3">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span>{res.total.toLocaleString("en-IN")} {res.total === 1 ? "result" : "results"}{params.bounds ? " in this map area" : ""}</span>
              <label className="flex items-center gap-1">Sort:
                <select className="rounded-md border-0 bg-transparent font-semibold text-brand outline-none" value={params.sort ?? ""} onChange={(e) => update({ sort: e.target.value || undefined }, false)}>
                  <option value="">Recommended</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price (low to high)</option>
                  <option value="price_desc">Price (high to low)</option>
                  <option value="sqft_desc">Carpet area</option>
                  <option value="ppsf_asc">Price per sq ft</option>
                </select>
              </label>
            </div>
            {res.items.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-line p-8 text-center">
                <p className="font-semibold">No matching homes</p>
                <p className="mt-1 text-sm text-muted">Try zooming out, moving the map or removing some filters.</p>
                <button className="btn-outline mt-4" onClick={() => update({ minPrice: undefined, maxPrice: undefined, beds: undefined, baths: undefined, types: undefined, furnishing: undefined, possession: undefined, postedBy: undefined, minSqft: undefined, maxSqft: undefined, tenant: undefined, verified: undefined, q: undefined })}>Clear filters</button>
              </div>
            ) : (
              <div className={`mt-3 grid gap-4 sm:grid-cols-2 ${loading ? "opacity-60" : ""}`}>
                {res.items.map((l) => <PropertyCard key={l.id} l={l} saved={savedSet.has(l.id)} onHover={setHover} compact />)}
              </div>
            )}
            {pages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pages">
                <button className="btn-ghost" disabled={(params.page ?? 1) <= 1} onClick={() => { update({ page: (params.page ?? 1) - 1 }, false); listRef.current?.scrollTo({ top: 0 }); }}>Previous</button>
                <span className="text-sm text-muted">Page {params.page ?? 1} of {pages}</span>
                <button className="btn-ghost" disabled={(params.page ?? 1) >= pages} onClick={() => { update({ page: (params.page ?? 1) + 1 }, false); listRef.current?.scrollTo({ top: 0 }); }}>Next</button>
              </nav>
            )}
            <p className="mt-8 text-xs text-muted">Listings marked Demo are illustrative sample data. Prices shown are asking prices; registered transaction values may differ.</p>
          </div>
        </div>
        <button
          onClick={() => setMobileView((v) => (v === "list" ? "map" : "list"))}
          className="fixed bottom-5 left-1/2 z-[600] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg md:hidden"
        >
          {mobileView === "list" ? <><MapIcon className="h-4 w-4" /> Map</> : <><List className="h-4 w-4" /> List</>}
        </button>
      </div>
    </div>
  );
}
