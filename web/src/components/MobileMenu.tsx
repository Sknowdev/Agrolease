'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/#live-prices', label: 'Live Prices' },
  { href: '/#conduit', label: 'Conduit' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#security', label: 'Security' },
  { href: '/#early-access', label: 'Get Started' },
];

/**
 * A real mobile nav, replacing the previous pattern where the header's
 * links simply vanished under `md:hidden` with nothing to replace them
 * (the "shrinks in the middle" issue on small screens). Full-screen
 * overlay, closes on link click or the close button.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8"
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
        </div>
      )}
    </>
  );
}
