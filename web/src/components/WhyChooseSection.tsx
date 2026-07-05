const BENEFITS = [
  'Reduce settlement disputes',
  'Eliminate spreadsheet errors',
  'Secure digital agreements',
  'Transparent harvest valuation',
  'Faster payment workflows',
  'Better audit readiness',
];

export function WhyChooseSection() {
  return (
    <section aria-labelledby="why-choose-heading" className="mt-16">
      <h2 id="why-choose-heading" className="text-2xl font-semibold tracking-tight text-center">
        Why Companies Choose AgroLease
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 max-w-xl mx-auto">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-foreground/80">
            <span className="mt-0.5 text-brand-green-light" aria-hidden="true">
              ✓
            </span>
            {benefit}
          </li>
        ))}
      </ul>
    </section>
  );
}
