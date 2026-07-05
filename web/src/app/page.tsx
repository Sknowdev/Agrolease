import { HomeHero } from '@/components/HomeHero';
import { LivePricesWidget } from '@/components/LivePricesWidget';
import { ProblemSection } from '@/components/ProblemSection';
import { LossCalculator } from '@/components/LossCalculator';
import { HowItWorks } from '@/components/HowItWorks';
import { FeatureCards } from '@/components/FeatureCards';
import { WhyChooseSection } from '@/components/WhyChooseSection';
import { BuiltForSection } from '@/components/BuiltForSection';
import { PlatformPreview } from '@/components/PlatformPreview';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import { RoadmapStats } from '@/components/RoadmapStats';
import { FaqSection } from '@/components/FaqSection';
import { EarlyAccessForm } from '@/components/EarlyAccessForm';

export default function HomePage() {
  return (
    <div>
      <HomeHero />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        <LivePricesWidget />
        <ProblemSection />
        <div className="mt-12">
          <LossCalculator />
        </div>
        <HowItWorks />
        <FeatureCards />
        <WhyChooseSection />
        <BuiltForSection />
        <PlatformPreview />
        <RoadmapTimeline />
        <RoadmapStats />
        <FaqSection />

        <section
          id="early-access"
          aria-labelledby="home-early-access-heading"
          className="mt-24 sm:mt-32 mb-16"
        >
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
        </section>
      </div>
    </div>
  );
}
