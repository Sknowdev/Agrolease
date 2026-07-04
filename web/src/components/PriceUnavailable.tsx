import type { CountryConfig } from '@/config/countries';
import { getCropLabel } from '@/config/countries';

/**
 * Shown for any country/crop combination that doesn't have data yet -
 * both "coming soon" countries and live countries whose scraper hasn't
 * covered that particular crop. Copy matches the wording the user asked
 * for directly, verbatim.
 */
export function PriceUnavailable({
  country,
  cropSlug,
}: {
  country: CountryConfig;
  cropSlug: string;
}) {
  const cropLabel = getCropLabel(cropSlug);

  return (
    <section
      aria-labelledby="price-heading"
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8 text-center"
    >
      <h1 id="price-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight">
        {cropLabel} Price in {country.name}
      </h1>
      <p className="mt-4 text-lg text-foreground/80 max-w-md mx-auto">
        Crop price not available in your country yet. We&apos;re sorry for the
        inconvenience - our team is working on it.
      </p>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-accent/20 text-brand-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        Coming Soon
      </span>
    </section>
  );
}
