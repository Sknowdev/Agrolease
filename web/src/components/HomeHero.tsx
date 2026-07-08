import Link from 'next/link';
import { COUNTRIES } from '@/config/countries';

/**
 * Homepage hero. Wider and bolder than a typical narrow single-column
 * layout (the previous version was capped at max-w-3xl even at desktop
 * widths, which read as thin/low-effort) - the headline now scales up to
 * a real display size and the section has genuine depth via layered
 * blurred color fields, not a flat background.
 *
 * Deliberately does not repeat the price-lookup controls here - those
 * live in <LivePricesWidget> directly below - so the hero itself stays a
 * single, uncluttered first impression rather than another form.
 */
export function HomeHero() {
  const trackedCountryCount = COUNTRIES.filter((c) => c.live).length;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="atmos-blob w-[420px] h-[420px] bg-brand-green/10 -top-32 -right-24" />
      <div className="atmos-blob w-[320px] h-[320px] bg-brand-accent/10 -bottom-24 -left-24" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
        {/*
         * Rewritten per feedback: the previous "Now tracking live prices"
         * wording implied real-time market activity for every one of
         * these countries, which isn't accurate - several are backed by
         * monthly WFP survey data or World Bank RTFP's ML-filled weekly
         * estimates, not a live feed. "Estimated" is honest for both:
         * WFP's monthly number is itself a survey-period estimate, and
         * RTFP is explicitly model-estimated. The country count is still
         * derived from COUNTRIES, never hardcoded.
         */}
        <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-brand-green-light" aria-hidden="true" />
          Estimated crop prices across {trackedCountryCount} countries
        </p>

        <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
          Agricultural Agreements.
          <br />
          Verified Harvest Records.
          <br />
          Trusted Settlements.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
          AgroLease helps landowners and agricultural businesses manage leases, verify
          harvests, monitor market prices, and keep tamper-evident records for every
          transaction.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#live-prices"
            className="w-full sm:w-auto rounded-full bg-brand-green px-7 py-3.5 font-semibold text-white hover:bg-brand-green-light transition-colors"
          >
            View Today&apos;s Prices
          </a>
          <Link
            href="/early-access"
            className="w-full sm:w-auto rounded-full border border-border bg-background px-7 py-3.5 font-semibold hover:bg-surface transition-colors"
          >
            Join Early Access
          </Link>
        </div>
      </div>
    </section>
  );
}
