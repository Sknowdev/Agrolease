const AUDIENCES = [
  { icon: '🏢', label: 'Agricultural Companies' },
  { icon: '🌾', label: 'Landowners' },
  { icon: '🚜', label: 'Farm Operators' },
  { icon: '🤝', label: 'Cooperatives' },
  { icon: '📦', label: 'Exporters' },
  { icon: '🏭', label: 'Processors' },
];

export function BuiltForSection() {
  return (
    <section aria-labelledby="built-for-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Who It&apos;s For</p>
          <h2 id="built-for-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Built For
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {AUDIENCES.map((audience) => (
            <div key={audience.label} className="glow-border rounded-2xl bg-surface p-5 text-center">
              <span className="text-2xl" aria-hidden="true">
                {audience.icon}
              </span>
              <p className="mt-2.5 text-sm font-medium">{audience.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
