import { ScrollReveal } from './ScrollReveal';

const DECREASES = ['Disputes raised', 'Late payments', 'Rejected invoices', 'Audit flags on records'];
const INCREASES = ['Payment speed', 'Clean invoice approvals', 'Consistent guard approvals', 'No disputes over time'];

const SIGNALS = [
  'Abnormal crop decline',
  'Flooding detected over the farm boundary',
  'Harvesting activity - a rapid vegetation drop',
  'Field abandonment - extended inactivity',
];

/**
 * Grounded in docs/AGROLEASE_PRODUCT_PLAN_V10.md Sections 15 (Satellite &
 * Weather, an optional add-on layer) and 17 (Trust Score). Trust Score is
 * part of MVP scope; Satellite is explicitly deferred post-MVP in the
 * product plan. Framed here as planned, not live - nothing in AgroLease
 * has been built yet, so this section describes the design, not a
 * working feature.
 */
export function TrustAndSatellite() {
  return (
    <section aria-labelledby="trust-satellite-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">Planned</p>
            <h2 id="trust-satellite-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Behavior and Visibility, Not Opinions
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <ScrollReveal>
            <div className="glow-border rounded-2xl bg-background p-6 sm:p-8 h-full">
              <h3 className="font-semibold text-lg">Trust Score</h3>
              <p className="mt-2 text-sm text-foreground/70">
                A live rating reflecting how both parties have behaved inside one specific Conduit -
                calculated only from verified platform events. No opinions, no reviews. A poor score
                on one Conduit is never inherited by another.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-red-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-500">Decreases</p>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                    {DECREASES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-brand-green-light/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-green-light">
                    Increases
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                    {INCREASES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={150}>
            <div className="glow-border rounded-2xl bg-background p-6 sm:p-8 h-full">
              <h3 className="font-semibold text-lg">Satellite & Weather</h3>
              <span className="mt-1 inline-block rounded-full bg-brand-accent/20 text-brand-accent px-2.5 py-0.5 text-xs font-semibold uppercase">
                Planned add-on
              </span>
              <p className="mt-3 text-sm text-foreground/70">
                An optional layer for land owners: crop-health imagery and hyper-local rainfall
                records over the farm boundary. If a farm operator claims the crop failed, this is
                objective evidence to check that claim against.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground/70">
                {SIGNALS.map((signal) => (
                  <li key={signal} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-foreground/40 shrink-0" aria-hidden="true" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
