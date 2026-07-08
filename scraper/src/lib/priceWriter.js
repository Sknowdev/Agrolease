import { getSupabaseClient } from './supabaseClient.js';

/**
 * Writes one scraped price row into commodity_prices, following the
 * skip-if-unchanged rule from ABS Section 1's scraper bot spec:
 * if today's price for this country+crop already matches the latest
 * stored price, skip the insert and log "no change" instead of writing
 * a duplicate row.
 *
 * @param {object} price
 * @param {string} price.countryCode   e.g. "NG"
 * @param {string} price.cropName      e.g. "maize"
 * @param {number} price.priceLocal    price in local currency per tonne
 * @param {string} price.currencyCode  e.g. "NGN"
 * @param {string} price.dataDate      ISO date string, "YYYY-MM-DD"
 * @param {string} price.source        human-readable source name, e.g. "FMARD"
 * @param {'reported'|'estimated'} [price.sourceType] "reported" (default) for
 *        real field observations, "estimated" for ML-filled series like
 *        World Bank RTFP - drives which trust badge the UI renders.
 * @param {number|null} [price.pricePerTonne] normalized price-per-tonne,
 *        from lib/price-normalize.js's toPricePerTonne() - null when the
 *        unit isn't weight-based (never a guessed conversion).
 * @param {string|null} [price.unitRaw] the unit exactly as reported, e.g. "2.5 KG"
 * @param {'weight'|'volume'|'count'|null} [price.unitType] from classifyUnitType()
 * @returns {Promise<{ inserted: boolean, reason?: string }>}
 */
export async function writeCommodityPrice(price) {
  const supabase = getSupabaseClient();
  const {
    countryCode,
    cropName,
    priceLocal,
    currencyCode,
    dataDate,
    source,
    // Added for the Daily/Weekly Price feature (2026-07-07): source_type
    // distinguishes real field observations ('reported', the default -
    // every existing scraper module keeps working unchanged) from
    // World Bank RTFP's ML-filled weekly estimates ('estimated'). See
    // supabase/migrations/0003_add_price_normalization_columns.sql.
    sourceType = 'reported',
    pricePerTonne = null,
    unitRaw = null,
    unitType = null,
  } = price;

  const { data: latest, error: fetchError } = await supabase
    .from('commodity_prices')
    .select('id, price_local, data_date')
    .eq('country_code', countryCode)
    .eq('crop_name', cropName)
    .order('data_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `Failed to check latest price for ${countryCode}/${cropName}: ${fetchError.message}`
    );
  }

  if (
    latest &&
    latest.data_date === dataDate &&
    Number(latest.price_local) === Number(priceLocal)
  ) {
    return { inserted: false, reason: 'no_change' };
  }

  const exchangeRate = await getExchangeRateToUsd(currencyCode);
  const priceUsd = exchangeRate ? Number(priceLocal) * exchangeRate : null;

  const { error: insertError } = await supabase.from('commodity_prices').insert({
    country_code: countryCode,
    crop_name: cropName,
    price_local: priceLocal,
    currency_code: currencyCode,
    price_usd: priceUsd,
    exchange_rate: exchangeRate,
    source,
    data_date: dataDate,
    entered_by: 'scraper',
    source_type: sourceType,
    price_per_tonne: pricePerTonne,
    unit_raw: unitRaw,
    unit_type: unitType,
  });

  if (insertError) {
    throw new Error(`Failed to insert price for ${countryCode}/${cropName}: ${insertError.message}`);
  }

  return { inserted: true };
}

/**
 * Looks up today's USD exchange rate for a currency from exchange_rates.
 * Returns null (rather than throwing) if no rate is available yet -
 * price_usd is a nice-to-have, not a blocker for showing the local price.
 */
async function getExchangeRateToUsd(currencyCode) {
  if (currencyCode === 'USD') return 1;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('base_currency', 'USD')
    .eq('target_currency', currencyCode)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  // exchange_rates stores USD -> target rate; invert to get target -> USD
  return data.rate ? 1 / Number(data.rate) : null;
}

/**
 * Writes one row to scraper_run_logs so the admin panel (built later) can
 * show "last run / last success / failures" per ABS Section 1's admin
 * price panel spec.
 */
export async function logScraperRun({ source, status, rowsWritten, rowsSkipped, error }) {
  // Wraps the ENTIRE operation (including getSupabaseClient(), which
  // throws synchronously if credentials are missing) in a try/catch.
  // A logging failure - including "no .env configured yet", which is the
  // very first thing a fresh clone of this repo will hit - must never
  // crash the scraper run itself.
  try {
    const supabase = getSupabaseClient();
    const { error: insertError } = await supabase.from('scraper_run_logs').insert({
      source,
      status,
      rows_written: rowsWritten,
      rows_skipped: rowsSkipped,
      error: error ? String(error.message || error) : null,
    });

    if (insertError) {
      console.error(`[scraper_run_logs] failed to write log row: ${insertError.message}`);
    }
  } catch (loggingError) {
    console.error(`[scraper_run_logs] skipped: ${loggingError.message}`);
  }
}
