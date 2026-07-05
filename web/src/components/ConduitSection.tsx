const CONTENTS = [
  { icon: '🆔', label: 'Permanent ID', detail: 'Set at creation. Never changes.' },
  { icon: '🤝', label: 'Agreement', detail: 'Share percentage, deadlines, and fees.' },
  { icon: '🚛', label: 'Harvest Records', detail: 'Every truck in and out, tamper-evident.' },
  { icon: '🧾', label: 'Invoices', detail: 'Generated per harvest, negotiated inside.' },
  { icon: '🛡️', label: 'Security Officers', detail: 'Assigned per Conduit, approved by both sides.' },
  { icon: '⭐', label: 'Trust Score', detail: 'A live rating specific to this relationship.' },
];

/**
 * Grounded in docs/AGROLEASE_PRODUCT_PLAN_V10.md Section 02. A Conduit is
 * the core unit of the platform: one land owner + one farm operator + one
 * piece of land. Kept to what's actually documented - no pricing figures
 * (the $250/year detail lives in the product plan, not the marketing
 * site) and no fabricated screenshots.
 */
export function ConduitSection() {
  return (
    <section id="conduit" aria-labelledby="conduit-heading" className="w-full py-20 sm:py-28 bg-surface border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">The Core Unit</p>
          <h2 id="conduit-heading" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            One Relationship. One Conduit.
          </h2>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Every feature in AgroLease exists inside or around a Conduit - one land owner, one
            farm operator, one piece of land. Each Conduit gets a permanent ID at creation that
            never changes, and each is a completely isolated environment. Nothing bleeds between
            them.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="glow-border rounded-2xl bg-background px-6 py-4">
            <p className="text-sm font-semibold">Land Owner</p>
          </div>
          <span className="text-2xl text-foreground/40" aria-hidden="true">
            +
          </span>
          <div className="glow-border rounded-2xl bg-background px-6 py-4">
            <p className="text-sm font-semibold">Farm Operator</p>
          </div>
          <span className="text-2xl text-foreground/40" aria-hidden="true">
            +
          </span>
          <div className="glow-border rounded-2xl bg-background px-6 py-4">
            <p className="text-sm font-semibold">One Piece of Land</p>
          </div>
          <span className="text-2xl text-foreground/40" aria-hidden="true">
            =
          </span>
          <div className="rounded-2xl border-2 border-brand-green-light bg-brand-green/10 px-6 py-4">
            <p className="text-sm font-semibold">One Conduit</p>
            <p className="mt-0.5 text-xs font-mono text-brand-green-light">CON-NG-000184</p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENTS.map((item) => (
            <div key={item.label} className="glow-border rounded-2xl bg-background p-5">
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="mt-2.5 font-semibold text-sm">{item.label}</h3>
              <p className="mt-1 text-xs text-foreground/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
