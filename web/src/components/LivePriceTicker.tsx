import Link from 'next/link';
import { getCountryBySlug, getCropLabel } from '@/config/countries';
import { getPriceSummary } from '@/lib/prices';
import { formatCurrency } from '@/lib/trend';

/**
 * "Live price should literally show crop prices, not how many countries" -
 * direct correction (2026-07-09). The old homepage price section required
 * a client fetch + a "Loading Maize price..." state before showing
 * anything, and the section right below it (<RoadmapStats>) leads with
 * country-count stats - between the two, a visitor's first impression
 * was metadata, not an actual price.
 *
 * This is a server component: every price shown here is fetched at
 * render/revalidate time (same getPriceSummary() used by the canonical
 * /prices/[country]/[crop] pages), so real numbers paint on first
 * response with no spinner. A curated, hardcoded list of real
 * (country, crop) pairs across different live countries - not a random
 * sample - so the strip reads as "here are real prices right now", not
 * a coverage map. Any pair that genuinely has no data is silently
 * skipped (never replaced with a placeholder number).
 */
const TICKER_PAIRS: Array<{ countrySlug: string; cropSlug: string; flag: string }> = [
  { countrySlug: 'nigeria', cropSlug: 'maize', flag: '🇳🇬' },
  { countrySlug: 'ghana', cropSlug: 'cocoa', flag: '🇬🇭' },
  { countrySlug: 'uk', cropSlug: 'wheat', flag: '🇬🇧' },
  { countrySlug: 'south-africa', cropSlug: 'maize', flag: '🇿🇦' },
  { countrySlug: 'brazil', cropSlug: 'coffee', flag: '🇧🇷' },
  { countrySlug: 'kenya', cropSlug: 'maize', flag: '🇰🇪' },
  { countrySlug: 'egypt', cropSlug: 'wheat', flag: '🇪🇬' },
  { countrySlug: 'senegal', cropSlug: 'groundnuts', flag: '🇸🇳' },
];

export async function LivePriceTicker() {
  const results = await Promise.all(
    TICKER_PAIRS.map(async ({ countrySlug, cropSlug, flag }) => {
      const country = getCountryBySlug(countrySlug);
      if (!country) return null;
      const summary = await getPriceSummary(country.code, cropSlug);
      if (!summary) return null;
      return { country, cropSlug, flag, summary };
    })
  );

  const items = results.filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-y border-border bg-surface py-3">
      <div className="flex gap-8 animate-[tickerScroll_38s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
        {/* Rendered twice back-to-back so the scroll loop has no visible seam. */}
        {[...items, ...items].map((item, i) => (
          <Link
            key={`${item.country.slug}-${item.cropSlug}-${i}`}
            href={`/prices/${item.country.slug}/${item.cropSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium shrink-0 hover:text-brand-green-light transition-colors"
          >
            <span aria-hidden="true">{item.flag}</span>
            <span>{getCropLabel(item.cropSlug)}</span>
            <span className="text-foreground/40">·</span>
            <span className="text-brand-green-light font-semibold">
              {formatCurrency(item.summary.latest.priceLocal, item.country.currencySymbol)}/t
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
