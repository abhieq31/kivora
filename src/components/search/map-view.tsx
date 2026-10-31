"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { CardListing, Pin } from "@/lib/types";
import { listingPrice, pinLabel } from "@/lib/format";

export const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTR = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type Bounds = { n: number; s: number; e: number; w: number };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function MapView({
  pins, center, zoom, hoverId, details, fitKey, onMove, onPinHover,
}: {
  pins: Pin[];
  center: [number, number];
  zoom: number;
  hoverId: number | null;
  details: Record<number, CardListing>;
  /** Changes when a new search (not a map move) should re-fit the map to the results. */
  fitKey: string;
  onMove?: (b: Bounds) => void;
  onPinHover?: (id: number | null) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const markers = useRef(new Map<number, Leaflet.Marker>());
  const programmatic = useRef(false);
  const lastFit = useRef<string | null>(null);
  const onMoveRef = useRef(onMove);
  const onHoverRef = useRef(onPinHover);
  const [ready, setReady] = useState(false);
  const densityRef = useRef<() => void>(() => {});

  useEffect(() => {
    onMoveRef.current = onMove;
    onHoverRef.current = onPinHover;
  });

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(el.current, { zoomControl: false, preferCanvas: false }).setView(center, zoom);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
      // Price pills when few homes are in view, dots when crowded.
      const density = () => {
        const b = map.getBounds();
        let n = 0;
        layerRef.current?.eachLayer((l) => { if ((l as Leaflet.Marker).getLatLng && b.contains((l as Leaflet.Marker).getLatLng())) n++; });
        el.current?.classList.toggle("kv-dense", n > 70);
      };
      map.on("zoomend moveend", density);
      densityRef.current = density;
      layerRef.current = L.layerGroup().addTo(map);
      map.on("moveend", () => {
        if (programmatic.current) {
          programmatic.current = false;
          return;
        }
        const b = map.getBounds();
        onMoveRef.current?.({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() });
      });
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The map is created once; later center/zoom changes go through fitKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    markers.current.clear();
    for (const p of pins) {
      const cls = `${p.listing_type === "rent" ? "rent" : ""} ${p.status === "active" ? "" : "closed"}`;
      const icon = L.divIcon({ className: "", html: `<div class="kv-pin ${cls}">${pinLabel(p.price)}</div>`, iconSize: [0, 0] });
      const mk = L.marker([p.lat, p.lng], { icon, riseOnHover: true });
      const d = details[p.id];
      const href = `/property/${p.id}`;
      mk.bindPopup(
        d
          ? `<a href="${href}" style="display:block;width:220px;color:inherit;text-decoration:none">
               <img src="${esc(d.photos[0] ?? "")}" style="width:100%;height:120px;object-fit:cover;border-radius:8px" alt=""/>
               <div style="font-weight:700;font-size:16px;margin-top:6px">${esc(listingPrice(d.price, d.listing_type))}</div>
               <div style="font-size:12px">${d.bhk ? d.bhk + " BHK · " : ""}${d.carpet_sqft.toLocaleString("en-IN")} sq ft</div>
               <div style="font-size:12px;color:#64748b">${esc(d.locality)}</div></a>`
          : `<a href="${href}" style="font-weight:700">${esc(listingPrice(p.price, p.listing_type))} — view home</a>`,
        { closeButton: false, offset: [0, -18] },
      );
      mk.on("mouseover", () => onHoverRef.current?.(p.id));
      mk.on("mouseout", () => onHoverRef.current?.(null));
      mk.addTo(layer);
      markers.current.set(p.id, mk);
    }
    if (lastFit.current !== fitKey) {
      lastFit.current = fitKey;
      if (pins.length) {
        const b = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
        programmatic.current = true;
        map.fitBounds(b.pad(0.08), { maxZoom: 15, animate: false });
      } else {
        programmatic.current = true;
        map.setView(center, zoom, { animate: false });
      }
    }
    densityRef.current();
  }, [pins, ready, fitKey, details, center, zoom]);

  useEffect(() => {
    for (const [id, mk] of markers.current) {
      const node = mk.getElement()?.firstElementChild;
      if (!node) continue;
      node.classList.toggle("hot", id === hoverId);
      if (id === hoverId) mk.setZIndexOffset(1000);
      else mk.setZIndexOffset(0);
    }
  }, [hoverId, pins]);

  return <div ref={el} className="h-full w-full bg-[#e8eef3]" />;
}
