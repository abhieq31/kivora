import Link from "next/link";
import { Suspense } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileMenu, UserMenu } from "./header-client";

export const NAV = [
  { href: "/buy", label: "Buy" },
  { href: "/rent", label: "Rent" },
  { href: "/sell", label: "Sell" },
  { href: "/home-loans", label: "Home loans" },
  { href: "/agents", label: "Find an agent" },
  { href: "/new-projects", label: "New projects" },
];
export const NAV_RIGHT = [
  { href: "/land-records", label: "Land records" },
  { href: "/landlords", label: "Manage rentals" },
  { href: "/agreements", label: "Rent agreement" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4">
        <MobileMenu items={[...NAV, ...NAV_RIGHT, { href: "/home-value", label: "Home value estimate" }]} />
        <Link href="/" aria-label="Nakshly home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 text-[15px] font-medium lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-[15px] font-medium">
          {NAV_RIGHT.map((n) => (
            <Link key={n.href} href={n.href} className="hidden hover:text-brand xl:block">
              {n.label}
            </Link>
          ))}
          <Suspense fallback={<span className="h-9 w-20" />}>
            <Account />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function Account() {
  const u = await getUser();
  if (!u) {
    return (
      <Link href="/login" className="rounded-lg px-3 py-2 text-brand hover:bg-brand-soft">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Link href="/saved" className="rounded-full p-2 hover:bg-paper" aria-label="Saved homes">
        <Heart className="h-5 w-5" />
      </Link>
      <Link href="/inbox" className="rounded-full p-2 hover:bg-paper" aria-label="Inbox">
        <MessageSquare className="h-5 w-5" />
      </Link>
      <UserMenu name={u.name} email={u.email} role={u.role} />
    </div>
  );
}
