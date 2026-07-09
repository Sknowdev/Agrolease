import Image from 'next/image';
import { ScrollReveal } from './ScrollReveal';

/**
 * Solution section (2026-07 redesign) - "1 illustration" per instruction.
 * Uses partnership.png (a real handshake photo between a farmer and an
 * AgroLease field rep) since it visually IS the solution statement: a
 * verified, trusted relationship replacing informal paperwork. Paired
 * with the Conduit concept from docs/AGROLEASE_PRODUCT_PLAN_V10.md
 * Section 02, kept factual (no fabricated screenshots or figures).
 */
export function SolutionSection() {
  return (
    <section aria-labelledby="solution-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 grid gap-10 lg:grid-cols-2 items-center">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-[3/4]">
            <Image
              src="/images/partnership.png"
              alt="A landowner and an AgroLease field partner shaking hands at sunset"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={150}>
          <div>
            <p className="eyebrow">The Solution</p>
            <h2 id="solution-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              One Relationship. One Conduit.
            </h2>
            <p className="mt-4 text-foreground/70 max-w-lg">
              Every feature in AgroLease exists inside or around a Conduit - one land owner, one
              farm operator, one piece of land. Each Conduit gets a permanent ID at creation that
              never changes, and is a completely isolated environment. Nothing bleeds between
              relationships.
            </p>
            <ul className="mt-6 space-y-3 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-brand-green-light" aria-hidden="true">✓</span>
                Shared agreements with clear, negotiated terms
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-brand-green-light" aria-hidden="true">✓</span>
                Tamper-evident harvest and invoice records
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-brand-green-light" aria-hidden="true">✓</span>
                A live Trust Score specific to this relationship
              </li>
            </ul>
            <a
              href="/platform"
              className="mt-8 inline-flex text-brand-green-light font-semibold hover:underline"
            >
              See how the platform works →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
