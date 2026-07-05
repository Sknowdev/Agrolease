import { HomeHero } from '@/components/HomeHero';
import { LivePricesWidget } from '@/components/LivePricesWidget';
import { ProblemSection } from '@/components/ProblemSection';
import { LossExample } from '@/components/LossExample';
import { ConduitSection } from '@/components/ConduitSection';
import { GateToSettlement } from '@/components/GateToSettlement';
import { SecuritySection } from '@/components/SecuritySection';
import { HowItWorks } from '@/components/HowItWorks';
import { FeatureCards } from '@/components/FeatureCards';
import { WhyChooseSection } from '@/components/WhyChooseSection';
import { TrustAndSatellite } from '@/components/TrustAndSatellite';
import { BuiltForSection } from '@/components/BuiltForSection';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import { RoadmapStats } from '@/components/RoadmapStats';
import { FaqSection } from '@/components/FaqSection';
import { EarlyAccessForm } from '@/components/EarlyAccessForm';

/**
 * Each section below is a full-width <section> that manages its own inner
 * max-w container and background tone - not one shared narrow wrapper
 * around everything. That shared-wrapper pattern was the actual cause of
 * the "shrinks in the middle" complaint: no section could ever be wider
 * or visually distinct from its neighbors. Backgrounds alternate between
 * bg-background and bg-surface for visual pacing down the page.
 */
export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <LivePricesWidget />
      <ProblemSection />
      <LossExample />
      <ConduitSection />
      <GateToSettlement />
      <SecuritySection />
      <HowItWorks />
      <FeatureCards />
      <WhyChooseSection />
      <TrustAndSatellite />
      <BuiltForSection />
      <RoadmapTimeline />
      <RoadmapStats />
      <FaqSection />

      <section
        id="early-access"
        aria-labelledby="home-early-access-heading"
        className="w-full py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="eyebrow">Get Started</p>
            <h2
              id="home-early-access-heading"
              className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Get Early Access
            </h2>
            <p className="mt-3 text-foreground/70 max-w-xl mx-auto">
              Request early access and we&apos;ll notify you as AgroLease launches in your
              country.
            </p>
          </div>
          <div className="mt-8 max-w-lg mx-auto">
            <EarlyAccessForm sourcePage="/" />
          </div>
        </div>
      </section>
    </div>
  );
}
