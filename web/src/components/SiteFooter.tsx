import Link from 'next/link';

// NOTE: using "contact@agrolease.xyz" here (corrected from a likely typo
// in the source request, "contant@agrolease.xyz") since this is a live
// mailto link people will actually click - flag if a different address
// was intended.
const CONTACT_EMAIL = 'contact@agrolease.xyz';

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} AgroLease. All rights reserved.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/about" className="hover:text-brand-green-light transition-colors">
            About
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand-green-light transition-colors">
            Contact
          </a>
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
    </footer>
  );
}
