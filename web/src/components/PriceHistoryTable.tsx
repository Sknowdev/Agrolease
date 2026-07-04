import type { PriceSummary } from '@/lib/prices';
import { formatCurrency, formatUpdatedTimestamp } from '@/lib/trend';

/**
 * "Price History" page component, per the reviewer's suggested addition.
 * Shows Today / Yesterday / Last Week / Last Month when that much history
 * exists; gracefully collapses when it doesn't (e.g. right after launch,
 * before 30 days of scraped data has accumulated).
 */
export function PriceHistoryTable({
  summary,
  currencySymbol,
}: {
  summary: PriceSummary;
  currencySymbol: string;
}) {
  const { history } = summary;
  if (history.length < 2) return null;

  const latest = history[history.length - 1];
  const latestDate = new Date(`${latest.dataDate}T00:00:00Z`);

  function findClosestTo(daysAgo: number) {
    const target = new Date(latestDate);
    target.setDate(target.getDate() - daysAgo);
    // history is ascending; find the last entry on or before the target date
    const candidates = history.filter((h) => new Date(`${h.dataDate}T00:00:00Z`) <= target);
    return candidates[candidates.length - 1] ?? null;
  }

  const rows = [
    { label: 'Today', point: latest },
    { label: 'Yesterday', point: findClosestTo(1) },
    { label: 'Last Week', point: findClosestTo(7) },
    { label: 'Last Month', point: findClosestTo(30) },
  ].filter((row, index) => index === 0 || (row.point && row.point.id !== latest.id));

  if (rows.length < 2) return null;

  return (
    <section aria-labelledby="price-history-heading" className="mt-8">
      <h2 id="price-history-heading" className="text-xl font-semibold tracking-tight">
        Price History
      </h2>
      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {rows.map(({ label, point }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-sm text-foreground/60">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">
              {point ? formatCurrency(point.priceLocal, currencySymbol) : '—'}
            </dd>
            {point && (
              <p className="text-xs text-foreground/50 mt-1">{formatUpdatedTimestamp(point.dataDate)}</p>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
