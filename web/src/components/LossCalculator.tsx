'use client';

import { useState } from 'react';
import { calculatePotentialLoss } from '@/lib/lossCalculator';

/**
 * Interactive loss calculator (Task 8), made "more visual" per the
 * reviewer's suggestion #5 - a bar comparison of loss-without-AgroLease
 * vs. the much smaller variance with AgroLease, rather than only a number.
 */
export function LossCalculator() {
  const [pricePerTonne, setPricePerTonne] = useState(200);
  const [harvestTonnes, setHarvestTonnes] = useState(500);
  const [pricingErrorPercent, setPricingErrorPercent] = useState(5);

  const { totalValue, potentialLoss } = calculatePotentialLoss({
    pricePerTonne,
    harvestTonnes,
    pricingErrorPercent,
  });

  // "With AgroLease" bar: modeled as a small, bounded variance band
  // (illustrative, not a guarantee) - shown for visual contrast only.
  const withAgroleaseLoss = Math.min(potentialLoss, totalValue * 0.01);
  const maxBar = Math.max(potentialLoss, withAgroleaseLoss, 1);
  const withoutWidth = Math.max((potentialLoss / maxBar) * 100, 2);
  const withWidth = Math.max((withAgroleaseLoss / maxBar) * 100, 2);

  return (
    <section
      aria-labelledby="loss-calculator-heading"
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <h2 id="loss-calculator-heading" className="text-2xl font-semibold tracking-tight">
        See what a small pricing error actually costs
      </h2>
      <p className="mt-2 text-foreground/70">
        A 5% mistake on a mid-size harvest is rarely just a rounding error - here&apos;s what
        it looks like in real money.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground/70">Crop price per tonne ($)</span>
          <input
            type="number"
            min={0}
            value={pricePerTonne}
            onChange={(e) => setPricePerTonne(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2"
            aria-label="Crop price per tonne in US dollars"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground/70">Harvest quantity (tonnes)</span>
          <input
            type="number"
            min={0}
            value={harvestTonnes}
            onChange={(e) => setHarvestTonnes(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2"
            aria-label="Harvest quantity in tonnes"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground/70">Possible pricing error (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={pricingErrorPercent}
            onChange={(e) => setPricingErrorPercent(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2"
            aria-label="Possible pricing error percentage"
          />
        </label>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <div className="flex items-baseline justify-between text-sm mb-1">
            <span className="font-medium">Without AgroLease</span>
            <span className="font-semibold text-red-500">
              ${potentialLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })} lost
            </span>
          </div>
          <div className="h-4 rounded-full bg-red-500/20" role="img" aria-label="Loss without AgroLease bar chart">
            <div
              className="h-4 rounded-full bg-red-500"
              style={{ width: `${withoutWidth}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-sm mb-1">
            <span className="font-medium">With AgroLease</span>
            <span className="font-semibold text-brand-green-light">
              $0-${withAgroleaseLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })} variance
            </span>
          </div>
          <div
            className="h-4 rounded-full bg-brand-green-light/20"
            role="img"
            aria-label="Loss with AgroLease bar chart"
          >
            <div
              className="h-4 rounded-full bg-brand-green-light"
              style={{ width: `${withWidth}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-foreground/50">
        Illustrative comparison based on the figures you entered above. Actual results depend on
        your agreement structure and market conditions.
      </p>
    </section>
  );
}
