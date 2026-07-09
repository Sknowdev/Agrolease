'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COUNTRIES, getCountryBySlug, getCropLabel } from '@/config/countries';
import { formatCurrency, formatTrendPercent, formatUpdatedTimestamp } from '@/lib/trend';
import type { PriceSummary } from '@/lib/prices';

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.live) ?? COUNTRIES[0];

/**
 * "Live Commodity Prices" - the homepage's SEO-adjacent, Bloomberg-style
 * price lookup widget. This is a client-side convenience for browsing
 * around from the homepage; the canonical, indexable page for any given
 * country+crop is still /prices/[country]/[crop] (statically generated,
 * server-rendered). This widget fetches from the small JSON API route at
 * /api/prices/[country]/[crop] so switching the dropdowns doesn't trigger
 * a full navigation.
 */
export function LivePricesWidget() {
  const [countrySlug, setCountrySlug] = useState(DEFAULT_COUNTRY.slug);
  const [cropSlug, setCropSlug] = useState(DEFAULT_COUNTRY.crops[0]);
  const [summary, setSummary] = useState<PriceSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const country = getCountryBySlug(countrySlug) ?? DEFAULT_COUNTRY;

  useEffect(() => {
    let cancelled = false;
    // Resetting to "loading" when the selected country/crop changes is the
    // standard "fetch on dependency change" pattern - there's no external
    // system to subscribe to instead of this fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting status for a new fetch triggered by a dependency change
    setStatus('loading');

    fetch(`/api/prices/${countrySlug}/${cropSlug}`)
      .then((res) => res.json())
      .then((body: { summary: PriceSummary | null }) => {
        if (cancelled) return;
        setSummary(body.summary);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setSummary(null);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [countrySlug, cropSlug]);

  function handleCountryChange(nextSlug: string) {
    const next = getCountryBySlug(nextSlug);
    if (!next) return;
    setCountrySlug(nextSlug);
    setCropSlug(next.crops[0]);
  }

  return (
    <section id="live-prices" aria-labelledby="live-prices-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 glow-border rounded-2xl bg-surface p-6 sm:p-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">Today&apos;s Price</p>
            {/*
             * BUG FIX (2026-07-09): this heading said "Live Commodity
             * Prices" unconditionally, even when the price shown right
             * below it is explicitly tagged "Estimated" (or when there's
             * no data at all) - a direct on-page contradiction the user
             * caught (screenshot: "Live Commodity Prices" heading next to
             * an "Estimated" badge). Same "never claim more freshness than
             * the data actually has" rule already applied to individual
             * price badges elsewhere - just wasn't applied to this section
             * title. Now reflects the actual state of what's displayed.
             */}
            <h2 id="live-prices-heading" className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">
              {status !== 'loading' && summary
                ? summary.latest.sourceType === 'estimated'
                  ? 'Estimated Commodity Prices'
                  : 'Reported Commodity Prices'
                : 'Commodity Prices'}
            </h2>
          </div>
          <Link
            href={`/prices/${country.slug}/${cropSlug}`}
            className="text-sm text-brand-green-light hover:underline"
          >
            Open full price page →
          </Link>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
            <span className="text-foreground/60">Country</span>
            <select
              value={countrySlug}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.slug}>
                  {c.name}
                  {!c.live ? ' (coming soon)' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
            <span className="text-foreground/60">Crop</span>
            <select
              value={cropSlug}
              onChange={(e) => setCropSlug(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              {country.crops.map((crop) => (
                <option key={crop} value={crop}>
                  {getCropLabel(crop)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          {status === 'loading' && (
            <p className="text-sm text-foreground/50">Loading {getCropLabel(cropSlug)} price…</p>
          )}

          {status !== 'loading' && !summary && (
            <p className="text-sm text-foreground/70">
              Crop price not available in your country yet. We&apos;re sorry for the
              inconvenience - our team is working on it.
            </p>
          )}

          {summary && (
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-4xl sm:text-5xl font-bold text-brand-green-light">
                  {formatCurrency(summary.latest.priceLocal, country.currencySymbol)}
                  <span className="text-base font-medium text-foreground/60"> / tonne</span>
                </p>
                {/* Same Reported/Estimated distinction as PriceCard - see
                    that component for why this is non-negotiable. */}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.latest.sourceType === 'estimated'
                      ? 'bg-brand-accent/15 text-brand-accent'
                      : 'bg-brand-green-light/15 text-brand-green-light'
                  }`}
                >
                  {summary.latest.sourceType === 'estimated' ? 'Estimated' : 'Reported'}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-foreground/60">7-day trend</dt>
                  <dd
                    className={`font-medium ${
                      (summary.trendPercent ?? 0) >= 0 ? 'text-brand-green-light' : 'text-red-500'
                    }`}
                  >
                    {formatTrendPercent(summary.trendPercent) ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Low (30d)</dt>
                  <dd className="font-medium">
                    {formatCurrency(summary.lowest, country.currencySymbol)}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/60">High (30d)</dt>
                  <dd className="font-medium">
                    {formatCurrency(summary.highest, country.currencySymbol)}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/60">Average (30d)</dt>
                  <dd className="font-medium">
                    {formatCurrency(summary.average, country.currencySymbol)}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-sm text-foreground/60">
                Updated: {formatUpdatedTimestamp(summary.latest.dataDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
