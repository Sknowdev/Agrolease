import { writeCommodityPrice } from '../lib/priceWriter.js';
import { toPricePerTonne, classifyUnitType } from '../lib/price-normalize.js';

/**
 * WFP (World Food Programme) Global Food Prices dataset, republished on
 * HDX (Humanitarian Data Exchange). Verified live 2026-07-07:
 *
 *   https://data.humdata.org/dataset/global-wfp-food-prices
 *
 * This is a genuinely public, no-key, CSV-per-year dataset (current file:
 * wfp_food_prices_global_2026.csv), containing real market-level retail/
 * wholesale prices per commodity per market per month, across 63
 * countries. Confirmed actively maintained: the 2026 resource's
 * last_modified date is 2026-05-24, with rows dated as recent as
 * 2026-04-15 at time of writing - roughly a one-month collection/QA lag,
 * which is normal for this dataset.
 *
 * This single source replaces the "coming soon" priceFeedMethod: 'api'
 * placeholder (previously labeled "WFP VAM", which is actually a
 * different, harder-to-access WFP system - api.vam.wfp.org and
 * dataviz.vam.wfp.org both returned HTTP 403 on direct request, and the
 * newer "DataBridges" replacement requires registration). The HDX-hosted
 * CSV is the real, working, no-registration path.
 *
 * HONESTY NOTE - what this dataset does NOT cover, per country: WFP's
 * price collection is food-security-focused, so it tracks staple foods
 * (maize, rice, sorghum, wheat, groundnuts, cassava) well, but does NOT
 * track export/cash crops in most countries - notably cocoa (Cameroon,
 * Ivory Coast) and coffee (Kenya, Uganda, Rwanda) are absent. Ethiopia is
 * the one exception where "Coffee" is genuinely present. Per the
 * "never claim an untested/broken source works" rule, COUNTRY_CROP_MAP
 * below only includes mappings that were verified present in the actual
 * CSV - unmapped crops are not scraped by this module and stay on
 * whatever fallback (admin-entered or "coming soon") applies.
 *
 * YAM (added 2026-07-08): checked every country in this dataset for a
 * "yam" commodity. Real, current data exists for Nigeria (n=13, latest
 * 2026-04-15) and Cameroon (n=7, latest 2026-03-15). Ivory Coast has a
 * "Yam (florido)" reading too, but only 1 data point with an
 * "aggregate"-only price flag - deliberately excluded as too thin, same
 * standard used elsewhere in this file. Benin also has rich yam data in
 * this dataset but isn't one of our configured countries.
 */

const CSV_URL_TEMPLATE = (year) =>
  `https://data.humdata.org/dataset/31579af5-3895-4002-9ee3-c50857480785/resource/${RESOURCE_ID_BY_YEAR[year]}/download/wfp_food_prices_global_${year}.csv`;

// Resource IDs are per-year and don't follow a guessable pattern - looked
// up directly from the HDX package metadata (package_show API) on
// 2026-07-07. If HDX rotates these, re-fetch via:
//   curl https://data.humdata.org/api/3/action/package_show?id=global-wfp-food-prices
const RESOURCE_ID_BY_YEAR = {
  2026: '502190c6-0d3d-4b84-977e-ef062f053662',
  2025: 'd62af4be-cff6-437b-89a3-67f8fa4c53bf',
};

const CURRENT_YEAR = 2026;

