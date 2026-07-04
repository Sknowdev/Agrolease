import type { PriceSummary } from '@/lib/prices';

/**
 * Minimal inline SVG sparkline - no chart library dependency needed for
 * a simple trend line. Renders nothing when there are fewer than 2 points
 * (Task 7's "graceful empty state" requirement).
 */
export function TrendSparkline({ summary }: { summary: PriceSummary }) {
  const { history } = summary;
  if (history.length < 2) return null;

  const values = history.map((h) => h.priceLocal);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 300;
  const height = 60;
  const step = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="mt-6">
      <p className="text-sm text-foreground/60 mb-2">Last {history.length} days</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-16 text-brand-green-light"
        role="img"
        aria-label={`Price trend over the last ${history.length} days`}
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
