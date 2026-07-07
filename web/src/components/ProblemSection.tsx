const PAIN_POINTS = [
  'inaccurate crop prices',
  'handwritten records',
  'harvest disputes',
  'missing documentation',
  'spreadsheet errors',
];

const STATS = [
  {
    stat: 'Widespread',
    label: 'land disputes',
    detail: 'Land disputes remain a significant challenge across many agricultural markets.',
  },
  {
    stat: 'Zero',
    label: 'visibility',
    detail: 'Land owners have no way to verify what was harvested, when, or how much left the farm.',
  },
  {
    stat: 'Years',
    label: 'to resolve',
    detail: 'Agricultural disputes can take years to resolve, especially when documentation is incomplete.',
  },
];

/**
 * "Sell the pain, not the features." An earlier version of this section
 * used a specific, hard-to-source figure ("30%+ of all court cases in
 * Nigeria are land disputes") - if a visitor asked where that number
 * came from, it couldn't be reliably cited, which weakens credibility
 * rather than building it. Rewritten with defensible, country-agnostic
 * statements per feedback: true-in-spirit claims that don't invite a
 * "source?" question we can't answer.
 */
export function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">The Problem</p>
          <h2 id="problem-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            The Gap That Costs Millions
          </h2>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Land disputes are endemic across every market AgroLease targets. Without a system,
            there is no evidence - only conflicting stories.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STATS.map((item) => (
            <div key={item.label} className="glow-border rounded-2xl bg-background p-6 text-center">
              <p className="text-4xl font-bold text-brand-green-light">{item.stat}</p>
              <p className="mt-1 text-sm font-semibold">{item.label}</p>
              <p className="mt-2 text-sm text-foreground/70">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-2xl mx-auto">
          <p className="font-medium">Every season, agricultural businesses lose money because of:</p>
          <ul className="mt-4 space-y-2.5 text-foreground/80">
            {PAIN_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-medium">
            AgroLease replaces fragmented paperwork with one secure system.
          </p>
        </div>
      </div>
    </section>
  );
}