// Verified present in the live 2026 CSV for each country (checked
// 2026-07-07). Maps our crop slug -> the exact "commodity" value(s) in
// the dataset for that country (some countries label the same crop
// differently, e.g. "Maize" vs "Maize (white)").
const COUNTRY_CROP_MAP = {
  NG: { maize: ['Maize flour'], rice: ['Rice (local)'], sorghum: ['Sorghum'], yam: ['Yam'] },
  // "beans" (Beans, rosecoco) added 2026-07-09 - verified present, n=1
  // (thin, but genuine "actual"-flagged data, not fabricated).
  KE: { maize: ['Maize (white, dry)', 'Maize'], beans: ['Beans (rosecoco)'] },
  ET: { maize: ['Maize (white)', 'Maize (yellow)'], coffee: ['Coffee'] },
  TZ: { maize: ['Maize'], sorghum: ['Sorghum'] },
  // "beans", "cassava" (prefers fresh over flour when both exist),
  // "millet" (flour), "sorghum" added 2026-07-09 - all verified present
  // with real, current "actual"-flagged data (n=11-21).
  UG: {
    maize: ['Maize (white)'],
    beans: ['Beans'],
    cassava: ['Cassava (fresh)', 'Cassava flour'],
    millet: ['Millet flour'],
    sorghum: ['Sorghum'],
  },
  // "beans" added 2026-07-09 - verified present, n=10, "actual" flag.
  // "rice" uses only "Rice (local)" (not "Rice (imported)") - imported
  // rice isn't a domestically grown farm crop, so it's deliberately
  // excluded per the same "farm crop only" standard applied elsewhere.
  RW: { maize: ['Maize'], beans: ['Beans (dry)'], rice: ['Rice (local)'] },
  // "yam" verified present 2026-07-08 (latest date 2026-03-15, n=7,
  // priceflag "actual"). Note Cameroon also has a distinct "Cocoyam
  // (macabo)" commodity in this dataset - that is a different crop and
  // is NOT mapped here.
  CM: { 'palm-oil': ['Oil (palm)'], yam: ['Yam'] },
  CI: { 'palm-oil': ['Oil (palm)'] },
  SN: { groundnuts: ['Groundnuts (shelled)'], rice: ['Rice (local)'] },
  // "groundnuts" and "rice" added 2026-07-09 - verified present, n=8-9,
  // "actual" flag. "cassava" still intentionally excluded - not present
  // in Mozambique's WFP data.
  MZ: { maize: ['Maize meal'], groundnuts: ['Groundnuts'], rice: ['Rice'] },
  EG: { wheat: ['Wheat flour (unpacked, 72%)'], rice: ['Rice'] },
  ML: { sorghum: ['Sorghum'], groundnuts: ['Groundnuts (shelled)'] },
  BF: { sorghum: ['Sorghum (white)'], groundnuts: ['Groundnuts (shelled)'] },
  // Not included: ZM (Zambia) - the 2026 CSV has only one commodity
  // ("Salt") for Zambia so far this year, nothing matching maize or
  // groundnuts. Left on its existing fallback rather than scraping
  // nothing and calling it a success.
};

const ISO3_BY_CODE = {
  NG: 'NGA',
  KE: 'KEN',
  ET: 'ETH',
  TZ: 'TZA',
  UG: 'UGA',
  RW: 'RWA',
  ZM: 'ZMB',
  CM: 'CMR',
  CI: 'CIV',
  SN: 'SEN',
  MZ: 'MOZ',
  EG: 'EGY',
  ML: 'MLI',
  BF: 'BFA',
};

const USABLE_PRICE_FLAGS = new Set(['actual', 'actual,aggregate']);

/**
 * Scrapes every configured country in one pass (one CSV download shared
 * across all of them, since it's a single global file).
 * @param {string[]} countryCodes - AgroLease country codes to process, e.g. ['NG', 'KE']
 */
export async function scrapeWfpCountries(countryCodes) {
  const rows = await downloadAndParseCsv(CURRENT_YEAR);
  const results = {};

  for (const countryCode of countryCodes) {
    const cropMap = COUNTRY_CROP_MAP[countryCode];
    const iso3 = ISO3_BY_CODE[countryCode];
    if (!cropMap || !iso3) {
      results[countryCode] = { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'not_configured' };
      continue;
    }
    results[countryCode] = await processCountry(countryCode, iso3, cropMap, rows);
  }

  return results;
}

/** Single-country entry point, matching the same shape as the other source modules. */
export function makeWfpScraper(countryCode) {
  return async function scrape() {
    const results = await scrapeWfpCountries([countryCode]);
    return results[countryCode];
  };
}

/**
 * Single-country, single-crop entry point. Needed for Nigeria's "yam"
 * mapping (added 2026-07-08): Nigeria's maize/rice/sorghum/soybeans are
 * already covered by the better, farmgate-level NBS dataset
 * (nigeria-nbs.js), so there is no CLI entry that runs the *full* WFP
 * scraper for Nigeria - which meant this file's `NG: { ... yam: [...] }`
 * mapping was never actually invoked by anything (a real bug, caught by
 * the user reporting Nigeria's yam page showing no data at all). This
 * lets index.js wire up just the one crop WFP genuinely adds for a
 * country that also has another primary source, without silently
 * re-scraping (and potentially conflicting with) crops NBS already owns.
 */
