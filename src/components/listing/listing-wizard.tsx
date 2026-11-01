"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Camera, Check, ImagePlus, Loader2, X } from "lucide-react";
import { preparePhoto, SHOT_LIST } from "@/lib/photo-quality";
import { parseAd } from "@/lib/ad-parse";
import { saveListing } from "@/lib/actions/listings";
import { CITIES, CITY_BY_SLUG, findMarket, localityNames } from "@/lib/geo";
import { AMENITIES, FACINGS } from "@/lib/constants";
import { inr, priceLabel } from "@/lib/format";
import { Field, Notice, Submit } from "../form-bits";

const PinPicker = dynamic(() => import("./pin-picker").then((m) => m.PinPicker), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-xl bg-paper" /> });

export type ListingDraft = Record<string, string | number | boolean | string[] | null | undefined>;

const STEPS = ["Basics", "Location", "Details", "Price", "Photos", "Review"];

export function ListingWizard({ initial, isAgent }: { initial?: ListingDraft; isAgent: boolean }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<ListingDraft>({
    listing_type: "sale", property_type: "apartment", posted_by: isAgent ? "agent" : "owner", city: "", locality: "", society: "",
    address: "", pincode: "", lat: null, lng: null, bhk: 2, bathrooms: 2, balconies: 1, carpet_sqft: "", builtup_sqft: "", super_sqft: "",
    floor: "", total_floors: "", facing: "east", furnishing: "semi", age_years: "", possession: "ready", possession_date: "", ownership: "freehold",
    rera_id: "", survey_no: "", parking_covered: 1, parking_open: 0, price: "", deposit: "", maintenance_monthly: "", negotiable: true, tenant_pref: "any",
    pets_allowed: false, available_from: "", amenities: [], photos: [], description: "",
    ...initial,
  });
  const [state, action] = useActionState(saveListing, null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState<Record<string, { score: number; issues: string[] }>>({});
  const [suggest, setSuggest] = useState<{ value: number; low: number; high: number; confidence: string } | null>(null);
  const set = (k: string, v: ListingDraft[string]) => setD((x) => ({ ...x, [k]: v }));

  const city = CITY_BY_SLUG[String(d.city)];
  const market = city ? findMarket(city.slug, String(d.locality)) : undefined;
  const center = useMemo<[number, number]>(() => (market ? [market.lat, market.lng] : city ? [city.lat, city.lng] : [21.5, 79]), [market, city]);
  const sale = d.listing_type === "sale";
  const plot = d.property_type === "plot";

  // Live price suggestion from the estimate model.
  useEffect(() => {
    if (!city || !Number(d.carpet_sqft) || plot) return;
    const t = setTimeout(() => {
      const qs = new URLSearchParams({
        kind: String(d.listing_type), city: city.slug, locality: String(d.locality), sqft: String(d.carpet_sqft), bhk: String(d.bhk), type: String(d.property_type),
        furnishing: String(d.furnishing), facing: String(d.facing), parking: String(d.parking_covered),
        ...(d.lat ? { lat: String(d.lat), lng: String(d.lng) } : {}),
        ...(d.floor !== "" ? { floor: String(d.floor) } : {}), ...(d.total_floors !== "" ? { total: String(d.total_floors) } : {}),
        ...(d.age_years !== "" ? { age: String(d.age_years) } : {}),
      });
      fetch(`/api/estimate?${qs}`).then((r) => r.json()).then(setSuggest).catch(() => setSuggest(null));
    }, 400);
    return () => clearTimeout(t);
  }, [city, d.listing_type, d.locality, d.carpet_sqft, d.bhk, d.property_type, d.furnishing, d.facing, d.parking_covered, d.lat, d.lng, d.floor, d.total_floors, d.age_years, plot]);

  const validate = (s: number): string | null => {
    if (s === 1) {
      if (!city) return "Pick a city";
      if (String(d.locality).trim().length < 2) return "Enter the locality";
      if (String(d.address).trim().length < 3) return "Enter the address";
      if (!d.lat) return "Click the map to drop a pin on your home";
    }
    if (s === 2) {
      if (!plot && !(Number(d.bhk) >= 1)) return "Choose BHK";
      if (!(Number(d.carpet_sqft) >= 100)) return "Enter carpet area in sq ft";
      if (d.floor !== "" && d.total_floors !== "" && Number(d.floor) > Number(d.total_floors)) return "Floor can't be above total floors";
      if (sale && d.possession === "under_construction" && !String(d.rera_id).trim()) return "Under-construction homes must show a RERA registration number";
    }
    if (s === 3 && !(Number(d.price) >= 1000)) return sale ? "Enter the asking price" : "Enter the monthly rent";
    return null;
  };
  const go = (to: number) => {
    if (to > step) {
      for (let s = step; s < to; s++) {
        const e = validate(s);
        if (e) return setErr(e);
      }
    }
    setErr(null);
    setStep(to);
    window.scrollTo({ top: 0 });
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    const checks: { score: number; issues: string[] }[] = [];
    try {
      for (const f of [...files].slice(0, 10)) {
        const c = await preparePhoto(f);
        if (c.score < 50) throw new Error(`${f.name}: ${c.issues.join("; ")}. Please retake it.`);
        checks.push({ score: c.score, issues: c.issues });
        fd.append("file", new File([c.blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
      }
    } catch (e) {
      setUploading(false);
      return setErr((e as Error).message);
    }
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json();
    setUploading(false);
    if (!r.ok) return setErr(j.error ?? "Upload failed");
    setQuality((q) => ({ ...q, ...Object.fromEntries((j.urls as string[]).map((u, i) => [u, checks[i]])) }));
    set("photos", [...(d.photos as string[]), ...j.urls].slice(0, 30));
  };

  const num = (k: string, label: string, opts: { hint?: string; min?: number; placeholder?: string } = {}) => (
    <Field label={label} hint={opts.hint}>
      <input className="input" inputMode="numeric" value={String(d[k] ?? "")} placeholder={opts.placeholder} onChange={(e) => set(k, e.target.value.replace(/[^\d.]/g, ""))} />
    </Field>
  );
  const choice = (k: string, options: [string | number, string][]) => (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <button type="button" key={String(v)} onClick={() => set(k, v)} className={`chip ${d[k] === v ? "chip-on" : ""}`}>{label}</button>
      ))}
    </div>
  );

  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => go(i)} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${i === step ? "bg-brand text-white" : i < step ? "bg-brand-soft text-brand-dark" : "bg-paper text-muted"}`}>
              {i < step ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>} {s}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-6">
          {!initial?.id && <AdImport onParsed={(ad) => setD((x) => ({ ...x, ...Object.fromEntries(Object.entries(ad).filter(([, v]) => v !== undefined).map(([k, v]) => [k, typeof v === "number" ? String(v) : v])) }))} city={String(d.city)} />}
          <div><p className="label">I want to</p>{choice("listing_type", [["sale", "Sell"], ["rent", "Rent out"]])}</div>
          <div><p className="label">Property type</p>{choice("property_type", [["apartment", "Apartment"], ["builder_floor", "Builder floor"], ["independent_house", "Independent house"], ["villa", "Villa"], ...(sale ? [["plot", "Plot / land"] as [string, string]] : [])])}</div>
          <div><p className="label">I am the</p>{choice("posted_by", [["owner", "Owner"], ...(isAgent ? [["agent", "Agent"] as [string, string]] : []), ["builder", "Builder"]])}
            {!isAgent && <p className="mt-2 text-xs text-muted">Agents: create an agent profile first to post as an agent.</p>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City">
            <select className="input" value={String(d.city)} onChange={(e) => { set("city", e.target.value); set("lat", null); set("lng", null); }}>
              <option value="">Choose a city</option>
              {[...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.slug} value={c.slug}>{c.name}, {c.state}</option>)}
            </select>
          </Field>
          <Field label="Locality">
            <input className="input" list="wiz-loc" value={String(d.locality)} onChange={(e) => set("locality", e.target.value)} disabled={!city} placeholder={city ? `e.g. ${localityNames(city)[0]}` : "Choose a city first"} />
            <datalist id="wiz-loc">{city && localityNames(city).map((l) => <option key={l} value={l} />)}</datalist>
          </Field>
          <Field label="Society / building name" hint="Optional for houses and plots"><input className="input" value={String(d.society)} onChange={(e) => set("society", e.target.value)} /></Field>
          <Field label="Pincode"><input className="input" inputMode="numeric" maxLength={6} value={String(d.pincode)} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="Address" className="sm:col-span-2" hint="Buyers see the society and locality; the full address is shared when you reply."><input className="input" value={String(d.address)} onChange={(e) => set("address", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <p className="label">Drop a pin on your home</p>
            {city ? <PinPicker value={d.lat ? [Number(d.lat), Number(d.lng)] : null} center={center} onChange={([la, ln]) => { set("lat", la); set("lng", ln); }} /> : <div className="grid h-40 place-items-center rounded-xl bg-paper text-sm text-muted">Choose a city to see the map</div>}
            {d.lat ? <p className="mt-1 text-xs text-muted">Pinned at {Number(d.lat).toFixed(5)}, {Number(d.lng).toFixed(5)} — drag the pin to adjust.</p> : null}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {!plot && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div><p className="label">BHK</p>{choice("bhk", [1, 2, 3, 4, 5].map((n) => [n, n === 5 ? "5+" : String(n)]))}</div>
              <div><p className="label">Bathrooms</p>{choice("bathrooms", [1, 2, 3, 4, 5].map((n) => [n, String(n)]))}</div>
              <div><p className="label">Balconies</p>{choice("balconies", [0, 1, 2, 3].map((n) => [n, String(n)]))}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {num("carpet_sqft", plot ? "Plot area (sq ft)" : "Carpet area (sq ft)", { hint: plot ? undefined : "Usable floor area inside walls (RERA definition)" })}
            {!plot && num("builtup_sqft", "Built-up area (sq ft)", { hint: "Optional" })}
            {d.property_type === "apartment" && num("super_sqft", "Super built-up area (sq ft)", { hint: "Optional; includes common areas" })}
            {!plot && num("floor", "Floor", { hint: "0 for ground" })}
            {!plot && num("total_floors", "Total floors")}
            {!plot && num("age_years", "Age of property (years)", { hint: "0 for new" })}
          </div>
          <Field label="Survey / CTS / Khasra no." hint="Optional. Shown with a link to your state's land record portal so buyers and tenants can verify you — listings with it get more serious enquiries.">
            <input className="input" value={String(d.survey_no ?? "")} onChange={(e) => set("survey_no", e.target.value)} maxLength={60} />
          </Field>
          <div><p className="label">Facing</p>{choice("facing", FACINGS.map((f) => [f, f.replace(/(^|-)\w/g, (c) => c.toUpperCase())]))}</div>
          {!plot && <div><p className="label">Furnishing</p>{choice("furnishing", [["unfurnished", "Unfurnished"], ["semi", "Semi-furnished"], ["full", "Fully furnished"]])}</div>}
          {sale && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3"><p className="label">Possession</p>{choice("possession", [["ready", "Ready to move"], ["under_construction", "Under construction"]])}</div>
              {d.possession === "under_construction" && <Field label="Expected possession"><input type="date" className="input" value={String(d.possession_date)} onChange={(e) => set("possession_date", e.target.value)} /></Field>}
              <Field label="RERA registration no." hint={d.possession === "under_construction" ? "Required for under-construction projects" : "If the project is RERA registered"}>
                <input className="input" value={String(d.rera_id)} onChange={(e) => set("rera_id", e.target.value)} />
              </Field>
              <Field label="Ownership">
                <select className="input" value={String(d.ownership)} onChange={(e) => set("ownership", e.target.value)}>
                  <option value="freehold">Freehold</option><option value="leasehold">Leasehold</option><option value="co-operative">Co-operative society</option><option value="power_of_attorney">Power of attorney</option>
                </select>
              </Field>
            </div>
          )}
          {!plot && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><p className="label">Covered parking</p>{choice("parking_covered", [0, 1, 2, 3].map((n) => [n, String(n)]))}</div>
              <div><p className="label">Open parking</p>{choice("parking_open", [0, 1, 2].map((n) => [n, String(n)]))}</div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={sale ? "Asking price (₹)" : "Monthly rent (₹)"} hint={Number(d.price) ? (sale ? priceLabel(Number(d.price)) : `${inr(Number(d.price))}/month`) : undefined}>
              <input className="input text-lg font-semibold" inputMode="numeric" value={String(d.price)} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} />
            </Field>
            {!sale && (
              <Field label="Security deposit (₹)" hint={city ? `Typical in ${city.name}: ${city.depositMonths[0]}–${city.depositMonths[1]} months` : undefined}>
                <input className="input" inputMode="numeric" value={String(d.deposit)} onChange={(e) => set("deposit", e.target.value.replace(/\D/g, ""))} />
              </Field>
            )}
            {!plot && num("maintenance_monthly", "Maintenance (₹/month)", { hint: "Society charges, if any" })}
          </div>
          {suggest && (
            <div className="rounded-xl bg-brand-soft p-4 text-sm">
              <p className="font-semibold text-brand-dark">Nakshly Estimate for a home like this: {sale ? priceLabel(suggest.value) : `${inr(suggest.value)}/mo`}</p>
              <p className="text-brand-dark/80">Range {sale ? priceLabel(suggest.low) : inr(suggest.low)} – {sale ? priceLabel(suggest.high) : inr(suggest.high)} · {suggest.confidence} confidence. Homes priced near the estimate get more enquiries.</p>
              <button type="button" className="mt-2 font-semibold text-brand underline" onClick={() => set("price", String(suggest.value))}>Use this price</button>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!d.negotiable} onChange={(e) => set("negotiable", e.target.checked)} /> Price is negotiable</label>
          {!sale && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><p className="label">Preferred tenants</p>{choice("tenant_pref", [["any", "Anyone"], ["family", "Family"], ["bachelors", "Bachelors"], ["women", "Women only"]])}</div>
              <Field label="Available from"><input type="date" className="input" value={String(d.available_from)} onChange={(e) => set("available_from", e.target.value)} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!d.pets_allowed} onChange={(e) => set("pets_allowed", e.target.checked)} /> Pets allowed</label>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div>
            <p className="label">Photos ({(d.photos as string[]).length}/30)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(d.photos as string[]).map((p, i) => (
                <div key={p} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white">Cover</span>}
                  {quality[p]?.issues.length ? <span title={quality[p].issues.join("\n")} className="absolute bottom-1 left-1 right-1 truncate rounded bg-amber-500/90 px-1.5 text-[11px] text-white">{quality[p].issues[0]}</span> : null}
                  <div className="absolute right-1 top-1 flex gap-1">
                    {i > 0 && <button type="button" onClick={() => { const a = [...(d.photos as string[])]; [a[0], a[i]] = [a[i], a[0]]; set("photos", a); }} className="rounded bg-white/90 px-1.5 text-xs">Make cover</button>}
                    <button type="button" aria-label="Remove photo" onClick={() => set("photos", (d.photos as string[]).filter((x) => x !== p))} className="rounded bg-white/90 p-0.5"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-sm text-muted hover:border-brand">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="flex flex-col items-center gap-1"><ImagePlus className="h-6 w-6" /> From gallery</span>}
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
              </label>
              <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-brand/40 bg-brand-soft/40 text-sm text-brand sm:hidden">
                <span className="flex flex-col items-center gap-1"><Camera className="h-6 w-6" /> Take photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">We straighten and resize each photo and flag blurry or dark shots before they go live. Homes with 8+ bright, landscape photos get far more enquiries.</p>
            <details className="mt-3 rounded-lg bg-paper p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Shot list for great photos</summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5">{SHOT_LIST.map(([t, tip]) => <li key={t}><b>{t}</b> — <span className="text-muted">{tip}</span></li>)}</ol>
              <p className="mt-2 text-muted">Clean and declutter first, shoot in daylight, phone held sideways at chest height. Or <a href="/services?for=photoshoot" className="font-semibold text-brand underline">book a pro photographer for ₹999</a>.</p>
            </details>
          </div>
          {!plot && (
            <div>
              <p className="label">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => {
                  const on = (d.amenities as string[]).includes(a);
                  return <button type="button" key={a} onClick={() => set("amenities", on ? (d.amenities as string[]).filter((x) => x !== a) : [...(d.amenities as string[]), a])} className={`chip ${on ? "chip-on" : ""}`}>{a}</button>;
                })}
              </div>
            </div>
          )}
          <Field label="Description" hint="What makes your home special? Mention nearby schools, metro, markets.">
            <textarea className="input" rows={5} maxLength={4000} value={String(d.description)} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 5 && (
        <form action={action} className="space-y-6">
          {Object.entries(d).map(([k, v]) =>
            Array.isArray(v)
              ? v.map((x) => <input key={k + x} type="hidden" name={`${k}[]`} value={x} />)
              : typeof v === "boolean"
                ? v && <input key={k} type="hidden" name={k} value="on" />
                : <input key={k} type="hidden" name={k} value={v == null ? "" : String(v)} />,
          )}
          <div className="card divide-y divide-line">
            {[
              ["Listing", `${sale ? "For sale" : "For rent"} · ${String(d.property_type).replace("_", " ")} · posted by ${d.posted_by}`],
              ["Location", `${d.society ? d.society + ", " : ""}${d.locality}, ${city?.name ?? ""}`],
              ["Home", `${plot ? "" : `${d.bhk} BHK · ${d.bathrooms} bath · `}${d.carpet_sqft} sq ft${d.floor !== "" ? ` · floor ${d.floor}/${d.total_floors}` : ""}`],
              ["Price", sale ? priceLabel(Number(d.price)) : `${inr(Number(d.price))}/mo${d.deposit ? `, deposit ${inr(Number(d.deposit))}` : ""}`],
              ["Photos", `${(d.photos as string[]).length} photo${(d.photos as string[]).length === 1 ? "" : "s"}`],
            ].map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm"><span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span></div>)}
          </div>
          <Notice state={state} />
          <div className="flex flex-wrap gap-3">
            <Submit className="btn px-6" pendingText="Publishing…">{d.id ? "Save changes" : "Publish listing"}</Submit>
            <button name="publish" value="draft" className="btn-ghost">Save as draft</button>
          </div>
          <p className="text-xs text-muted">By publishing you confirm you own this property or are authorised to list it, and that the details are accurate.</p>
        </form>
      )}

      {err && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      {step < 5 && (
        <div className="mt-8 flex justify-between border-t border-line pt-6">
          <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => go(step - 1)}>Back</button>
          <button type="button" className="btn px-6" onClick={() => go(step + 1)}>Continue</button>
        </div>
      )}
    </div>
  );
}

/** Paste an existing OLX / Facebook / WhatsApp ad to pre-fill the wizard. */
function AdImport({ onParsed, city }: { onParsed: (ad: ReturnType<typeof parseAd>) => void; city: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [filled, setFilled] = useState<number | null>(null);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-brand/50 bg-brand-soft/40 p-4 text-left text-sm">
        <b className="text-brand">Already advertised it on OLX, Facebook or WhatsApp?</b> Paste that ad and we&apos;ll fill in the form for you.
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="label">Paste your ad</p>
      <textarea rows={5} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 2BHK semi furnished flat for rent in Gotri, 3rd floor, 950 sq ft. Rent 15k, deposit 30k. Family only." />
      <div className="mt-2 flex items-center gap-3">
        <button type="button" className="btn-outline" disabled={text.trim().length < 10} onClick={() => {
          const ad = parseAd(text, city || undefined);
          onParsed(ad);
          setFilled(Object.values(ad).filter((v) => v !== undefined).length - 1);
        }}>Fill the form</button>
        {filled != null && <span className="text-sm text-good">Filled {filled} details — check each step before publishing.</span>}
      </div>
    </div>
  );
}
