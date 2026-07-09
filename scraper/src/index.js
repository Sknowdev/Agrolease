#!/usr/bin/env node
import { logScraperRun } from './lib/priceWriter.js';
import { scrapeNigeria } from './sources/nigeria-nbs.js';
import { scrapeGhana } from './sources/ghana.js';
import { scrapeSouthAfrica } from './sources/south-africa.js';
import { scrapeBrazil } from './sources/brazil.js';
import { scrapeUk } from './sources/uk-defra.js';
import { makeWfpScraper, makeWfpCropScraper } from './sources/wfp-food-prices.js';
import { makeRtfpScraper } from './sources/rtfp-worldbank.js';
import { fetchRainfallForAllCountries, COUNTRY_COORDINATES } from './sources/rainfall-openmeteo.js';

/**
 * CLI runner for the AgroLease scraper. Dispatches to one source module
 * per --source flag, or runs all of them with --source=all.
 *
 *   node src/index.js --source=nigeria
 *   node src/index.js --source=all
 *   node src/index.js --help
 *
 * This file was missing from the initial scaffold even though
 * scraper/package.json already referenced it in every npm script - see
 * web_progress.md for why (a mid-session tooling/terminal breakdown cut
 * the previous session off before it was written).
 */

const SOURCES = {
  nigeria: { label: 'Nigeria (NBS Food Price Tracking)', run: scrapeNigeria },
  // BUG FIX (2026-07-09): Nigeria's "yam" crop was mapped in
  // wfp-food-prices.js's COUNTRY_CROP_MAP back on 2026-07-08, but no
  // CLI source ever actually ran the WFP scraper for Nigeria (the
  // 'nigeria' key above only runs the NBS dataset, which doesn't cover
  // yam) - so this mapping was dead code and the /prices/nigeria/yam
  // page always showed "not available." This entry runs WFP for just
  // the yam crop, leaving NBS as Nigeria's primary source for
  // maize/rice/sorghum/soybeans untouched.
  'nigeria-yam': { label: 'Nigeria - Yam (WFP Global Food Prices)', run: makeWfpCropScraper('NG', 'yam') },
  ghana: { label: 'Ghana (admin-entered, no public feed)', run: scrapeGhana },
  'south-africa': { label: 'South Africa (admin-entered, no public feed)', run: scrapeSouthAfrica },
  brazil: { label: 'Brazil (admin-entered, no public feed)', run: scrapeBrazil },
  uk: { label: 'United Kingdom (DEFRA)', run: scrapeUk },
  // Next-wave countries, all backed by the same WFP Global Food Prices
  // dataset (see sources/wfp-food-prices.js) - one shared CSV download,
  // one module, real per-country crop mappings verified against the live
  // data (not every configured crop is covered - see that file's
  // COUNTRY_CROP_MAP for exactly what is/isn't scraped per country).
  kenya: { label: 'Kenya (WFP Global Food Prices)', run: makeWfpScraper('KE') },
  ethiopia: { label: 'Ethiopia (WFP Global Food Prices)', run: makeWfpScraper('ET') },
  tanzania: { label: 'Tanzania (WFP Global Food Prices)', run: makeWfpScraper('TZ') },
  uganda: { label: 'Uganda (WFP Global Food Prices)', run: makeWfpScraper('UG') },
  rwanda: { label: 'Rwanda (WFP Global Food Prices)', run: makeWfpScraper('RW') },
  cameroon: { label: 'Cameroon (WFP Global Food Prices)', run: makeWfpScraper('CM') },
  'ivory-coast': { label: 'Ivory Coast (WFP Global Food Prices)', run: makeWfpScraper('CI') },
  senegal: { label: 'Senegal (WFP Global Food Prices)', run: makeWfpScraper('SN') },
  mozambique: { label: 'Mozambique (WFP Global Food Prices)', run: makeWfpScraper('MZ') },
  egypt: { label: 'Egypt (WFP Global Food Prices)', run: makeWfpScraper('EG') },
  mali: { label: 'Mali (WFP Global Food Prices)', run: makeWfpScraper('ML') },
  'burkina-faso': { label: 'Burkina Faso (WFP Global Food Prices)', run: makeWfpScraper('BF') },
  // World Bank RTFP "estimated" weekly series - written alongside the
  // WFP monthly "reported" number (source_type distinguishes them), not
  // replacing it. Only the 9 countries verified to have real RTFP
  // coverage get an entry here - see sources/rtfp-worldbank.js.
  'kenya-rtfp': { label: 'Kenya (World Bank RTFP, estimated)', run: makeRtfpScraper('KE') },
  'nigeria-rtfp': { label: 'Nigeria (World Bank RTFP, estimated)', run: makeRtfpScraper('NG') },
  'ethiopia-rtfp': { label: 'Ethiopia (World Bank RTFP, estimated)', run: makeRtfpScraper('ET') },
  'uganda-rtfp': { label: 'Uganda (World Bank RTFP, estimated)', run: makeRtfpScraper('UG') },
  'cameroon-rtfp': { label: 'Cameroon (World Bank RTFP, estimated)', run: makeRtfpScraper('CM') },
  'senegal-rtfp': { label: 'Senegal (World Bank RTFP, estimated)', run: makeRtfpScraper('SN') },
  'mozambique-rtfp': { label: 'Mozambique (World Bank RTFP, estimated)', run: makeRtfpScraper('MZ') },
  'mali-rtfp': { label: 'Mali (World Bank RTFP, estimated)', run: makeRtfpScraper('ML') },
  'burkina-faso-rtfp': { label: 'Burkina Faso (World Bank RTFP, estimated)', run: makeRtfpScraper('BF') },
};

