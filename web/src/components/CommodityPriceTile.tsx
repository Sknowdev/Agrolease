import Link from 'next/link';
import type { CountryConfig } from '@/config/countries';
import type { PriceSummary } from '@/lib/prices';
import { getCropLabel } from '@/config/countries';
import { formatCurrency, formatTrendPercent } from '@/lib/trend';

/**
 * Dashboard-style price tile for the /prices index (2026-07-10
 * correction). Previous version put the price as a small number inside
 * a pill-shaped link next to the crop name - the user was clear that
 * wasn't what was asked for: the price should look like the same
 * commodity-dashboard tile used elsewhere (<PriceCard>, <LivePricesWidget>) -
 * big number, Reported/Estimated badge, trend - just in a compact grid
 * form here instead of one full page per crop.
 */
export function CommodityPriceTile({
  country,
  cropSlug,
  summary,
}: {
  country: CountryConfig;
  cropSlug: string;
  summary: PriceSummary | null;
}) {
  const cropLabel = getCropLabel(cropSlug);

  if (!summary) {
    return (
      <div className="rounded-xl border border-border bg-background/60 p-4">
        <p className="text-sm font-medium text-foreground/70">{cropLabel}</p>
        <p className="mt-2 text-sm text-foreground/50">Not available yet</p>
      </div>
    );
  }

  const trendLabel = formatTrendPercent(summary.trendPercent);

  return (
    <Link
      href={`/prices/${country.slug}/${cropSlug}`}
      className="block rounded-xl border border-border bg-background p-4 hover:border-brand-green-light transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{cropLabel}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
            summary.latest.sourceType === 'estimated'
              ? 'bg-brand-accent/15 text-brand-accent'
              : 'bg-brand-green-light/15 text-brand-green-light'
          }`}
        >
          {summary.latest.sourceType === 'estimated' ? 'Estimated' : 'Reported'}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-brand-green-light">
        {formatCurrency(summary.latest.priceLocal, country.currencySymbol)}
        <span className="text-xs font-medium text-foreground/60"> /tonne</span>
      </p>

      {trendLabel && (
        <p
          className={`mt-1 text-xs font-medium ${
            (summary.trendPercent ?? 0) >= 0 ? 'text-brand-green-light' : 'text-red-500'
          }`}
        >
          {trendLabel} (7d)
        </p>
      )}
    </Link>
  );
}
