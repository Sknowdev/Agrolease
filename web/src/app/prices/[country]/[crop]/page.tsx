import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPriceRoutes, getCountryBySlug, getCropLabel } from '@/config/countries';
import { getPriceSummary } from '@/lib/prices';
import { PriceCard } from '@/components/PriceCard';
import { PriceUnavailable } from '@/components/PriceUnavailable';
import { TrendSparkline } from '@/components/TrendSparkline';
import { PriceHistoryTable } from '@/components/PriceHistoryTable';
import { PriceSwitcher } from '@/components/PriceSwitcher';
import { LossExample } from '@/components/LossExample';
import { FeatureCards } from '@/components/FeatureCards';
import { RoadmapStats } from '@/components/RoadmapStats';
import { EarlyAccessForm } from '@/components/EarlyAccessForm';

// Every (country, crop) pair is statically generated at build time, per
// Task 4 - this is what lets Google index all of them and lets ISR
// (configured via `revalidate` below) refresh prices without a full rebuild.
export function generateStaticParams() {
  return getAllPriceRoutes();
}

// Re-check for fresh price data every hour. Coming-soon / no-data pages
// stay cheap to serve since they don't hit anything expensive.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ country: string; crop: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: countrySlug, crop: cropSlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) return {};

  const cropLabel = getCropLabel(cropSlug);
  const title = `Today's ${cropLabel} Price in ${country.name} (Updated ${
    country.live ? 'Regularly' : 'Soon'
  })`;
  const description = country.crops.includes(cropSlug)
    ? `See today's AgroLease market reference price for ${cropLabel.toLowerCase()} in ${country.name}: average, lowest, highest, and 7-day trend.`
    : `${cropLabel} price tracking for ${country.name} is coming soon to AgroLease.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/prices/${country.slug}/${cropSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/prices/${country.slug}/${cropSlug}`,
    },
    // Thin "coming soon" pages are kept crawlable (so links still work and
    // the URL is ready to flip live instantly) but excluded from the index
    // until they have real content, per Task 5's noindex recommendation.
    robots: country.crops.includes(cropSlug) && country.live ? undefined : { index: false, follow: true },
  };
}

export default async function PricePage({ params }: PageProps) {
  const { country: countrySlug, crop: cropSlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) notFound();

  const cropSupported = country.crops.includes(cropSlug);
  const summary = cropSupported ? await getPriceSummary(country.code, cropSlug) : null;
  const cropLabel = getCropLabel(cropSlug);

  const jsonLd = summary
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${cropLabel} - ${country.name}`,
        description: `Market reference price for ${cropLabel.toLowerCase()} in ${country.name}.`,
        offers: {
          '@type': 'Offer',
          price: summary.latest.priceLocal,
          priceCurrency: country.currencyCode,
          availability: 'https://schema.org/InStock',
          priceValidUntil: summary.latest.dataDate,
        },
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          // Static, server-generated JSON-LD with no user input - safe to inject directly.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Price-first: no hero section above this, per the reviewer's note
          that search intent should be answered immediately. */}
      {summary ? (
        <>
          <PriceCard country={country} cropSlug={cropSlug} summary={summary} />
          <TrendSparkline summary={summary} />
          <PriceHistoryTable summary={summary} currencySymbol={country.currencySymbol} />
        </>
      ) : (
        <PriceUnavailable country={country} cropSlug={cropSlug} />
      )}

      {/* Country / crop switcher - a small client component with two compact
          <select> dropdowns instead of a long wall of pill links, so the page
          doesn't read as a raw sitemap dump. No source name shown anywhere,
          per the Constitution's "prices are presented as AgroLease market
          reference prices" rule - no exchange, ministry, or bureau name is
          ever displayed publicly. */}
      <PriceSwitcher currentCountrySlug={country.slug} currentCropSlug={cropSlug} />

      {/* Marketing funnel underneath the price content, per the approved plan */}
      <section aria-labelledby="stop-guessing-heading" className="mt-16 text-center">
        <h2 id="stop-guessing-heading" className="text-2xl font-semibold tracking-tight">
          Stop Guessing Crop Prices
        </h2>
        <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
          Keeping track of prices manually can cost farmers and buyers thousands every season.
          AgroLease automatically tracks market prices, harvest values, agreements, and
          transaction history in one place.
        </p>
      </section>

      <div className="mt-8">
        <LossExample />
      </div>

      <FeatureCards />
      <RoadmapStats />

      <section aria-labelledby="early-access-heading" id="early-access" className="mt-16">
        <h2 id="early-access-heading" className="text-2xl font-semibold tracking-tight text-center">
          Ready to stop relying on spreadsheets and WhatsApp messages?
        </h2>
        <p className="mt-3 text-foreground/70 max-w-xl mx-auto text-center">
          Join the AgroLease early access list.
        </p>
        <div className="mt-6 max-w-lg mx-auto">
          <EarlyAccessForm sourcePage={`/prices/${country.slug}/${cropSlug}`} />
        </div>
      </section>
    </div>
  );
}
