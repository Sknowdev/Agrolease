import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero (2026-07 redesign). Full-bleed background image (hero.png - an
 * aerial farmland shot with a plot-boundary overlay already baked into
 * the photo), with the headline floating on top of it rather than the
 * page opening on a flat color block. Per explicit correction from the
 * user: it's the TEXT that floats/overlaps the image, not the image
 * itself moving - the image is a fixed full-bleed background.
 *
 * Copy is locked to the user's exact spec:
 *   - Headline: "The Operating System for Agricultural Partnerships."
 *   - Sub-line: "Secure your relationship with partners."
 *   - CTAs: "Join Waitlist" / "View Live Commodity Prices"
 *
 * This intentionally replaces the previous "answer the search query
 * immediately" price-first hero pattern on the HOMEPAGE only - that
 * pattern still lives on and governs /prices/[country]/[crop], which is
 * still the actual canonical, indexed destination for price search
 * traffic. The homepage's job changed per this session's explicit
 * direction: sell what AgroLease *is* first, with pricing reachable as a
 * click-through (like a persistent "Contact Us"), not the homepage's own
 * lead content.
 */
export function HomeHero() {
  return (
    <section className="relative w-full h-[92vh] min-h-[560px] overflow-hidden">
      <Image
        src="/images/hero.png"
        alt="Aerial view of farmland with AgroLease plot-boundary overlays"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Gradient scrim so the floating text stays legible over any part
          of the photo, without flattening the image into a solid tint. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#1b2a1e]/85 via-[#1b2a1e]/35 to-[#1b2a1e]/10"
      />

      <div className="relative z-10 h-full w-full flex flex-col items-start justify-end px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-[#f6f1e4] drop-shadow-sm">
            The Operating System for Agricultural Partnerships.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#f6f1e4]/90 max-w-xl">
            Secure your relationship with partners.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="/early-access"
              className="w-full sm:w-auto text-center rounded-full bg-brand-accent px-7 py-3.5 font-semibold text-white hover:brightness-110 transition-all"
            >
              Join Waitlist
            </Link>
            <Link
              href="/prices"
              className="w-full sm:w-auto text-center rounded-full border border-[#f6f1e4]/50 bg-[#f6f1e4]/10 px-7 py-3.5 font-semibold text-[#f6f1e4] backdrop-blur-sm hover:bg-[#f6f1e4]/20 transition-colors"
            >
              View Live Commodity Prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
