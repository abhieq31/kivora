"use client";

import { useId, useState } from "react";
import { CITIES, CITY_BY_SLUG, localityNames } from "@/lib/geo";

const SORTED = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

export function CityLocality({ city: c0 = "", locality: l0 = "", onlyMarkets = false }: { city?: string; locality?: string; onlyMarkets?: boolean }) {
  const [city, setCity] = useState(c0);
  const id = useId();
  const c = CITY_BY_SLUG[city];
  const cities = onlyMarkets ? SORTED.filter((x) => x.markets.length) : SORTED;
  return (
    <>
      <label className="block">
        <span className="label">City</span>
        <select name="city" className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
          <option value="">Choose a city</option>
          {cities.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="label">Locality</span>
        <input name="locality" className="input" list={id} defaultValue={l0} required minLength={2} placeholder={c ? `e.g. ${localityNames(c)[0]}` : "Choose a city first"} disabled={!c} />
        <datalist id={id}>{c && localityNames(c).map((l) => <option key={l} value={l} />)}</datalist>
      </label>
    </>
  );
}
