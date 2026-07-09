#!/usr/bin/env node
import { writeCommodityPrice, logScraperRun } from './lib/priceWriter.js';

/**
 * Manual admin-entry CLI for countries with NO automated public price
 * feed: Ghana, South Africa, Brazil (see sources/ghana.js,
 * south-africa.js, brazil.js for why - each is a documented, verified
 * dead end, not an oversight).
 *
 * This tool existing at all is the actual fix for a real gap: those 3
 * countries' pages have shown "not available" since launch not because
 * of a display bug, but because nothing has ever had a way to write a
 * price for them - there was no admin entry path, automated or manual.
 *
 * IMPORTANT - this script deliberately does NOT ship with any
 * hardcoded/default prices. Per this project's standing rule (see
 * web_progress.md, requirements.md), no price is ever written without a
 * real, citable, current source - an AI agent picking a plausible-looking
 * number from a news snippet is exactly the kind of fabrication this
 * project has consistently refused to do elsewhere (Ghana/SA/Brazil were
 * downgraded to admin-entered for this exact reason). A human must
 * supply the price and the source on each run.
 *
 * Usage:
 *   node src/admin-entry.js \
 *     --country=GH --crop=maize --price=4200 --currency=GHS \
 *     --date=2026-07-09 --source="GCX weekly bulletin, 2026-07-09" \
 *     --unit="KG" [--per-tonne-already]
 *
 * Flags:
 *   --country          AgroLease country code (GH, ZA, BR)
 *   --crop              crop slug, e.g. maize, soybeans, cocoa
 *   --price              the number as reported by your source
 *   --currency           currency code, e.g. GHS, ZAR, BRL
 *   --date               ISO date the price is FOR (not today's date),
 *                        e.g. the date on the bulletin/report you're citing
 *   --source             a specific, checkable citation - not just
 *                        "market report", but "<publication>, <date>,
 *                        <url if available>"
 *   --unit               the unit your source's number is actually in,
 *                        e.g. "KG", "2.5 KG", "100 KG" if it's not
 *                        already per tonne
 *   --per-tonne-already  pass this instead of --unit if your source's
 *                        number is already a genuine price-per-tonne
 *                        figure (e.g. a SAFEX/GCX exchange quote) - skips
 *                        the unit-conversion step entirely
 *
 * Exactly one of --unit or --per-tonne-already is required, so this tool
 * cannot silently repeat the "raw per-kg price written as if it were
 * per-tonne" bug found in the automated scrapers on 2026-07-09.
 */

import { toPricePerTonne, classifyUnitType } from './lib/price-normalize.js';

const ALLOWED_COUNTRIES = new Set(['GH', 'ZA', 'BR']);

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    if (arg === '--per-tonne-already') {
      args.perTonneAlready = true;
      continue;
    }
    const match = arg.match(/^--([a-z-]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      args[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
  }
  return args;
}

function printHelp() {
  console.log(`AgroLease admin price-entry CLI

For countries with no automated public price feed (Ghana, South Africa,
Brazil). Requires a real, citable source - never writes a price without
one. See the comment block at the top of this file for full usage.

Example:
  node src/admin-entry.js --country=GH --crop=maize --price=4200 \\
    --currency=GHS --date=2026-07-09 \\
    --source="GCX weekly market bulletin, 2026-07-09" --unit=KG
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const missing = ['country', 'crop', 'price', 'currency', 'date', 'source'].filter(
    (key) => !args[key]
  );
  if (missing.length > 0) {
    console.error(`Missing required flag(s): ${missing.map((m) => `--${m}`).join(', ')}\n`);
    printHelp();
    process.exit(1);
  }

  if (!ALLOWED_COUNTRIES.has(args.country.toUpperCase())) {
    console.error(
      `--country must be one of: ${[...ALLOWED_COUNTRIES].join(', ')} (these are the only ` +
        `countries with no automated feed - every other country should go through the ` +
        `regular scraper CLI in index.js instead).`
    );
    process.exit(1);
  }

  if (!args.unit && !args.perTonneAlready) {
    console.error(
      'Must pass either --unit="<the unit your number is actually in>" or ' +
        '--per-tonne-already (if your source already quotes a real price-per-tonne figure). ' +
        'This is required so this tool cannot repeat the "raw per-kg price written as ' +
        'per-tonne" bug found in the automated scrapers on 2026-07-09.'
    );
    process.exit(1);
  }

  const rawPrice = Number(args.price);
  if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
    console.error(`--price must be a positive number, got "${args.price}"`);
    process.exit(1);
  }

  let priceLocal;
  let pricePerTonne;
  let unitRaw;
  let unitType;

  if (args.perTonneAlready) {
    priceLocal = rawPrice;
    pricePerTonne = rawPrice;
    unitRaw = null;
    unitType = 'weight';
  } else {
    const converted = toPricePerTonne(rawPrice, args.unit);
    if (converted === null) {
      console.error(
        `Could not convert "${rawPrice} per ${args.unit}" into a price-per-tonne figure. ` +
          `--unit must be a weight unit this tool understands (e.g. "KG", "2.5 KG", "100 G") ` +
          `- if your unit is genuinely not weight-based (e.g. litres, a piece/bunch count), ` +
          `there is no safe conversion and this tool will not guess one. Use ` +
          `--per-tonne-already instead if you can source a real per-tonne figure directly.`
      );
      process.exit(1);
    }
    priceLocal = Math.round(converted * 100) / 100;
    pricePerTonne = priceLocal;
    unitRaw = args.unit;
    unitType = classifyUnitType(args.unit);
  }

  const countryCode = args.country.toUpperCase();

  console.log(`\nAbout to write:
  Country:      ${countryCode}
  Crop:         ${args.crop}
  Price:        ${priceLocal} ${args.currency.toUpperCase()} / tonne
  Data date:    ${args.date}
  Source:       ${args.source}
  Entered by:   admin (this tool)
`);

  try {
    const result = await writeCommodityPrice({
      countryCode,
      cropName: args.crop,
      priceLocal,
      currencyCode: args.currency.toUpperCase(),
      dataDate: args.date,
      source: args.source,
      enteredBy: 'admin',
      sourceType: 'reported',
      pricePerTonne,
      unitRaw,
      unitType,
    });

    await logScraperRun({
      source: `admin-entry:${countryCode.toLowerCase()}`,
      status: 'success',
      rowsWritten: result.inserted ? 1 : 0,
      rowsSkipped: result.inserted ? 0 : 1,
    });

    if (result.inserted) {
      console.log('Written successfully.');
    } else {
      console.log(
        `Not written - reason: ${result.reason}. (This is expected if you re-run with the ` +
          `exact same price and date as the last entry - it's the same skip-if-unchanged ` +
          `logic the automated scrapers use.)`
      );
    }
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
    await logScraperRun({
      source: `admin-entry:${countryCode.toLowerCase()}`,
      status: 'failed',
      rowsWritten: 0,
      rowsSkipped: 0,
      error,
    });
    process.exitCode = 1;
  }
}

main();
