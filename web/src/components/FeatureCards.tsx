const FEATURES = [
  {
    icon: '📊',
    title: 'Live Market Prices',
    description: 'Know current market prices, sourced from government data and updated on a regular schedule.',
  },
  {
    icon: '🤝',
    title: 'Digital Agreements',
    description: 'Keep landowners and operators on the same page with structured, auditable agreements.',
  },
  {
    icon: '🚛',
    title: 'Harvest Records',
    description: 'Track every delivery with photo evidence and gate logs tied to your agreement.',
  },
  {
    icon: '🧾',
    title: 'Evidence Trail',
    description: 'Every important action is recorded with a permanent, tamper-evident audit trail.',
  },
  {
    icon: '⚖️',
    title: 'Dispute Management',
    description: 'When disagreements arise, export structured evidence instead of relying on memory.',
  },
  {
    icon: '✅',
    title: 'Settlement Tracking',
    description: 'See what was agreed, what was delivered, and what was paid - all in one place.',
  },
];

export function FeatureCards() {
  return (
    <section aria-labelledby="features-heading" className="mt-16">
      <h2 id="features-heading" className="text-2xl font-semibold tracking-tight text-center">
        Everything in one platform
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
            <span className="text-2xl" aria-hidden="true">
              {feature.icon}
            </span>
            <h3 className="mt-2 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-foreground/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
