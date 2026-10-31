"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { TILE_ATTR, TILE_URL } from "../search/map-view";

export function PointMap({ lat, lng, zoom = 15, label }: { lat: number; lng: number; zoom?: number; label?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: Leaflet.Map | null = null;
    let cancelled = false;
    import("leaflet").then((mod) => {
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([lat, lng], zoom);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
      L.circle([lat, lng], { radius: 250, color: "#3b3fd8", fillOpacity: 0.12, weight: 1 }).addTo(map);
      L.marker([lat, lng], { icon: L.divIcon({ className: "", html: `<div class="kv-pin">${label ?? "Here"}</div>`, iconSize: [0, 0] }) }).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, zoom, label]);
  return <div ref={el} className="h-72 w-full overflow-hidden rounded-xl bg-[#e8eef3]" />;
}
