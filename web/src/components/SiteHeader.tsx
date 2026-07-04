import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-md bg-brand-green flex items-center justify-center text-white text-sm"
          >
            A
          </span>
          AgroLease
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          <Link href="/prices" className="hover:text-brand-green-light transition-colors">
            Prices
          </Link>
          <Link href="/early-access" className="hover:text-brand-green-light transition-colors">
            Early Access
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
