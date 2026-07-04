const FEATURES = [
  {
    title: 'Verified Crop Prices',
    description: 'Know current market prices, sourced from government data and updated on a regular schedule.',
  },
  {
    title: 'Secure Agreements',
    description: 'Keep landowners and operators on the same page with structured, auditable agreements.',
  },
  {
    title: 'Harvest Records',
    description: 'Track every delivery with photo evidence and gate logs tied to your agreement.',
  },
  {
    title: 'Satellite Monitoring',
    description: 'Monitor field health remotely with weekly NDVI imagery.',
  },
  {
    title: 'Trust Score',
    description: 'Build credibility over time based on verified, on-platform activity.',
  },
  {
    title: 'Dispute Evidence',
    description: 'Every important action is recorded, so disagreements have a clear record to point to.',
  },
];

export function FeatureCards() {
  return (
    <section aria-labelledby="features-heading" className="mt-16">
      <h2 id="features-heading" className="text-2xl font-semibold tracking-tight text-center">
        Why AgroLease
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-foreground/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
