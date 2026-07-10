import type { Metadata } from 'next';
import { COUNTRIES } from '@/config/countries';
import { getPriceSummary } from '@/lib/prices';
import { CommodityPriceTile } from '@/components/CommodityPriceTile';

export const metadata: Metadata = {
  title: 'Crop Prices by Country',
  description:
    'Browse live and upcoming crop prices across Africa, Brazil, and the United Kingdom on AgroLease.',
  alternates: { canonical: '/prices' },
};

/**
 * Correction (2026-07-10): "put price number in front of the same
 * commodity dashboard there" - the previous version showed a small price
 * number tucked inside a crop-name pill link. That wasn't the dashboard
 * look used elsewhere on the site (<PriceCard>, <LivePricesWidget>) - big
 * number, Reported/Estimated badge, trend. Replaced every crop entry with
 * <CommodityPriceTile>, a compact version of that same dashboard tile, so
 * this index reads as a grid of real commodity-dashboard cards grouped by
 * country, not a list of links with a number squeezed in.
 */
export default async function PricesIndexPage() {
  const allPairs = COUNTRIES.flatMap((country) =>
    country.crops.map((crop) => ({ country, crop }))
  );

  const summaries = await Promise.all(
    allPairs.map(async ({ country, crop }) => {
      const summary = await getPriceSummary(country.code, crop);
      return { countryCode: country.code, crop, summary };
    })
  );

  const priceMap = new Map(
    summaries.map(({ countryCode, crop, summary }) => [`${countryCode}:${crop}`, summary])
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-10">
      <h1 className="text-3xl font-semibold tracking-tight">Crop Prices by Country</h1>
      <p className="mt-3 text-foreground/70 max-w-2xl">
        AgroLease market reference prices, updated regularly. Countries marked
        &quot;coming soon&quot; will go live as their data feed is connected.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {COUNTRIES.map((country) => (
          <div key={country.code} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold flex items-center gap-2">
              {country.name}
              {!country.live && (
                <span className="rounded-full bg-brand-accent/20 text-brand-accent px-2 py-0.5 text-xs font-semibold uppercase">
                  Coming Soon
                </span>
              )}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {country.crops.map((crop) => (
                <CommodityPriceTile
                  key={crop}
                  country={country}
                  cropSlug={crop}
                  summary={priceMap.get(`${country.code}:${crop}`) ?? null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
