import { headers } from 'next/headers';
import { HomeHero } from '@/components/HomeHero';
import { LossCalculator } from '@/components/LossCalculator';
import { FeatureCards } from '@/components/FeatureCards';
import { RoadmapStats } from '@/components/RoadmapStats';
import { EarlyAccessForm } from '@/components/EarlyAccessForm';

/**
 * Vercel populates `x-vercel-ip-country` on every edge request based on the
 * visitor's IP - no third-party geolocation API needed. Locally (or on any
 * non-Vercel host) this header is absent, so we fall back to Nigeria, which
 * HomeHero already handles.
 */
async function getDetectedCountryCode(): Promise<string> {
  const headerList = await headers();
  return headerList.get('x-vercel-ip-country') ?? 'NG';
}

export default async function HomePage() {
  const detectedCountryCode = await getDetectedCountryCode();

  return (
    <div>
      <HomeHero detectedCountryCode={detectedCountryCode} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <LossCalculator />
        <FeatureCards />
        <RoadmapStats />

        <section aria-labelledby="home-early-access-heading" className="mt-16 mb-16">
          <h2
            id="home-early-access-heading"
            className="text-2xl font-semibold tracking-tight text-center"
          >
            Checking out? Get started.
          </h2>
          <p className="mt-3 text-foreground/70 max-w-xl mx-auto text-center">
            Request early access and we&apos;ll notify you as AgroLease launches in your
            country.
          </p>
          <div className="mt-6 max-w-lg mx-auto">
            <EarlyAccessForm sourcePage="/" />
          </div>
        </section>
      </div>
    </div>
  );
}
