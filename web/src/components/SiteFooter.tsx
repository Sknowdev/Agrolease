import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} AgroLease. All rights reserved.</p>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/about" className="hover:text-brand-green-light transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-brand-green-light transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-brand-green-light transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-brand-green-light transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
