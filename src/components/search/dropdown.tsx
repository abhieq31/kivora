"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function Dropdown({ label, active, children, align = "left", width = "w-72" }: { label: React.ReactNode; active?: boolean; children: (close: () => void) => React.ReactNode; align?: "left" | "right"; width?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={`chip whitespace-nowrap ${active ? "chip-on" : ""}`} aria-expanded={open}>
        {label} <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className={`absolute top-full z-[1250] mt-2 ${width} rounded-xl border border-line bg-white p-4 shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
