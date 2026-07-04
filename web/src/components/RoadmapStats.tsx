import { COUNTRIES } from '@/config/countries';

/**
 * Social proof via real, factual metrics rather than fake customers,
 * per the reviewer's suggestion #6.
 */
export function RoadmapStats() {
  const liveCountries = COUNTRIES.filter((c) => c.live);
  const comingSoonCountries = COUNTRIES.filter((c) => !c.live);
  const totalCrops = new Set(COUNTRIES.flatMap((c) => c.crops)).size;

  return (
    <section aria-labelledby="roadmap-heading" className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 id="roadmap-heading" className="text-2xl font-semibold tracking-tight text-center">
        Building for the markets that need it most
      </h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-3 text-center">
        <div>
          <p className="text-3xl font-bold text-brand-green-light">{totalCrops}+</p>
          <p className="text-sm text-foreground/60 mt-1">Supported Crops</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-brand-green-light">{COUNTRIES.length}</p>
          <p className="text-sm text-foreground/60 mt-1">Countries Planned</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-brand-green-light">{liveCountries.length} live</p>
          <p className="text-sm text-foreground/60 mt-1">Government Price Sources</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-foreground/70 mb-2">Live now</p>
          <ul className="flex flex-wrap gap-2">
            {liveCountries.map((c) => (
              <li
                key={c.code}
                className="rounded-full bg-brand-green/10 text-brand-green-light px-3 py-1 text-sm"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/70 mb-2">On the roadmap</p>
          <ul className="flex flex-wrap gap-2">
            {comingSoonCountries.map((c) => (
              <li
                key={c.code}
                className="rounded-full bg-foreground/5 text-foreground/60 px-3 py-1 text-sm"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
