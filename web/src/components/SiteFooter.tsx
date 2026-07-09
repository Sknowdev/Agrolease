import Link from 'next/link';
import { SocialLinks } from './SocialLinks';

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SocialLinks />
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/70">
            {/*
             * "Live Prices" and "The Platform" are repeated here so pricing
             * stays reachable from anywhere on the site - the same
             * persistent pattern as a "Contact Us" link - rather than being
             * something only the homepage exposes. Per redesign direction:
             * the site is about AgroLease, and pricing is a click-through
             * destination, not the dominant homepage focus.
             */}
            <Link href="/prices" className="hover:text-brand-green-light transition-colors">
              Live Prices
            </Link>
            <Link href="/platform" className="hover:text-brand-green-light transition-colors">
              The Platform
            </Link>
            <Link href="/about" className="hover:text-brand-green-light transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-brand-green-light transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-green-light transition-colors">
              Terms
            </Link>
            {/* No real LinkedIn company page exists yet - not linking a
                guessed URL. Add this back once the page is live. */}
          </nav>
        </div>
        <p className="text-sm text-foreground/60 text-center sm:text-left">
          &copy; {new Date().getFullYear()} AgroLease. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
