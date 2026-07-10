import { ScrollReveal } from './ScrollReveal';

const STAGES = [
  {
    number: 1,
    title: 'Link',
    detail:
      'Either party generates a link code. Guards enter it without creating an account - they are identities waiting for approval, and cannot log anything yet.',
  },
  {
    number: 2,
    title: 'Attach',
    detail:
      'The side that linked the guard attaches them to the Conduit. One link, multiple Conduits - no re-linking needed.',
  },
  {
    number: 3,
    title: 'Approve',
    detail:
      'The other side is notified and must approve before the guard can log a single record. The other side always has the final say.',
  },
];

/**
 * Grounded in docs/AGROLEASE_PRODUCT_PLAN_V10.md Section 05 and the
 * Engineering Constitution's security rule: "Security officers are
 * approved by both parties before logging a single record... cannot be
 * bypassed." This three-stage system is why harvest records can be
 * trusted - it prevents either side from planting an unapproved guard to
 * manipulate logs.
 */
export function SecuritySection() {
  return (
    <section id="security" aria-labelledby="security-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">Security Officer System</p>
            <h2 id="security-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Three Stages. Zero Unapproved Access.
            </h2>
            <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
              Both parties must clear every guard before they can create a single record -
              preventing either side from planting someone to manipulate harvest logs.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STAGES.map((stage, index) => (
            <ScrollReveal key={stage.number} delayMs={index * 130}>
              <div className="glow-border rounded-2xl bg-background p-6 text-center">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-brand-green text-white font-semibold">
                  {stage.number}
                </span>
                <h3 className="mt-3 font-semibold">{stage.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{stage.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={420}>
          <p className="mt-8 text-center text-sm text-foreground/60 max-w-lg mx-auto">
            Guards can be locked instantly by either party in an emergency. Unlocking or fully
            revoking access always requires both sides to agree.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
