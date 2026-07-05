import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, getCropLabel } from '@/config/countries';

export const metadata: Metadata = {
  title: 'Crop Prices by Country',
  description:
    'Browse live and upcoming crop prices across Africa, Brazil, and the United Kingdom on AgroLease.',
  alternates: { canonical: '/prices' },
};

export default function PricesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
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
              {country.crops.map((crop) => (
                <li key={crop}>
                  <Link
                    href={`/prices/${country.slug}/${crop}`}
                    className="rounded-full border border-border px-3 py-1 text-sm hover:bg-background transition-colors"
                  >
                    {getCropLabel(crop)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
