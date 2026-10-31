"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Search } from "lucide-react";
import type { Suggestion } from "@/app/api/suggest/route";
import { CITIES } from "@/lib/geo";

/** Autocomplete over cities, localities and projects. Navigates to the search page for the chosen mode. */
export function LocationSearch({ mode, size = "lg", defaultValue = "", placeholder }: { mode: "buy" | "rent" | "sold"; size?: "lg" | "sm"; defaultValue?: string; placeholder?: string }) {
  const [term, setTerm] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (term.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: Suggestion[]) => { setItems(d); setActive(0); })
        .catch(() => {});
    }, 120);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [term]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (s?: Suggestion) => {
    setOpen(false);
    if (s?.type === "project") return router.push(`/new-projects/${s.id}`);
    if (s) return router.push(`/${mode}/${s.city}${s.q ? `?q=${encodeURIComponent(s.q)}` : ""}`);
    const t = term.trim().toLowerCase();
    const city = CITIES.find((c) => c.name.toLowerCase() === t || c.slug === t);
    router.push(city ? `/${mode}/${city.slug}` : `/${mode}${t ? `?q=${encodeURIComponent(term.trim())}` : ""}`);
  };

  const lg = size === "lg";
  const shown = term.trim().length >= 2 ? items : [];
  return (
    <div ref={box} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); go(open ? shown[active] : undefined); }}
        className={`flex items-center rounded-xl border border-line bg-white ${lg ? "h-14 pl-4 shadow-lg" : "h-10 pl-3"}`}
      >
        <input
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder ?? "Enter a city, locality or project"}
          className={`min-w-0 flex-1 bg-transparent outline-none ${lg ? "text-base" : "text-sm"}`}
          aria-label="Search location"
          role="combobox"
          aria-expanded={open && shown.length > 0}
          aria-controls="loc-suggest"
          aria-autocomplete="list"
        />
        <button type="submit" className={`grid place-items-center text-brand ${lg ? "h-14 w-14" : "h-10 w-10"}`} aria-label="Search">
          <Search className={lg ? "h-6 w-6" : "h-5 w-5"} />
        </button>
      </form>
      {open && shown.length > 0 && (
        <ul id="loc-suggest" role="listbox" className="absolute left-0 right-0 top-full z-[1300] mt-1 overflow-hidden rounded-xl border border-line bg-white text-left shadow-xl">
          {shown.map((s, i) => (
            <li key={`${s.type}-${s.label}-${s.city}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(s)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm ${i === active ? "bg-brand-soft" : ""}`}
              >
                {s.type === "project" ? <Building2 className="h-4 w-4 text-muted" /> : <MapPin className="h-4 w-4 text-muted" />}
                <span className="font-medium text-ink">{s.label}</span>
                <span className="text-muted">{s.sub}</span>
                <span className="ml-auto text-xs uppercase text-muted">{s.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
