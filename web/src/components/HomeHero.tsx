'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero (2026-07-10 correction). Explicit instruction: no boxed/glass
 * "card" around the headline - only the HEADLINE TEXT itself floats
 * over the image, cycling through a short set of lines. No border, no
 * background panel, no backdrop-blur, no padding box - just large type
 * sitting directly on the photo with a text-shadow for legibility and a
 * dark gradient scrim behind it.
 *
 * Full-bleed hero.png stays fixed as the background - only the text
 * cycles. Respects prefers-reduced-motion by disabling the auto-cycle
 * (first line stays put) - same accessibility stance as <ScrollReveal>.
 *
 * Headline treatment (2026-07-10): bumped to font-black (900 weight),
 * larger/tighter size, and a slight -skew-x for a bolder, less
 * "corporate default" feel per explicit "make the headline a little fat
 * and wild" request.
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
        {/* No card, no border, no panel - just the text itself floating on
            the image, per explicit correction. Fixed min-height across
            slides so surrounding content (CTAs) doesn't jump as headline
            length changes between slides. text-shadow substitutes for the
            gradient scrim in keeping the text legible over any part of
            the photo. */}
        <div className="max-w-2xl min-h-[200px] sm:min-h-[220px] flex flex-col justify-center">
          <h1
            key={slide.headline}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter -skew-x-1 leading-[0.98] text-[#f6f1e4] [text-shadow:0_3px_20px_rgba(0,0,0,0.5)] animate-[heroFade_0.6s_ease]"
          >
            {slide.headline}
          </h1>
          <p
            key={slide.subline}
            className="mt-5 text-base sm:text-lg text-[#f6f1e4]/90 max-w-xl [text-shadow:0_1px_10px_rgba(0,0,0,0.4)] animate-[heroFade_0.6s_ease]"
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
                  i === index ? 'w-6 bg-[#f6f1e4]' : 'w-1.5 bg-[#f6f1e4]/50'
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
