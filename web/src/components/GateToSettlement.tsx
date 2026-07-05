const STEPS = [
  { number: 1, title: 'Truck Arrives', detail: 'Photo captured - mandatory, no exceptions.' },
  { number: 2, title: 'Gate Key Verified', detail: "Driver presents their ID for verification." },
  { number: 3, title: 'Weight Recorded', detail: 'From a connected weighbridge or manual entry.' },
  { number: 4, title: 'Record Sealed', detail: 'Tamper-evident from this point forward.' },
  { number: 5, title: 'Exit Logged', detail: 'Same process on the way out - a closed, verified record.' },
];

/**
 * Grounded in docs/AGROLEASE_PRODUCT_PLAN_V10.md Section 06. The photo
 * step is mandatory and cannot be skipped - enforced at the UI and API
 * level per the Engineering Constitution, not just a nice-to-have.
 */
export function GateToSettlement() {
  return (
    <section aria-labelledby="gate-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Every Truck, Logged</p>
          <h2 id="gate-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            From Truck to Sealed Record
          </h2>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Every truck that enters or exits the farm is logged. The photo step is mandatory and
            cannot be skipped under any circumstances.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-5">
          {STEPS.map((step) => (
            <li key={step.number} className="glow-border rounded-2xl bg-surface p-5">
              <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-brand-green text-white font-semibold text-sm">
                {step.number}
              </span>
              <h3 className="mt-3 font-semibold text-sm">{step.title}</h3>
              <p className="mt-1.5 text-xs text-foreground/60">{step.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="glow-border rounded-2xl bg-surface p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Medium</p>
            <p className="mt-1.5 text-sm text-foreground/70">
              Manual weight entry plus a mandatory photo. Defensible in most disputes.
            </p>
          </div>
          <div className="glow-border rounded-2xl bg-surface p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-green-light">High</p>
            <p className="mt-1.5 text-sm text-foreground/70">
              A connected weighbridge plus a mandatory photo. The strongest possible record.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60 max-w-lg mx-auto">
          Records are defensible not because they cannot be changed, but because any change
          leaves a visible, permanent trail.
        </p>
      </div>
    </section>
  );
}
