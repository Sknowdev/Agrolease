import { ScrollReveal } from './ScrollReveal';

const PROBLEM_CARDS = [
  {
    icon: '⚖️',
    title: 'Land Disputes',
    detail:
      'Land disputes remain a significant, recurring challenge across agricultural markets - and without a shared record, there is no evidence, only conflicting stories.',
  },
  {
    icon: '🚛',
    title: 'No Harvest Visibility',
    detail:
      'Land owners have no reliable way to verify what was actually harvested, when, or how much left the farm.',
  },
  {
    icon: '📝',
    title: 'Fragile Paperwork',
    detail:
      'Handwritten records and spreadsheet entries can be edited after the fact, with no trail showing what changed or when.',
  },
  {
    icon: '⏳',
    title: 'Slow Resolution',
    detail:
      'When a disagreement happens, resolving it can drag on for months or years - especially when the underlying documentation is incomplete.',
  },
];

/**
 * "Sell the pain, not the features." No photo per instruction - 4
 * animated cards instead, each revealing on scroll via <ScrollReveal>
 * with a staggered delay. Claims stay defensible/country-agnostic (no
 * unsourced statistics like "30% of court cases") - same standard as the
 * previous version, just restructured from a 3-stat-strip + list into 4
 * even cards.
 */
export function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">The Problem</p>
            <h2 id="problem-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              The Gap That Costs Millions
            </h2>
            <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
              Every season, agricultural relationships lose money and trust to the same
              preventable problems.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_CARDS.map((card, index) => (
            <ScrollReveal key={card.title} delayMs={index * 120}>
              <div className="glow-border rounded-2xl bg-background p-6 h-full">
                <span className="text-3xl" aria-hidden="true">
                  {card.icon}
                </span>
                <h3 className="mt-4 font-semibold text-lg">{card.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{card.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={480}>
          <p className="mt-12 text-center font-medium max-w-xl mx-auto">
            AgroLease replaces fragmented paperwork with one secure, shared system.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
