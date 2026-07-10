import { COUNTRIES } from '@/config/countries';
import { ScrollReveal } from './ScrollReveal';

/**
 * Ordered by what a visitor arriving from Google search or a grant
 * reviewer would naturally ask first, per feedback - not by how the
 * project was originally documented. "What is AgroLease" and "Who is it
 * for" now lead; the two lower-priority hardware/farm-size questions
 * from the original list are kept but pushed further down.
 *
 * The "which countries" answer is built from COUNTRIES at render time
 * instead of hardcoded here - an earlier hardcoded version went stale
 * the moment 11 countries were flipped from "coming soon" to live
 * (Kenya was still listed as "next" here after it was already live).
 */
const STATIC_FAQS = [
  {
    question: 'What is AgroLease?',
    answer:
      'AgroLease is a platform for landowners and agricultural businesses to manage leases, verify harvests, monitor market prices, and keep tamper-evident records for every transaction.',
  },
  {
    question: 'Who is AgroLease for?',
    answer:
      'Landowners, agricultural companies, farm operators, cooperatives, exporters, and processors - anyone managing a farming relationship that currently runs on paperwork or messages.',
  },
  {
    question: 'Why should I use AgroLease instead of spreadsheets or WhatsApp?',
    answer:
      'Spreadsheets and messages have no audit trail - anyone can edit them after the fact, and there is no independent record of what was agreed or delivered. AgroLease logs every important action with a timestamp, so both sides have the same evidence if a disagreement comes up.',
  },
  {
    question: 'Where do crop prices come from?',
    answer:
      'Verified government sources where a public data feed exists - for example, national statistics agencies and agriculture ministries. Where no automated feed exists yet, we publish an AgroLease market reference price instead, and label it as such.',
  },
  {
    question: 'How often are prices updated?',
    answer:
      'It depends on the country and source: some update daily, others weekly. Every price page shows exactly when it was last updated.',
  },
  {
    question: 'How does AgroLease help reduce disputes?',
    answer:
      'By replacing memory and informal messages with a shared, timestamped record - harvest logs, agreed prices, and settlement history - that both sides can point to instead of arguing about what was said.',
  },
  {
    question: 'Is AgroLease free?',
    answer:
      'Early Access is free for selected users. Commercial pricing will be announced before public launch.',
  },
  {
    question: 'Do I need special hardware?',
    answer: 'No. AgroLease works from a phone or computer - no dedicated hardware required.',
  },
  {
    question: "What happens if there's a dispute?",
    answer:
      'Every important action - agreements, harvest records, price checks - is logged with a timestamp, so you can export a clear record instead of relying on memory or messages.',
  },
  {
    question: 'When is AgroLease launching?',
    answer:
      'The live price-tracking site is available now for several countries. The full agreement and settlement platform is in development - join early access to be notified.',
  },
  {
    question: 'Do I need an account to view crop prices?',
    answer:
      "No. Daily market reference prices are publicly available. An account is only required to use AgroLease's agreement, harvest, and settlement features.",
  },
];

export function FaqSection() {
  const liveCountries = COUNTRIES.filter((c) => c.live).map((c) => c.name);
  const comingSoonCount = COUNTRIES.filter((c) => !c.live).length;

  const faqs = [
    ...STATIC_FAQS.slice(0, 9),
    {
      question: 'Which countries are supported?',
      answer:
        `Live pricing today: ${liveCountries.join(', ')}.` +
        (comingSoonCount > 0
          ? ` ${comingSoonCount} more ${comingSoonCount === 1 ? 'country is' : 'countries are'} already indexed as "coming soon."`
          : ''),
    },
    ...STATIC_FAQS.slice(9),
  ];

  return (
    <section aria-labelledby="faq-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="text-center">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delayMs={100}>
          <div className="mt-10 max-w-2xl mx-auto divide-y divide-border glow-border rounded-2xl bg-surface">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5 sm:p-6">
                <summary className="flex items-center justify-between gap-3 cursor-pointer font-medium list-none">
                  {faq.question}
                  {/* Down-facing triangle that flips to point up when expanded,
                      replacing the rotating "+" - explicit correction 2026-07-10. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 8"
                    className="w-3 h-2 shrink-0 fill-foreground/50 transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="M6 8 0 0h12z" />
                  </svg>
                </summary>
                <p className="mt-2.5 text-sm text-foreground/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
