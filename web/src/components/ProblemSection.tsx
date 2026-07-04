const PAIN_POINTS = [
  'inaccurate crop prices',
  'handwritten records',
  'harvest disputes',
  'missing documentation',
  'spreadsheet errors',
];

/**
 * "Sell the pain, not the features" - a short, plain-spoken section
 * before any feature list. Deliberately terse: this is the one part of
 * the page meant to read like a person wrote it in two minutes, not a
 * generated feature summary.
 */
export function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="mt-16">
      <h2 id="problem-heading" className="text-2xl font-semibold tracking-tight">
        Every season, agricultural businesses lose money because of:
      </h2>
      <ul className="mt-4 space-y-2 text-foreground/80">
        {PAIN_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <p className="mt-5 font-medium">
        AgroLease replaces fragmented paperwork with one secure system.
      </p>
    </section>
  );
}
