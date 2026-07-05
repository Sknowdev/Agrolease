'use client';

import { useRouter } from 'next/navigation';
import { COUNTRIES, getCountryBySlug, getCropLabel } from '@/config/countries';

/**
 * Two compact dropdowns for jumping to another crop/country price page.
 * Replaces the previous long wall of pill links (every crop + all 19
 * countries as individual buttons) which made the page read like a raw
 * sitemap dump rather than a designed page.
 */
export function PriceSwitcher({
  currentCountrySlug,
  currentCropSlug,
}: {
  currentCountrySlug: string;
  currentCropSlug: string;
}) {
  const router = useRouter();
  const country = getCountryBySlug(currentCountrySlug);
  if (!country) return null;

  return (
    <nav aria-label="Browse other prices" className="mt-10 pt-6 border-t border-border">
      <p className="text-sm font-medium text-foreground/70 mb-3">Browse other prices</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
          <span className="text-foreground/60">Crop</span>
          <select
            defaultValue={currentCropSlug}
            onChange={(e) => router.push(`/prices/${country.slug}/${e.target.value}`)}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            {country.crops.map((slug) => (
              <option key={slug} value={slug}>
                {getCropLabel(slug)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm w-full sm:w-56">
          <span className="text-foreground/60">Country</span>
          <select
            defaultValue={country.slug}
            onChange={(e) => {
              const next = getCountryBySlug(e.target.value);
              if (next) router.push(`/prices/${next.slug}/${next.crops[0]}`);
            }}
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
      </div>
    </nav>
  );
}
