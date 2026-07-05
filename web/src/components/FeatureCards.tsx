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
    <section aria-labelledby="features-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">The Platform</p>
          <h2 id="features-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Everything in one platform
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glow-border rounded-2xl bg-background p-6">
              <span className="text-2xl" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
