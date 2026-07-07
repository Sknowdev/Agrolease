import Link from 'next/link';
import { SocialLinks } from './SocialLinks';

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SocialLinks />
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/70">
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
