'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES, getCountryByCode, getCountryBySlug, getCropLabel } from '@/config/countries';

const OVERRIDE_KEY = 'agrolease-country-override';

/**
 * Homepage hero: resolves the visitor's country (localStorage override,
 * falling back to the server-detected country from middleware, falling
 * back to Nigeria) and lets them change country/crop via dropdowns that
 * navigate straight to the matching /prices/... page. No popup, no forced
 * selection - matches the "always show local price unless they pick
 * another country" requirement.
 */
export function HomeHero({ detectedCountryCode }: { detectedCountryCode: string }) {
  const router = useRouter();
  const fallback = getCountryByCode(detectedCountryCode) ?? COUNTRIES[0];

  const [countrySlug, setCountrySlug] = useState(fallback.slug);
  const [cropSlug, setCropSlug] = useState(fallback.crops[0]);

  useEffect(() => {
    const stored = window.localStorage.getItem(OVERRIDE_KEY);
    if (stored) {
      const country = getCountryBySlug(stored);
      if (country) {
        // localStorage isn't available during SSR, so the server-rendered
        // fallback must be corrected on mount once we know the real
        // override. This is the standard hydration-safe pattern for
        // reading browser-only storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, unavoidable on mount
        setCountrySlug(country.slug);
        setCropSlug(country.crops[0]);
      }
    }
  }, []);

  const country = getCountryBySlug(countrySlug) ?? fallback;

  function handleCountryChange(nextSlug: string) {
    const nextCountry = getCountryBySlug(nextSlug);
    if (!nextCountry) return;
    setCountrySlug(nextSlug);
    setCropSlug(nextCountry.crops[0]);
    window.localStorage.setItem(OVERRIDE_KEY, nextSlug);
  }

  function handleCropChange(nextCrop: string) {
    setCropSlug(nextCrop);
  }

  function goToPricePage() {
    router.push(`/prices/${countrySlug}/${cropSlug}`);
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Today&apos;s {getCropLabel(cropSlug)} Price in {country.name}
      </h1>
      <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
        AgroLease helps landowners, agricultural companies, and farm operators track crop
        prices, record harvests, protect agreements, and reduce costly disputes - all in one
        platform.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
          <span className="text-left text-foreground/60">Crop</span>
          <select
            value={cropSlug}
            onChange={(e) => handleCropChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2"
          >
            {country.crops.map((crop) => (
              <option key={crop} value={crop}>
                {getCropLabel(crop)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
          <span className="text-left text-foreground/60">Country</span>
          <select
            value={countrySlug}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.slug}>
                {c.name}
                {!c.live ? ' (coming soon)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={goToPricePage}
          className="w-full sm:w-auto rounded-full bg-brand-green px-6 py-3 font-semibold text-white hover:bg-brand-green-light transition-colors sm:self-end"
        >
          View Price
        </button>
      </div>

      <p className="mt-4 text-sm text-foreground/50">
        Prices are updated from verified market sources.
      </p>
    </section>
  );
}
