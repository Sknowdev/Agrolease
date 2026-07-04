import { describe, it, expect } from 'vitest';
import { calculatePotentialLoss } from './lossCalculator';

describe('calculatePotentialLoss', () => {
  it('matches the example in the product brief: $200/t x 500t x 5% = $5,000', () => {
    const result = calculatePotentialLoss({
      pricePerTonne: 200,
      harvestTonnes: 500,
      pricingErrorPercent: 5,
    });
    expect(result.totalValue).toBe(100000);
    expect(result.potentialLoss).toBe(5000);
  });

  it('returns zero loss when the error percentage is zero', () => {
    const result = calculatePotentialLoss({
      pricePerTonne: 200,
      harvestTonnes: 500,
      pricingErrorPercent: 0,
    });
    expect(result.potentialLoss).toBe(0);
  });

  it('treats negative or non-finite inputs as zero instead of throwing', () => {
    const result = calculatePotentialLoss({
      pricePerTonne: -50,
      harvestTonnes: NaN,
      pricingErrorPercent: 5,
    });
    expect(result.totalValue).toBe(0);
    expect(result.potentialLoss).toBe(0);
  });

  it('scales linearly with harvest size', () => {
    const small = calculatePotentialLoss({
      pricePerTonne: 200,
      harvestTonnes: 100,
      pricingErrorPercent: 5,
    });
    const large = calculatePotentialLoss({
      pricePerTonne: 200,
      harvestTonnes: 1000,
      pricingErrorPercent: 5,
    });
    expect(large.potentialLoss).toBe(small.potentialLoss * 10);
  });
});
