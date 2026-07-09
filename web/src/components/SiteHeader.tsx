import Link from 'next/link';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';

/**
 * Floating capsule header (2026-07-09 correction). Previous version was
 * a full-width bordered bar flush against the top edge - the user
 * pointed at a reference screenshot (a rounded, detached, frosted pill
 * sitting with margin on every side) and asked for that shape instead.
 *
 * This is still NOT a layout clone of that reference site - only the
 * "floating pill nav" language is borrowed, same as the rest of this
 * redesign. Structure: a `fixed` (not `sticky`) wrapper with top/side
 * margin so the pill never touches the viewport edge, containing a
 * `rounded-full` bar with the frosted-glass background. Page content
 * gets top padding in the layout to sit below the floating pill instead
 * of behind it.
 */
export function SiteHeader() {
  return (
    <header className="fixed top-4 inset-x-3 sm:inset-x-6 lg:inset-x-10 z-30">
      <div className="nav-glass rounded-full border border-border shadow-lg shadow-black/5 px-4 sm:px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <Logo className="w-8 h-8" />
          <span className="hidden sm:inline">AgroLease</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm">
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
            className="hidden sm:inline-flex rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            Join Waitlist
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