export function makeWfpCropScraper(countryCode, cropSlug) {
  return async function scrape() {
    const rows = await downloadAndParseCsv(CURRENT_YEAR);
    const cropMap = COUNTRY_CROP_MAP[countryCode];
    const iso3 = ISO3_BY_CODE[countryCode];
    if (!cropMap || !cropMap[cropSlug] || !iso3) {
      return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'not_configured' };
    }
    return processCountry(countryCode, iso3, { [cropSlug]: cropMap[cropSlug] }, rows);
  };
}

async function processCountry(countryCode, iso3, cropMap, rows) {
  const countryRows = rows.filter((r) => r.countryiso3 === iso3);
  if (countryRows.length === 0) {
    return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'no_rows_for_country' };
  }

  const latestDate = countryRows.reduce((max, r) => (r.date > max ? r.date : max), '');
  const currencyCode = countryRows.find((r) => r.date === latestDate)?.currency;

  let rowsWritten = 0;
  let rowsSkipped = 0;

  for (const [cropSlug, commodityNames] of Object.entries(cropMap)) {
    const matching = countryRows.filter(
      (r) =>
        r.date === latestDate &&
        commodityNames.includes(r.commodity) &&
        USABLE_PRICE_FLAGS.has(r.priceflag) &&
        Number.isFinite(r.price) &&
        r.price > 0
    );

    if (matching.length === 0) {
      rowsSkipped += 1;
      continue;
    }

    // BUG FIX (2026-07-09): this used to average the raw reported
    // `price` and write that directly as priceLocal, then the UI
    // displayed it labeled "/ tonne" - but WFP's `price` column is per
    // the market's own pack/unit size (e.g. "2.5 KG" of yam, "KG" of
    // maize), NOT already per metric tonne. That produced results like
    // "NGN 3,500 / tonne" for yam that was actually NGN 3,500 for 2.5kg
    // (i.e. ~NGN 1,400,000/tonne) - caught live by the user comparing
    // against real-world prices. Every row is now converted to a real
    // price-per-tonne via toPricePerTonne() (crop-agnostic, keyed off
    // the `unit` column, not the commodity name) BEFORE averaging, and
    // a row is skipped rather than guessed if that conversion fails
    // (e.g. an unrecognized/non-weight unit).
    const converted = matching
      .map((r) => ({ ...r, pricePerTonne: toPricePerTonne(r.price, r.unit, { cropSlug }) }))
      .filter((r) => r.pricePerTonne !== null);

    if (converted.length === 0) {
      rowsSkipped += 1;
      continue;
    }

    const avgPricePerTonne =
      converted.reduce((sum, r) => sum + r.pricePerTonne, 0) / converted.length;
    const priceLocal = Math.round(avgPricePerTonne * 100) / 100;
    const unitRaw = converted[0].unit;
    const isDensityConverted =
      cropSlug === 'palm-oil' && /\bl(itres?)?\b/i.test(unitRaw ?? '');
    const unitType = isDensityConverted ? 'weight' : classifyUnitType(unitRaw);
    const sourceNote = isDensityConverted
      ? `normalized to price/tonne via a fixed 0.9 kg/L palm oil density`
      : 'normalized to price/tonne';

    const result = await writeCommodityPrice({
      countryCode,
      cropName: cropSlug,
      priceLocal,
      currencyCode: currencyCode ?? converted[0].currency,
      dataDate: latestDate,
      source: `WFP Global Food Prices (national avg of ${converted.length} market readings, ${sourceNote})`,
      sourceKey: 'WFP Global Food Prices',
      pricePerTonne: priceLocal,
      unitRaw,
      unitType,
    });

    if (result.inserted) rowsWritten += 1;
    else rowsSkipped += 1;
  }

  return { rowsWritten, rowsSkipped };
}

/**
 * Downloads and parses the global CSV for one year. This is a genuinely
 * large file (~13MB, ~95k rows) but small enough to hold in memory in
 * full (unlike the Nigeria NBS dataset, which needed streaming).
 */
async function downloadAndParseCsv(year) {
  const url = CSV_URL_TEMPLATE(year);
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download WFP dataset for ${year}: HTTP ${response.status}`);
  }
  const text = await response.text();
  return parseCsv(text);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(',');
  const priceIdx = header.indexOf('price');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length !== header.length) continue; // skip malformed lines
    const row = {};
    header.forEach((key, idx) => {
      row[key] = idx === priceIdx ? Number(cols[idx]) : cols[idx];
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Minimal CSV split that handles quoted fields (a few market/commodity
 * names in this dataset contain commas inside quotes).
 */
function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
