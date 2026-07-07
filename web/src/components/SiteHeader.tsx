import Link from 'next/link';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  return (
    <header className="nav-glass border-b border-border sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Logo className="w-8 h-8" />
          AgroLease
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/#live-prices" className="text-foreground/70 hover:text-foreground transition-colors">
            Live Prices
          </Link>
          <Link href="/prices" className="text-foreground/70 hover:text-foreground transition-colors">
            All Countries
          </Link>
          <Link href="/#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/about" className="text-foreground/70 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/early-access"
            className="hidden sm:inline-flex rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
