export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
      <path d="M16 5.5c-4.7 0-8.5 3.6-8.5 8.2 0 6 8.5 12.8 8.5 12.8s8.5-6.8 8.5-12.8c0-4.6-3.8-8.2-8.5-8.2Z" fill="#fff" />
      <path d="M11.8 15.2 16 11.6l4.2 3.6v4.3h-8.4Z" fill="var(--color-brand)" />
      <path d="M4 27.5h24" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2.5" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight text-ink">nakshly</span>
    </span>
  );
}
