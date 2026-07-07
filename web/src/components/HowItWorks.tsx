const STEPS = [
  { number: 1, title: 'Create Agreement', description: 'Formalize a lease or partnership with clear, shared terms.' },
  { number: 2, title: 'Record Harvest', description: 'Log every delivery with photo evidence and timestamps.' },
  { number: 3, title: 'Verify Market Price', description: 'Check the harvest value against a real market reference price.' },
  { number: 4, title: 'Generate Settlement', description: 'Produce a settlement both sides can point to, with a full audit trail.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">The Process</p>
          <h2 id="how-it-works-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            How AgroLease Works
          </h2>
          {/* This 4-step flow describes the full planned platform, not
              something entirely live today - only step 3 (checking a
              market price) is real right now. Labeled explicitly so
              visitors aren't left guessing, per feedback. */}
          <span className="mt-3 inline-block rounded-full bg-brand-accent/15 text-brand-accent px-3 py-1 text-xs font-semibold">
            🚧 The full platform - in development
          </span>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.number} className="relative">
              <div className="glow-border rounded-2xl bg-surface p-5 h-full">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-brand-green text-white font-semibold text-sm">
                  {step.number}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-foreground/70">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:flex absolute top-1/2 -right-3 -translate-y-1/2 text-foreground/30"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
