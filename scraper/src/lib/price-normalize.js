/**
 * Crop-agnostic price normalization utilities. Applied at ingest time
 * (inside scraper source modules, before writeCommodityPrice), not on
 * page render - so the DB always stores both the raw reported value and
 * the normalized per-tonne value.
 *
 * Keys off the unit string, not the commodity name, so it works
 * identically for any crop.
 */

const WEIGHT_UNIT_RE = /^(\d+(?:\.\d+)?)?\s*(kg|g)$/i;
const VOLUME_UNIT_RE = /^(\d+(?:\.\d+)?)?\s*(l|litre|liter)s?$/i;

/**
 * Density lookup for the small set of liquid commodities this project
 * actually tracks (currently just palm oil, for Cameroon/Ivory Coast).
 * This is NOT a price guess - density is a fixed physical property of
 * the substance, not a market value that changes day to day, so citing
 * one fixed, sourced constant here is a different category of decision
 * than fabricating a price. Value taken from published food-science /
 * conversion references (~0.90-0.91 kg per litre for palm oil at room
 * temperature - see e.g. convertlitertokg.com, kilosinlitres.com, and
 * academic density tables for edible oils, all converging on the same
 * ~0.90 figure). Added 2026-07-09 after the user asked why Cameroon/
 * Ivory Coast palm oil showed no price - WFP reports it in litres, and
 * this project's standing rule is to never guess a conversion for a
 * non-weight unit UNLESS a real, fixed, citable factor exists. For
 * every other volume-based commodity not listed here, the old
 * behavior (return null, skip the row) still applies - this map must
 * only ever contain commodities with a genuinely well-established,
 * sourced density, never an assumed one.
 */
const LITRE_TO_KG_DENSITY = {
  'palm-oil': 0.9,
};

/**
 * Converts a price for a given unit string into a price-per-metric-tonne
 * figure. Returns null (not a guess) when the unit isn't weight-based -
 * per the planning doc, there is no safe density/weight assumption for
 * units like "L", "Loaf", "Bunch", "Piece", so we must not invent a
 * conversion factor for those.
 *
 * Examples:
 *   toPricePerTonne(100, 'KG')      -> 100000   (100 * 1000)
 *   toPricePerTonne(250, '2.5 KG')  -> 100000   (250 / 2.5 * 1000)
 *   toPricePerTonne(50, '400 G')    -> 125000   (50 / 0.4 * 1000)
 *   toPricePerTonne(10, 'L')        -> null      (not weight-based)
 *   toPricePerTonne(10, 'garbage')  -> null      (unrecognized unit)
 */
export function toPricePerTonne(price, unit, { cropSlug } = {}) {
  if (!Number.isFinite(price) || price <= 0) return null;
  if (typeof unit !== 'string') return null;

  const weightMatch = unit.trim().match(WEIGHT_UNIT_RE);
  if (weightMatch) {
    const [, amountStr, unitWord] = weightMatch;
    const amount = amountStr ? parseFloat(amountStr) : 1;
    if (!Number.isFinite(amount) || amount <= 0) return null;

    const kg = unitWord.toLowerCase() === 'g' ? amount / 1000 : amount;
    if (kg <= 0) return null;

    return (price / kg) * 1000;
  }

  // Volume -> weight, only for commodities with a real, fixed, sourced
  // density (see LITRE_TO_KG_DENSITY above) - every other volume unit
  // still correctly returns null rather than guessing.
  const volumeMatch = unit.trim().match(VOLUME_UNIT_RE);
  if (volumeMatch && cropSlug && LITRE_TO_KG_DENSITY[cropSlug]) {
    const [, amountStr] = volumeMatch;
    const litres = amountStr ? parseFloat(amountStr) : 1;
    if (!Number.isFinite(litres) || litres <= 0) return null;

    const kg = litres * LITRE_TO_KG_DENSITY[cropSlug];
    if (kg <= 0) return null;

    return (price / kg) * 1000;
  }

  return null;
}

/**
 * Classifies a unit string into one of the three DB unit_type buckets.
 * Used to decide whether a row is eligible for per-tonne comparison
 * views, independent of whether toPricePerTonne() actually succeeded
 * (e.g. an unparseable weight string is still unit_type 'weight', just
 * with a null price_per_tonne).
 */
export function classifyUnitType(unit) {
  if (typeof unit !== 'string') return 'count';
  const normalized = unit.trim().toLowerCase();

  if (/\b(kg|g|kilogram|gram)\b/.test(normalized)) return 'weight';
  if (/\b(l|litre|liter)\b/.test(normalized)) return 'volume';
  return 'count'; // loaf, bunch, piece, pcs, head, unit, day, etc.
}
