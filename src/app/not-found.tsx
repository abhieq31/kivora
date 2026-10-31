import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">The home may have been sold, rented or taken down.</p>
      <div className="mt-6 flex gap-3"><Link href="/buy" className="btn">Browse homes</Link><Link href="/" className="btn-ghost">Home</Link></div>
    </div>
  );
}
