import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  return (
    <header className="nav-glass border-b border-border sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-md bg-brand-green flex items-center justify-center text-white text-sm"
          >
            A
          </span>
          AgroLease
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/#conduit" className="text-foreground/70 hover:text-foreground transition-colors">
            Conduit
          </Link>
          <Link href="/#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/#security" className="text-foreground/70 hover:text-foreground transition-colors">
            Security
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#early-access"
            className="hidden sm:inline-flex rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-light transition-colors"
          >
            Get Started
          </Link>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
