import { COUNTRIES } from '@/config/countries';

/**
 * Credibility section via real, factual metrics rather than fake
 * customers or testimonials, per the reviewer's suggestion #6 and the
 * "Launching first in Nigeria" addition.
 */
export function RoadmapStats() {
  const liveCountries = COUNTRIES.filter((c) => c.live);
  const totalCrops = new Set(COUNTRIES.flatMap((c) => c.crops)).size;

  return (
    <section
      aria-labelledby="roadmap-heading"
      className="mt-24 sm:mt-32 glow-border rounded-2xl bg-surface p-8 sm:p-12"
    >
      <div className="text-center">
        <p className="eyebrow">Credibility</p>
        <h2 id="roadmap-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Launching First in Nigeria
        </h2>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3 text-center">
        <div>
          <p className="text-4xl font-bold text-brand-green-light">{totalCrops}+</p>
          <p className="text-sm text-foreground/60 mt-1">Supported Crops</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-brand-green-light">{COUNTRIES.length}</p>
          <p className="text-sm text-foreground/60 mt-1">Countries Planned</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-brand-green-light">{liveCountries.length} live</p>
          <p className="text-sm text-foreground/60 mt-1">Market Reference Prices</p>
        </div>
      </div>

      {/*
       * Deliberately user-value framed, not an internal engineering
       * milestone: an earlier version of this list said "X of Y live
       * countries backed by an automated scraper today," which is exactly
       * the kind of implementation detail a visitor doesn't care about
       * and reads as an odd thing to boast about. Removed per feedback.
       */}
      <ul className="mt-10 grid gap-3 max-w-md mx-auto text-foreground/80">
        <li>🇳🇬 Initial market: Nigeria</li>
        <li>📈 Market reference prices updated regularly</li>
        <li>🌍 Expanding country coverage over time</li>
        <li>🔒 Tamper-evident harvest records</li>
        <li>📱 Mobile-first platform</li>
      </ul>
    </section>
  );
}
