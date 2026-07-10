import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, getCropLabel } from '@/config/countries';
import { getPriceSummary } from '@/lib/prices';
import { formatCurrency } from '@/lib/trend';

export const metadata: Metadata = {
  title: 'Crop Prices by Country',
  description:
    'Browse live and upcoming crop prices across Africa, Brazil, and the United Kingdom on AgroLease.',
  alternates: { canonical: '/prices' },
};

/**
 * "add the commodity price there as well" (2026-07-10): this index used
 * to list crop names as plain link pills with no price attached - a
 * visitor had to click through to /prices/{country}/{crop} to see any
 * number at all. Now a server-side price lookup runs for every
 * (country, crop) pair up front (in parallel via Promise.all, same
 * pattern as <LivePriceTicker>) and the real price renders directly on
 * this page. Pairs with no data yet (coming-soon countries, or a live
 * country whose specific crop has no rows) simply show the crop name
 * with no price attached - never a fabricated number.
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
            <ul className="mt-3 flex flex-wrap gap-2">
              {country.crops.map((crop) => {
                const summary = priceMap.get(`${country.code}:${crop}`);
                return (
                  <li key={crop}>
                    <Link
                      href={`/prices/${country.slug}/${crop}`}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm hover:bg-background transition-colors"
                    >
                      <span>{getCropLabel(crop)}</span>
                      {summary && (
                        <span className="font-semibold text-brand-green-light">
                          {formatCurrency(summary.latest.priceLocal, country.currencySymbol)}/t
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
