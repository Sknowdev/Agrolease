/**
 * Each feature is explicitly tagged as either genuinely available today
 * or planned/coming soon - per feedback, visitors shouldn't have to
 * guess whether something already exists. Only "Live Market Prices" is
 * real right now; everything else (agreements, harvest records, evidence
 * trail, disputes, settlement) is the in-development platform described
 * in the product plan, not a shipped feature.
 */
const FEATURES = [
  {
    icon: '📊',
    title: 'Live Market Prices',
    description: 'Know current market prices, sourced from government data and updated on a regular schedule.',
    status: 'live' as const,
  },
  {
    icon: '🤝',
    title: 'Digital Agreements',
    description: 'Keep landowners and operators on the same page with structured, auditable agreements.',
    status: 'planned' as const,
  },
  {
    icon: '🚛',
    title: 'Harvest Records',
    description: 'Track every delivery with photo evidence and gate logs tied to your agreement.',
    status: 'planned' as const,
  },
  {
    icon: '🧾',
    title: 'Evidence Trail',
    description: 'Every important action is recorded with a permanent, tamper-evident audit trail.',
    status: 'planned' as const,
  },
  {
    icon: '⚖️',
    title: 'Dispute Management',
    description: 'When disagreements arise, export structured evidence instead of relying on memory.',
    status: 'planned' as const,
  },
  {
    icon: '✅',
    title: 'Settlement Tracking',
    description: 'See what was agreed, what was delivered, and what was paid - all in one place.',
    status: 'planned' as const,
  },
];

const STATUS_LABEL: Record<'live' | 'planned', string> = {
  live: '✅ Live',
  planned: '🚧 Planned',
};

const STATUS_CLASS: Record<'live' | 'planned', string> = {
  live: 'bg-brand-green-light/15 text-brand-green-light',
  planned: 'bg-brand-accent/15 text-brand-accent',
};

import { ScrollReveal } from './ScrollReveal';

export function FeatureCards() {
  return (
    <section aria-labelledby="features-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">The Platform</p>
            <h2 id="features-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Everything in one platform
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delayMs={index * 100} className="h-full">
              <div className="glow-border rounded-2xl bg-background p-6 h-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[feature.status]}`}
                  >
                    {STATUS_LABEL[feature.status]}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
