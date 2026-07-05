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
    <section aria-labelledby="why-choose-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Why AgroLease</p>
          <h2 id="why-choose-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Why Companies Choose AgroLease
          </h2>
        </div>
        <ul className="mt-8 grid gap-3.5 sm:grid-cols-2 max-w-2xl mx-auto text-lg">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-foreground/80">
              <span className="mt-1 text-brand-green-light" aria-hidden="true">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
