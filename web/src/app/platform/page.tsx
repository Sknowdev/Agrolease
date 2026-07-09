import type { Metadata } from 'next';
import Link from 'next/link';
import { ConduitSection } from '@/components/ConduitSection';
import { SecuritySection } from '@/components/SecuritySection';
import { GateToSettlement } from '@/components/GateToSettlement';
import { TrustAndSatellite } from '@/components/TrustAndSatellite';
import { ScrollReveal } from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: 'The Platform',
  description:
    'How AgroLease actually moves a deal from handshake to settlement - Conduits, security officers, gate-to-settlement records, and Trust Score.',
  alternates: { canonical: '/platform' },
};

/**
 * Dedicated "/platform" page (2026-07 redesign decision - see chat: user
 * gave creative license, agent chose a guided-narrative page over folding
 * this into the homepage). Reuses the four previously-orphaned sections
 * (ConduitSection, SecuritySection, GateToSettlement, TrustAndSatellite)
 * that existed in the codebase but weren't linked from any page - nothing
 * was rebuilt from scratch, just given a home and a narrative frame.
 */
export default function PlatformPage() {
  return (
    <div>
      <section className="w-full pt-28 pb-20 sm:pt-32 sm:pb-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 text-center">
          <ScrollReveal>
            <p className="eyebrow">The Platform</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              From Handshake to Settlement
            </h1>
            <p className="mt-5 text-lg text-foreground/70 max-w-2xl mx-auto">
              Every deal on AgroLease moves through the same four stages - a Conduit that isolates
              the relationship, security officers who guard the records, a gate process that
              seals every truck, and a Trust Score built entirely from verified behavior.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <ConduitSection />
      <SecuritySection />
      <GateToSettlement />
      <TrustAndSatellite />

      <section className="w-full py-20 sm:py-28 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to see it on your farm?
            </h2>
            <p className="mt-3 text-foreground/70">
              Join the waitlist and we&apos;ll notify you as AgroLease launches in your country.
            </p>
            <Link
              href="/early-access"
              className="mt-7 inline-flex rounded-full bg-brand-accent px-7 py-3.5 font-semibold text-white hover:brightness-110 transition-all"
            >
              Join Waitlist
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
