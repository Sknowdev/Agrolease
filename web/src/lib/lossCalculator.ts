/**
 * Interactive loss calculator logic (marketing funnel, Task 8).
 *
 * Pure function, no side effects, so it can be unit tested and reused by
 * both the client component and any future server-rendered example.
 */
export interface LossCalculatorInput {
  pricePerTonne: number;
  harvestTonnes: number;
  pricingErrorPercent: number; // e.g. 5 for "5%"
}

export interface LossCalculatorResult {
  totalValue: number;
  potentialLoss: number;
}

export function calculatePotentialLoss({
  pricePerTonne,
  harvestTonnes,
  pricingErrorPercent,
}: LossCalculatorInput): LossCalculatorResult {
  const safePricePerTonne = Number.isFinite(pricePerTonne) && pricePerTonne > 0 ? pricePerTonne : 0;
  const safeHarvestTonnes = Number.isFinite(harvestTonnes) && harvestTonnes > 0 ? harvestTonnes : 0;
  const safeErrorPercent =
    Number.isFinite(pricingErrorPercent) && pricingErrorPercent > 0 ? pricingErrorPercent : 0;

  const totalValue = safePricePerTonne * safeHarvestTonnes;
  const potentialLoss = totalValue * (safeErrorPercent / 100);

  return { totalValue, potentialLoss };
}
