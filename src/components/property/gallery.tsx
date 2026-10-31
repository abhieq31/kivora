"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = photos.length ? photos : ["/img/demo/tower/1.svg"];
  const next = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + list.length) % list.length)), [list.length]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next(1);
      if (e.key === "ArrowLeft") next(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next]);

  /* eslint-disable @next/next/no-img-element */
  return (
    <>
      <div className="relative grid h-[260px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-xl sm:h-[420px]">
        <button className={`col-span-4 row-span-2 ${list.length >= 5 ? "sm:col-span-2" : ""}`} onClick={() => setOpen(0)}>
          <img src={list[0]} alt={alt} className="h-full w-full object-cover" />
        </button>
        {list.length >= 5 && list.slice(1, 5).map((p, i) => (
          <button key={p + i} className="hidden sm:block" onClick={() => setOpen(i + 1)}>
            <img src={p} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
        <button onClick={() => setOpen(0)} className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow">
          <Grid2x2 className="h-4 w-4" /> See all {list.length} photos
        </button>
      </div>
      {open != null && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-black/95" role="dialog" aria-modal aria-label="Photos">
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">{open + 1} / {list.length}</span>
            <button onClick={() => setOpen(null)} aria-label="Close"><X className="h-7 w-7" /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
            <img src={list[open]} alt={alt} className="max-h-full max-w-full rounded object-contain" />
            <button onClick={() => next(-1)} className="absolute left-3 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Previous photo"><ChevronLeft className="h-7 w-7" /></button>
            <button onClick={() => next(1)} className="absolute right-3 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Next photo"><ChevronRight className="h-7 w-7" /></button>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto p-4">
            {list.map((p, i) => (
              <button key={p + i} onClick={() => setOpen(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded ${i === open ? "ring-2 ring-white" : "opacity-60"}`}>
                <img src={p} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
