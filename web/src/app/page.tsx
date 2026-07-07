import Link from 'next/link';
import { HomeHero } from '@/components/HomeHero';
import { LivePricesWidget } from '@/components/LivePricesWidget';
import { ProblemSection } from '@/components/ProblemSection';
import { HowItWorks } from '@/components/HowItWorks';
import { FeatureCards } from '@/components/FeatureCards';
import { FaqSection } from '@/components/FaqSection';

/**
 * Trimmed down significantly per feedback ("too long"). Cut sections:
 * LossExample, ConduitSection, GateToSettlement, SecuritySection,
 * WhyChooseSection, TrustAndSatellite, BuiltForSection, RoadmapTimeline,
 * RoadmapStats. None were deleted from the codebase - only unhooked from
 * the homepage - so they can be brought back or moved to a dedicated
 * /about or /platform page later if wanted.
 *
 * The Early Access form itself is no longer embedded here - it already
 * has its own full page at /early-access. This section is just a CTA
 * that links there, so "Get Started" doesn't show a form until someone
 * actually clicks through, per feedback.
 */
export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <LivePricesWidget />
      <ProblemSection />
      <HowItWorks />
      <FeatureCards />
      <FaqSection />

      <section aria-labelledby="home-cta-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="eyebrow">Get Started</p>
          <h2 id="home-cta-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to try AgroLease?
          </h2>
          <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
            Request early access and we&apos;ll notify you as AgroLease launches in your
            country.
          </p>
          <Link
            href="/early-access"
            className="mt-8 inline-flex rounded-full bg-brand-accent px-8 py-3.5 font-semibold text-black hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
