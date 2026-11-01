"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="-ml-1 rounded p-1 lg:hidden" aria-label="Menu" onClick={() => setOpen(true)}>
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[1200] bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <nav className="h-full w-72 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button className="mb-4 rounded p-1" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-6 w-6" />
            </button>
            {items.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-paper">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

export function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  const links = [
    ["/saved", "Saved homes & searches"],
    ["/inbox", "Inbox"],
    ["/my-listings", "My listings"],
    ["/landlords/dashboard", "Rentals dashboard"],
    ["/renter-profile", "Renter profile"],
    ["/home-value/my-homes", "My home value"],
    ["/agreements", "Rent agreements"],
    ["/invite", "Invite & earn"],
    ["/agents/profile", role === "agent" ? "My agent profile" : "Become an agent"],
    ...(role === "admin" ? [["/admin", "Admin"]] : []),
  ];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white"
        aria-label="Account menu"
      >
        {name.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-64 rounded-xl border border-line bg-white p-2 shadow-lg">
          <div className="border-b border-line px-3 py-2">
            <p className="font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-paper">
              {label}
            </Link>
          ))}
          <form action={logout}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-bad hover:bg-paper">Sign out</button>
          </form>
        </div>
      )}
    </div>
  );
}
