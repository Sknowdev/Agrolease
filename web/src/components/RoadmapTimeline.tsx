/**
 * Simple launch-sequence timeline using the real, currently-configured
 * rollout (see web/src/config/countries.ts and web_progress.md) rather
 * than a generic example sequence - Kenya/India/Indonesia/US are the
 * actual next wave (API keys pending), not a placeholder list.
 */
const STAGES = [
  { label: 'Live now', countries: '🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇧🇷 Brazil · 🇬🇧 UK' },
  { label: 'Next wave', countries: '🇰🇪 Kenya · 🇮🇳 India · 🇮🇩 Indonesia · 🇺🇸 United States' },
  { label: 'On the roadmap', countries: '14 more countries across Africa, already indexed' },
];

export function RoadmapTimeline() {
  return (
    <section aria-labelledby="roadmap-timeline-heading" className="mt-24 sm:mt-32">
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
    </section>
  );
}
