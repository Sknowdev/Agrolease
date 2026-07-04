/**
 * Formats a trend percentage for display, e.g. 3.14159 -> "+3.1%".
 * Returns null passthrough so callers can decide how to render "no trend yet".
 */
export function formatTrendPercent(trendPercent: number | null): string | null {
  if (trendPercent === null || !Number.isFinite(trendPercent)) return null;
  const sign = trendPercent > 0 ? '+' : '';
  return `${sign}${trendPercent.toFixed(1)}%`;
}

export function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatUpdatedTimestamp(dataDate: string): string {
  const date = new Date(`${dataDate}T00:00:00Z`);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
