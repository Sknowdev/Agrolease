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
    <section aria-labelledby="built-for-heading" className="mt-16">
      <h2 id="built-for-heading" className="text-2xl font-semibold tracking-tight text-center">
        Built For
      </h2>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AUDIENCES.map((audience) => (
          <div
            key={audience.label}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <span className="text-2xl" aria-hidden="true">
              {audience.icon}
            </span>
            <p className="mt-2 text-sm font-medium">{audience.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
