const STEPS = [
  { number: 1, title: 'Create Agreement', description: 'Formalize a lease or partnership with clear, shared terms.' },
  { number: 2, title: 'Record Harvest', description: 'Log every delivery with photo evidence and timestamps.' },
  { number: 3, title: 'Verify Market Price', description: 'Check the harvest value against a real market reference price.' },
  { number: 4, title: 'Generate Settlement', description: 'Produce a settlement both sides can point to, with a full audit trail.' },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mt-16">
      <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight text-center">
        How AgroLease Works
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.number} className="relative">
            <div className="rounded-xl border border-border bg-surface p-5 h-full">
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
    </section>
  );
}
