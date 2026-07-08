import { COUNTRIES } from '@/config/countries';

/**
 * Driven directly from COUNTRIES (web/src/config/countries.ts) instead
 * of a hand-written country list. An earlier hardcoded version of this
 * component went stale the moment 11 countries were flipped from
 * "coming soon" to live (2026-07-07, after verifying the WFP Global
 * Food Prices source) - Kenya in particular was still listed as "next
 * wave" here after it was already live. Deriving this from the real
 * config means it can never drift out of sync again.
 */
export function RoadmapTimeline() {
  const liveCountries = COUNTRIES.filter((c) => c.live);
  const comingSoonCountries = COUNTRIES.filter((c) => !c.live);

  const STAGES = [
    { label: 'Live now', countries: liveCountries.map((c) => c.name).join(' · ') },
    ...(comingSoonCountries.length > 0
      ? [
          {
            label: 'Coming soon',
            countries: `${comingSoonCountries.map((c) => c.name).join(' · ')} - routes already indexed`,
          },
        ]
      : []),
  ];

  return (
    <section aria-labelledby="roadmap-timeline-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">What&apos;s Next</p>
          <h2 id="roadmap-timeline-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Roadmap
          </h2>
        </div>
        <ol className="mt-10 max-w-lg mx-auto space-y-0">
          {STAGES.map((stage, index) => (
            <li key={stage.label} className="relative pl-8 pb-8 last:pb-0">
              {index < STAGES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-4 bottom-0 w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 w-4 h-4 rounded-full bg-brand-green border-2 border-background"
              />
              <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
                {stage.label}
              </p>
              <p className="mt-1">{stage.countries}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
