"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { TILE_ATTR, TILE_URL } from "../search/map-view";

/** Click (or drag the pin) to set a location. Re-centres when `center` changes. */
export function PinPicker({ value, center, onChange }: { value: [number, number] | null; center: [number, number]; onChange: (v: [number, number]) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const cb = useRef(onChange);
  const centerRef = useRef(center);
  useEffect(() => {
    cb.current = onChange;
    centerRef.current = center;
  });

  const place = (ll: [number, number]) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const icon = L.divIcon({ className: "", html: '<div class="kv-pin">Your home</div>', iconSize: [0, 0] });
    if (!markerRef.current) {
      markerRef.current = L.marker(ll, { draggable: true, icon }).addTo(map);
      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        cb.current([p.lat, p.lng]);
      });
    } else markerRef.current.setLatLng(ll);
  };

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      // Use the latest centre: the locality may have changed while Leaflet was loading.
      const map = L.map(el.current).setView(value ?? centerRef.current, value ? 16 : 14);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        const ll: [number, number] = [e.latlng.lat, e.latlng.lng];
        place(ll);
        cb.current(ll);
      });
      mapRef.current = map;
      if (value) place(value);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value) mapRef.current?.setView(center, 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);

  return <div ref={el} className="h-80 w-full overflow-hidden rounded-xl border border-line" />;
}
