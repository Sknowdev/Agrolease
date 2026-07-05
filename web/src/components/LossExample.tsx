import { calculatePotentialLoss } from '@/lib/lossCalculator';

// Fixed, illustrative figures - not a live calculator. A mid-size harvest,
// a middling crop price, and a modest 5% pricing/weight discrepancy.
const EXAMPLE = { pricePerTonne: 200, harvestTonnes: 500, pricingErrorPercent: 5 };

/**
 * A single static example of what a small pricing/weight error costs in
 * real money - replaces the previous interactive calculator per feedback
 * (kept the pure calculation function from lib/lossCalculator.ts, just
 * removed the editable inputs and visual bar comparison in favor of one
 * plain worked example).
 */
export function LossExample() {
  const { totalValue, potentialLoss } = calculatePotentialLoss(EXAMPLE);

  return (
    <section aria-labelledby="loss-example-heading" className="w-full py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 glow-border rounded-2xl bg-surface p-6 sm:p-10">
        <p className="eyebrow">The Cost of Guessing</p>
        <h2 id="loss-example-heading" className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">
          A small pricing error adds up fast
        </h2>

        <p className="mt-4 text-foreground/80">
          {EXAMPLE.harvestTonnes.toLocaleString('en-US')} tonnes at $
          {EXAMPLE.pricePerTonne}/tonne is a $
          {totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} harvest. A{' '}
          {EXAMPLE.pricingErrorPercent}% pricing or weight discrepancy - the kind that slips in
          through a handwritten record or an unverified scale reading - is{' '}
          <strong className="text-foreground">
            ${potentialLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </strong>{' '}
          lost, unnoticed, on a single harvest.
        </p>

        <p className="mt-4 text-sm text-foreground/60">
          Illustrative example. Actual exposure depends on harvest size, agreement terms, and how
          records are kept.
        </p>
      </div>
    </section>
  );
}
