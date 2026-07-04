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
      <h1 id="price-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Today&apos;s {cropLabel} Price in {country.name}
      </h1>

      <p className="mt-4 text-4xl sm:text-5xl font-bold text-brand-green-light">
        {formatCurrency(latest.priceLocal, country.currencySymbol)}
        <span className="text-lg font-medium text-foreground/60"> / tonne</span>
      </p>

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

      {/* Trust-building timestamp + source, per reviewer suggestion #4 */}
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/70">
        <div>
          <span className="font-medium text-foreground">Updated:</span>{' '}
          {formatUpdatedTimestamp(latest.dataDate)}
        </div>
        <div>
          <span className="font-medium text-foreground">Source:</span>{' '}
          {latest.source ?? country.source}
        </div>
      </div>
    </section>
  );
}
