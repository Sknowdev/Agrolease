/**
 * "Show, don't just describe" - but AgroLease's dashboard/agreement/
 * harvest-record product doesn't exist yet (only this price site does).
 * Rather than fabricate screenshots of a product that isn't built,
 * these are honestly-labeled layout sketches: CSS wireframes that convey
 * what each screen will contain, not a claim that they're real captures.
 */
const PREVIEWS = [
  {
    title: 'Dashboard',
    caption: 'Agreements, harvests, and prices in one view.',
    rows: [70, 45, 60],
  },
  {
    title: 'Harvest Record',
    caption: 'Photo evidence and timestamps per delivery.',
    rows: [50, 80, 40],
  },
  {
    title: 'Agreement Screen',
    caption: 'Shared, structured lease terms for both sides.',
    rows: [65, 65, 65],
  },
  {
    title: 'Price Page',
    caption: 'The live market reference behind every settlement.',
    rows: [85, 35, 55],
  },
];

export function PlatformPreview() {
  return (
    <section aria-labelledby="platform-preview-heading" className="mt-16">
      <div className="text-center">
        <h2 id="platform-preview-heading" className="text-2xl font-semibold tracking-tight">
          What We&apos;re Building
        </h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-lg mx-auto">
          Layout previews of the AgroLease application, currently in development. Not final
          screenshots.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PREVIEWS.map((preview) => (
          <div key={preview.title} className="rounded-xl border border-border bg-surface p-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex gap-1.5 mb-3" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
              </div>
              <div className="space-y-2" aria-hidden="true">
                {preview.rows.map((width, i) => (
                  <div
                    key={i}
                    className="h-3 rounded bg-brand-green/15"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </div>
            <h3 className="mt-3 font-semibold text-sm">{preview.title}</h3>
            <p className="mt-1 text-xs text-foreground/60">{preview.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