function printHelp() {
  console.log(`AgroLease scraper CLI

Usage:
  node src/index.js --source=<name>

Available sources:
${Object.entries(SOURCES)
  .map(([key, { label }]) => `  ${key.padEnd(14)} ${label}`)
  .join('\n')}
  all            Run every source above, in sequence

  --rainfall     Fetch real daily rainfall (Open-Meteo) for every configured
                 country and print it - diagnostic only, no DB write yet
                 (no rainfall table exists - see rainfall-openmeteo.js)

Environment:
  SCRAPER_ENV=production   Write to the production Supabase project instead of staging (default: staging)

Examples:
  node src/index.js --source=nigeria
  node src/index.js --source=all
  node src/index.js --source=kenya-rtfp
  node src/index.js --rainfall
  SCRAPER_ENV=production node src/index.js --source=uk
`);
}

function parseArgs(argv) {
  const args = { source: null, help: false, rainfall: false };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--rainfall') args.rainfall = true;
    else if (arg.startsWith('--source=')) args.source = arg.slice('--source='.length);
  }
  return args;
}

/**
 * Rainfall is diagnostic-only for now (prints to stdout, no DB write) -
 * there is no rainfall_observations table yet (see
 * sources/rainfall-openmeteo.js's RAINFALL_TABLE_NOTE for why: the
 * retention window is a product decision, not just a schema one).
 * `--rainfall` lets you verify the real Open-Meteo integration works
 * without needing that table to exist first.
 */
async function runRainfall() {
  const codes = Object.keys(COUNTRY_COORDINATES);
  console.log(`\n=== Fetching rainfall for ${codes.length} countries (diagnostic, no DB write) ===`);
  const results = await fetchRainfallForAllCountries(codes, { pastDays: 7 });
  for (const [code, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`[${code}] FAILED: ${result.error}`);
      continue;
    }
    const last = result.days[result.days.length - 1];
    console.log(`[${code}] latest (${last?.date}): ${last?.precipitationMm}mm`);
  }
}

async function runOne(key) {
  const entry = SOURCES[key];
  if (!entry) {
    throw new Error(`Unknown source "${key}". Run with --help to see available sources.`);
  }

  console.log(`\n=== Running ${entry.label} ===`);
  try {
    const result = await entry.run();
    await logScraperRun({
      source: key,
      status: 'success',
      rowsWritten: result.rowsWritten ?? 0,
      rowsSkipped: result.rowsSkipped ?? 0,
    });
    console.log(
      `[${key}] done - wrote ${result.rowsWritten ?? 0}, skipped ${result.rowsSkipped ?? 0}` +
        (result.skippedReason ? ` (reason: ${result.skippedReason})` : '')
    );
    return { key, ok: true, ...result };
  } catch (error) {
    console.error(`[${key}] FAILED: ${error.message}`);
    // Must match the scraper_run_logs.status check constraint in
    // supabase/migrations/0001_init.sql ('success' | 'partial' | 'failed').
    await logScraperRun({ source: key, status: 'failed', rowsWritten: 0, rowsSkipped: 0, error });
    return { key, ok: false, error };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.rainfall) {
    await runRainfall();
    return;
  }

  if (!args.source) {
    printHelp();
    process.exit(1);
  }

  const keysToRun = args.source === 'all' ? Object.keys(SOURCES) : [args.source];

  if (args.source !== 'all' && !SOURCES[args.source]) {
    console.error(`Unknown source "${args.source}".\n`);
    printHelp();
    process.exit(1);
  }

  const results = [];
  for (const key of keysToRun) {
    results.push(await runOne(key));
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} sources succeeded ===`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.map((f) => f.key).join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fatal scraper error:', error);
  process.exitCode = 1;
});
