const PAIN_POINTS = [
  'inaccurate crop prices',
  'handwritten records',
  'harvest disputes',
  'missing documentation',
  'spreadsheet errors',
];

const STATS = [
  {
    stat: '30%+',
    label: 'of all court cases in Nigeria',
    detail: 'are land disputes, filed every year.',
  },
  {
    stat: 'Zero',
    label: 'visibility',
    detail: 'Land owners have no way to verify what was harvested, when, or how much left the farm.',
  },
  {
    stat: 'Years',
    label: 'in court',
    detail: 'In India, disputes over underreported harvests and price manipulation take years or decades to resolve.',
  },
];

/**
 * "Sell the pain, not the features." Stats are drawn directly from
 * docs/AGROLEASE_PRODUCT_PLAN_V10.md Section 01 (Nigeria's 30%+ land
 * dispute court-case share; India's multi-year civil court timelines) -
 * not invented figures.
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
