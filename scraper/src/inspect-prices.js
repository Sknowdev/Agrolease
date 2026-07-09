#!/usr/bin/env node
import 'dotenv/config';
import { getSupabaseClient } from './lib/supabaseClient.js';

/**
 * Diagnostic CLI: dumps commodity_prices rows (optionally filtered by
 * country and/or crop) in a readable table. Written 2026-07-09 while
 * tracking down the unit-conversion bug (raw per-kg/per-pack prices
 * being written as if they were already per-tonne) - kept as a
 * permanent tool since inspecting real production data quickly is a
 * recurring need, not a one-off.
 *
 * Usage:
 *   node src/inspect-prices.js                 # all rows
 *   node src/inspect-prices.js NG               # Nigeria only
 *   node src/inspect-prices.js NG maize         # Nigeria maize only
 *
 * Respects SCRAPER_ENV=production the same way index.js does.
 */

const [countryArg, cropArg] = process.argv.slice(2);

async function main() {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('commodity_prices')
    .select(
      'country_code, crop_name, price_local, currency_code, data_date, source, source_type, entered_by, price_per_tonne, unit_raw'
    )
    .order('country_code', { ascending: true })
    .order('crop_name', { ascending: true })
    .order('data_date', { ascending: false });

  if (countryArg) query = query.eq('country_code', countryArg.toUpperCase());
  if (cropArg) query = query.eq('crop_name', cropArg);

  const { data, error } = await query;
  if (error) {
    console.error('ERROR:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`rows: ${data.length}\n`);
  for (const row of data) {
    console.log(
      `${row.country_code}\t${row.crop_name}\t${row.price_local} ${row.currency_code}\t` +
        `${row.data_date}\t${row.source_type}\t${row.entered_by}\t` +
        `ptonne=${row.price_per_tonne}\tunit=${row.unit_raw}\t${row.source}`
    );
  }
}

main();
