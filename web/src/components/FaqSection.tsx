const FAQS = [
  {
    question: 'Where do prices come from?',
    answer:
      'Verified government sources where a public data feed exists - for example, national statistics agencies and agriculture ministries. Where no automated feed exists yet, we publish an AgroLease market reference price instead, and label it as such.',
  },
  {
    question: 'Can small farms use AgroLease?',
    answer:
      'Yes. AgroLease is built for individual farmers and landowners as much as cooperatives, exporters, and processors - there is no minimum farm size.',
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
      'The live price-tracking site is available now for Nigeria, Ghana, South Africa, Brazil, and the UK. The full agreement and settlement platform is in development - join early access to be notified.',
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-center">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 max-w-2xl mx-auto divide-y divide-border rounded-xl border border-border bg-surface">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group p-4 sm:p-5">
            <summary className="flex items-center justify-between gap-3 cursor-pointer font-medium list-none">
              {faq.question}
              <span className="text-foreground/40 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-2.5 text-sm text-foreground/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
