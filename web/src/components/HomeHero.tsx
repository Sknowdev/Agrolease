import Link from 'next/link';

/**
 * Homepage hero - headline + one-line elevator pitch + two CTAs, over a
 * textured (not flat/plain) background. Deliberately does not repeat the
 * price-lookup controls here - those live in <LivePricesWidget> directly
 * below, so the hero itself stays a single, uncluttered first impression
 * rather than another form.
 */
export function HomeHero() {
  return (
    <section className="hero-texture border-b border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground/70">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green-light" aria-hidden="true" />
          Now tracking live prices in 5 countries
        </p>

        <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Agricultural Agreements. Verified Harvest Records. Trusted Settlements.
        </h1>

        <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto">
          AgroLease helps landowners and agricultural businesses manage leases, verify
          harvests, monitor market prices, and keep tamper-evident records for every
          transaction.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#live-prices"
            className="w-full sm:w-auto rounded-full bg-brand-green px-6 py-3 font-semibold text-white hover:bg-brand-green-light transition-colors"
          >
            View Today&apos;s Prices
          </a>
          <Link
            href="/early-access"
            className="w-full sm:w-auto rounded-full border border-border bg-background px-6 py-3 font-semibold hover:bg-surface transition-colors"
          >
            Join Early Access
          </Link>
        </div>
      </div>
    </section>
  );
}
