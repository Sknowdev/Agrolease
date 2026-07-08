import type { CountryConfig } from '@/config/countries';
import type { PriceSummary } from '@/lib/prices';
import { formatCurrency, formatTrendPercent, formatUpdatedTimestamp } from '@/lib/trend';
import { getCropLabel } from '@/config/countries';

/**
 * The "first impression should be prices" component (Task 4 + Task 7).
 * Renders the answer to a search like "maize price in ghana" immediately -
 * no hero section above it, per the reviewer's suggestion #2.
 */
export function PriceCard({
  country,
  cropSlug,
  summary,
}: {
  country: CountryConfig;
  cropSlug: string;
  summary: PriceSummary;
}) {
  const cropLabel = getCropLabel(cropSlug);
  const { latest, lowest, highest, trendPercent } = summary;
  const trendLabel = formatTrendPercent(trendPercent);

  return (
    <section
      aria-labelledby="price-heading"
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <h1 id="price-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Today&apos;s {cropLabel} Price in {country.name}
        </h1>
        {/*
         * Non-negotiable per the Daily/Weekly Price planning doc: a
         * weekly-changing "estimated" number must never sit next to a
         * plain "Live" badge, since that implies real-time market
         * activity these crops don't actually have. "Reported" means a
         * real field survey; "Estimated" means World Bank RTFP's
         * ML-filled series between real survey rounds.
         */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            latest.sourceType === 'estimated'
              ? 'bg-brand-accent/15 text-brand-accent'
              : 'bg-brand-green-light/15 text-brand-green-light'
          }`}
        >
          {latest.sourceType === 'estimated' ? 'Estimated' : 'Reported'}
        </span>
      </div>

      <p className="mt-4 text-4xl sm:text-5xl font-bold text-brand-green-light">
        {formatCurrency(latest.priceLocal, country.currencySymbol)}
        <span className="text-lg font-medium text-foreground/60"> / tonne</span>
      </p>

      {latest.sourceType === 'estimated' && (
        <p className="mt-1 text-xs text-foreground/60">
          Estimated — updated weekly, based on WFP survey data with gap-filling between
          reporting periods.
        </p>
      )}

      {trendLabel && (
        <p
          className={`mt-2 text-sm font-medium ${
            (trendPercent ?? 0) >= 0 ? 'text-brand-green-light' : 'text-red-500'
          }`}
        >
          {trendLabel} over the last 7 days
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-foreground/60">Lowest (30d)</dt>
          <dd className="font-medium">{formatCurrency(lowest, country.currencySymbol)}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Highest (30d)</dt>
          <dd className="font-medium">{formatCurrency(highest, country.currencySymbol)}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Average (30d)</dt>
          <dd className="font-medium">{formatCurrency(summary.average, country.currencySymbol)}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Currency</dt>
          <dd className="font-medium">{country.currencyCode}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Unit</dt>
          <dd className="font-medium">Metric Ton</dd>
        </div>
        {latest.priceUsd !== null && (
          <div>
            <dt className="text-foreground/60">USD Equivalent</dt>
            <dd className="font-medium">${latest.priceUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</dd>
          </div>
        )}
      </dl>

      {/*
       * Trust-building timestamp only. No source/exchange/ministry name is
       * shown, per the Engineering Constitution's rule: "No exchange name,
       * government body, or data source is ever displayed in the app or on
       * the public price page. Prices are presented as AgroLease market
       * reference prices."
       */}
      <div className="mt-6 pt-6 border-t border-border text-sm text-foreground/70">
        <span className="font-medium text-foreground">Updated:</span>{' '}
        {formatUpdatedTimestamp(latest.dataDate)}
      </div>
    </section>
  );
}
