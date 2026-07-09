'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { SocialLinks } from './SocialLinks';

const LINKS = [
  { href: '/prices', label: 'Live Prices' },
  { href: '/platform', label: 'The Platform' },
  { href: '/#how-it-works', label: 'The Process' },
  { href: '/#faq-heading', label: 'Questions' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/early-access', label: 'Join Waitlist' },
];

/**
 * A real mobile nav, replacing the previous pattern where the header's
 * links simply vanished under `md:hidden` with nothing to replace them.
 *
 * The overlay is rendered through a portal directly into `document.body`
 * rather than in place. This isn't cosmetic - it fixes a real bug: this
 * component's trigger button lives inside <SiteHeader>, which has a
 * `backdrop-filter` (the glass nav effect). In WebKit/Safari (the engine
 * behind every iOS browser), a `position: fixed` descendant of an
 * ancestor with `backdrop-filter`, `filter`, or `transform` gets pulled
 * into that ancestor's own compositing layer instead of the real
 * viewport - which is exactly what made the menu render see-through on
 * a real phone. Rendering it into `document.body` via a portal escapes
 * that containing block entirely.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portals can only target document.body after mount (it doesn't exist
    // during SSR) - this is the standard hydration-safe "mounted" flag
    // pattern, unavoidable on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists after mount
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 bg-background"
    >
      <button
        onClick={() => setOpen(false)}
        aria-label="Close menu"
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-border"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ✕
        </span>
      </button>

      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className="text-2xl font-semibold tracking-tight hover:text-brand-green-light transition-colors"
        >
          {link.label}
        </Link>
      ))}

      <div className="mt-6 pt-6 border-t border-border w-full max-w-xs">
        <SocialLinks />
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ☰
        </span>
      </button>

      {open && mounted && createPortal(overlay, document.body)}
    </>
  );
}
