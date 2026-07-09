'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero (2026-07-09 correction). Previous version had a single static
 * headline block sitting on the image. The user pointed at a reference
 * screenshot and asked for a floating, cycling glass card instead -
 * i.e. the text card itself rotates through a short sequence of
 * headline/sub-line pairs on a timer, with a frosted-glass background
 * (blur + translucency), rather than one fixed sentence.
 *
 * Still full-bleed hero.png as a fixed background - only the copy inside
 * the glass card cycles, the image does not move. Respects
 * prefers-reduced-motion by disabling the auto-cycle (first slide stays
 * put) - same accessibility stance as <ScrollReveal>.
 */
const SLIDES = [
  {
    headline: 'The Operating System for Agricultural Partnerships.',
    subline: 'Secure your relationship with partners.',
  },
  {
    headline: 'Every Harvest, Verified.',
    subline: 'Tamper-evident records both sides can trust.',
  },
  {
    headline: 'Know the Market Price. Every Time.',
    subline: 'Real reference prices, updated regularly, in your currency.',
  },
];

const CYCLE_MS = 5000;

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time platform check on mount, same pattern as ScrollReveal
    setReducedMotion(prefersReduced);
    if (prefersReduced) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[reducedMotion ? 0 : index];

  return (
    <section className="relative w-full h-[92vh] min-h-[560px] overflow-hidden">
      <Image
        src="/images/hero.png"
        alt="Aerial view of farmland with AgroLease plot-boundary overlays"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Gradient scrim so the floating card stays legible over any part
          of the photo, without flattening the image into a solid tint. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#1b2a1e]/80 via-[#1b2a1e]/25 to-[#1b2a1e]/10"
      />

      <div className="relative z-10 h-full w-full flex flex-col items-start justify-end px-4 sm:px-8 lg:px-12 pb-16 sm:pb-24">
        {/* Frosted-glass floating card - the piece that cycles. Fixed
            min-height across slides so the card doesn't visibly resize
            as headline length changes between slides. */}
        <div className="max-w-2xl rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl px-6 sm:px-9 py-8 sm:py-10 shadow-2xl shadow-black/20 min-h-[220px] sm:min-h-[240px] flex flex-col justify-center">
          <h1
            key={slide.headline}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#f6f1e4] animate-[heroFade_0.6s_ease]"
          >
            {slide.headline}
          </h1>
          <p
            key={slide.subline}
            className="mt-5 text-base sm:text-lg text-[#f6f1e4]/85 max-w-xl animate-[heroFade_0.6s_ease]"
          >
            {slide.subline}
          </p>

          {/* Slide indicator dots - lets a visitor see it's a rotating set,
              not a single sentence, and gives a manual jump control. */}
          <div className="mt-6 flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.headline}
                type="button"
                aria-label={`Show headline ${i + 1} of ${SLIDES.length}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-[#f6f1e4]' : 'w-1.5 bg-[#f6f1e4]/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
          <Link
            href="/early-access"
            className="w-full sm:w-auto text-center rounded-full bg-brand-accent px-7 py-3.5 font-semibold text-white hover:brightness-110 transition-all"
          >
            Join Waitlist
          </Link>
          <Link
            href="/prices"
            className="w-full sm:w-auto text-center rounded-full border border-[#f6f1e4]/50 bg-[#f6f1e4]/10 px-7 py-3.5 font-semibold text-[#f6f1e4] backdrop-blur-sm hover:bg-[#f6f1e4]/20 transition-colors"
          >
            View Live Commodity Prices
          </Link>
        </div>
      </div>
    </section>
  );
}
