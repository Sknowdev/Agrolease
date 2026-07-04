#!/usr/bin/env node
import { logScraperRun } from './lib/priceWriter.js';
import { scrapeNigeria } from './sources/nigeria-nbs.js';
import { scrapeGhana } from './sources/ghana.js';
import { scrapeSouthAfrica } from './sources/south-africa.js';
import { scrapeBrazil } from './sources/brazil.js';
import { scrapeUk } from './sources/uk-defra.js';

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
  ghana: { label: 'Ghana (admin-entered, no public feed)', run: scrapeGhana },
  'south-africa': { label: 'South Africa (admin-entered, no public feed)', run: scrapeSouthAfrica },
  brazil: { label: 'Brazil (admin-entered, no public feed)', run: scrapeBrazil },
  uk: { label: 'United Kingdom (DEFRA)', run: scrapeUk },
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

Environment:
  SCRAPER_ENV=production   Write to the production Supabase project instead of staging (default: staging)

Examples:
  node src/index.js --source=nigeria
  node src/index.js --source=all
  SCRAPER_ENV=production node src/index.js --source=uk
`);
}

function parseArgs(argv) {
  const args = { source: null, help: false };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg.startsWith('--source=')) args.source = arg.slice('--source='.length);
  }
  return args;
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

  if (args.help || !args.source) {
    printHelp();
    process.exit(args.help ? 0 : 1);
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
