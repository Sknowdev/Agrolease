import Link from 'next/link';
import { HomeHero } from '@/components/HomeHero';
import { SolutionSection } from '@/components/SolutionSection';
import { ProblemSection } from '@/components/ProblemSection';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { LivePricesWidget } from '@/components/LivePricesWidget';
import { HowItWorks } from '@/components/HowItWorks';
import { RoadmapStats } from '@/components/RoadmapStats';
import { FaqSection } from '@/components/FaqSection';
import { ScrollReveal } from '@/components/ScrollReveal';

/**
 * Homepage (2026-07 cream/green redesign). Restructured per explicit
 * direction: the site is "about AgroLease" (the platform/partnership OS),
 * not "about pricing" - <LivePricesWidget> is now positioned as a
 * click-through utility mid-page (like a persistent "Contact Us"), not
 * the hero's own content. Order:
 *
 *   Hero (full-bleed image, floating headline, 2 CTAs)
 *   -> Solution (1 illustration - what AgroLease is)
 *   -> Problem (4 animated cards - why it matters)
 *   -> Feature showcase (3 images - what's in the platform)
 *   -> Live prices widget (click-through utility, not the focus)
 *   -> How It Works / Roadmap stats / FAQ
 *   -> Closing CTA
 *
 * LossExample, ConduitSection, GateToSettlement, SecuritySection,
 * WhyChooseSection, TrustAndSatellite, BuiltForSection, RoadmapTimeline
 * are not on the homepage - they now live on the dedicated /platform
 * narrative page instead (see web/src/app/platform/page.tsx).
 */
export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <SolutionSection />
      <ProblemSection />
      <FeatureShowcase />
      <LivePricesWidget />
      <HowItWorks />
      <RoadmapStats />
      <FaqSection />

      <section aria-labelledby="home-cta-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 text-center">
          <ScrollReveal>
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
              className="mt-8 inline-flex rounded-full bg-brand-accent px-8 py-3.5 font-semibold text-white hover:brightness-110 transition-all"
            >
              Join Waitlist
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
