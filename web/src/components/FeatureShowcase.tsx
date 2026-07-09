import Image from 'next/image';
import { ScrollReveal } from './ScrollReveal';

/**
 * Image-driven feature showcase (2026-07 redesign) - "3 or 4 images" per
 * instruction, replacing icon-only cards on the homepage. Each card is
 * explicitly labeled live vs. planned, same honesty rule as the previous
 * <FeatureCards> (still used on /prices/[country]/[crop] pages) - only
 * "Live Commodity Prices" is real today.
 */
const FEATURES = [
  {
    image: '/images/commodity-prices.png',
    alt: 'AgroLease commodity price dashboard overlooking a farm with silos',
    title: 'Live Commodity Prices',
    description: 'Real market reference prices, sourced from verified data and updated on a regular schedule.',
    status: 'live' as const,
  },
  {
    image: '/images/satellite.png',
    alt: 'AgroLease satellite monitoring screen showing vegetation health and soil moisture',
    title: 'Satellite Monitoring',
    description: 'Crop-health imagery and field-boundary tracking to verify farm activity from above.',
    status: 'planned' as const,
  },
  {
    image: '/images/farmer.png',
    alt: 'Farmers harvesting maize, cassava, and cocoa with a tractor in the background',
    title: 'Harvest Records',
    description: 'Every delivery logged with photo evidence, tied directly to your agreement.',
    status: 'planned' as const,
  },
];

const STATUS_LABEL: Record<'live' | 'planned', string> = {
  live: '✅ Live',
  planned: '🚧 Planned',
};

export function FeatureShowcase() {
  return (
    <section aria-labelledby="feature-showcase-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">The Platform</p>
            <h2 id="feature-showcase-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Everything in One Platform
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delayMs={index * 150}>
              <div className="rounded-2xl overflow-hidden border border-border bg-background h-full flex flex-col">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        feature.status === 'live'
                          ? 'bg-brand-green-light/15 text-brand-green-light'
                          : 'bg-brand-accent/15 text-brand-accent'
                      }`}
                    >
                      {STATUS_LABEL[feature.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/70">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
