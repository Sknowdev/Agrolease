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
 * @returns {Promise<{ inserted: boolean, reason?: string }>}
 */
export async function writeCommodityPrice(price) {
  const supabase = getSupabaseClient();
  const { countryCode, cropName, priceLocal, currencyCode, dataDate, source } = price;

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
  const supabase = getSupabaseClient();
  const { error: insertError } = await supabase.from('scraper_run_logs').insert({
    source,
    status,
    rows_written: rowsWritten,
    rows_skipped: rowsSkipped,
    error: error ? String(error.message || error) : null,
  });

  if (insertError) {
    // Don't let a logging failure crash the scraper run itself.
    console.error(`[scraper_run_logs] failed to write log row: ${insertError.message}`);
  }
}
