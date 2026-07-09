import Link from 'next/link';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';

/**
 * Full-width header (2026-07 redesign). Previous version constrained its
 * inner row to max-w-6xl the same as every content section, which is
 * exactly the "everything sits in the middle of the screen, doesn't take
 * the whole width" complaint - fixed by letting the row stretch the full
 * viewport with generous side padding instead of a centered max-width
 * column. The hamburger button is always rendered (not conditionally
 * hidden by a CSS bug) - only the desktop <nav> links collapse under
 * `md:hidden`, and <MobileMenu>'s own trigger button has no such
 * constraint, so it's visible at every breakpoint where the nav links
 * are hidden.
 */
export function SiteHeader() {
  return (
    <header className="nav-glass border-b border-border sticky top-0 z-30">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-[4.5rem] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <Logo className="w-8 h-8" />
          AgroLease
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/prices" className="text-foreground/70 hover:text-foreground transition-colors">
            Live Prices
          </Link>
          <Link href="/platform" className="text-foreground/70 hover:text-foreground transition-colors">
            The Platform
          </Link>
          <Link href="/#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">
            The Process
          </Link>
          <Link href="/#faq-heading" className="text-foreground/70 hover:text-foreground transition-colors">
            Questions
          </Link>
          <Link href="/about" className="text-foreground/70 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/early-access"
            className="hidden sm:inline-flex rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            Join Waitlist
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
