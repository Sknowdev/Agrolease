import { describe, it, expect } from 'vitest';
import { formatTrendPercent, formatCurrency, formatUpdatedTimestamp } from './trend';

describe('formatTrendPercent', () => {
  it('adds a plus sign and one decimal place for positive trends', () => {
    expect(formatTrendPercent(3.14159)).toBe('+3.1%');
  });

  it('keeps the minus sign for negative trends', () => {
    expect(formatTrendPercent(-2.4)).toBe('-2.4%');
  });

  it('returns null when there is not enough data', () => {
    expect(formatTrendPercent(null)).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('formats with the given currency symbol and thousands separators', () => {
    expect(formatCurrency(2850, '₵')).toBe('₵2,850');
  });
});

describe('formatUpdatedTimestamp', () => {
  it('formats an ISO date as a readable date', () => {
    expect(formatUpdatedTimestamp('2026-07-03')).toBe('July 03, 2026');
  });
});
