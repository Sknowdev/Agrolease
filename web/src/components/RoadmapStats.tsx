import { COUNTRIES } from '@/config/countries';

/**
 * Credibility section via real, factual metrics rather than fake
 * customers or testimonials, per the reviewer's suggestion #6 and the
 * "Launching first in Nigeria" addition.
 */
export function RoadmapStats() {
  const liveCountries = COUNTRIES.filter((c) => c.live);
  const scraperBackedCount = COUNTRIES.filter((c) => c.priceFeedMethod === 'scraper').length;
  const totalCrops = new Set(COUNTRIES.flatMap((c) => c.crops)).size;

  return (
    <section
      aria-labelledby="roadmap-heading"
      className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <h2 id="roadmap-heading" className="text-2xl font-semibold tracking-tight text-center">
        Launching First in Nigeria
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
          <p className="text-sm text-foreground/60 mt-1">Market Reference Prices</p>
        </div>
      </div>

      <ul className="mt-8 grid gap-2.5 max-w-md mx-auto text-sm text-foreground/80">
        <li>🇳🇬 Initial market: Nigeria</li>
        <li>🌍 Designed for global expansion</li>
        <li>
          📈 {scraperBackedCount} of {liveCountries.length} live countries backed by an
          automated government-data scraper today
        </li>
        <li>🔒 Tamper-evident harvest records</li>
        <li>📱 Mobile-first platform</li>
      </ul>
    </section>
  );
}
