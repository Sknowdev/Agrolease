import { writeCommodityPrice } from '../lib/priceWriter.js';
import { toPricePerTonne, classifyUnitType } from '../lib/price-normalize.js';

/**
 * World Bank Real Time Food Prices (RTFP), republished on HDX. Verified
 * live 2026-07-07:
 *
 *   https://data.humdata.org/dataset/global-real-time-food-prices
 *
 * This resolves the planning doc's open questions:
 *
 * 1. Real resource URL - found via HDX's package_show API (same pattern
 *    as wfp-food-prices.js), not the World Bank's own microdata.worldbank.org
 *    NADA catalog (that site's REST API returns the study's metadata
 *    correctly, but never exposes a working direct-download endpoint for
 *    the actual CSV in this environment - repeated attempts all 404'd or
 *    returned 0 bytes). The HDX mirror is the real, working, no-auth path.
 * 2. Country coverage - checked directly against the live 2026 CSV, NOT
 *    assumed from the "40 countries" headline figure. Of our 14 target
 *    "coming soon"/WFP-backed countries, RTFP covers 9: Nigeria, Kenya,
 *    Ethiopia, Uganda, Cameroon, Senegal, Mozambique, Mali, Burkina Faso.
 *    It does NOT cover Ghana, South Africa, Brazil, Tanzania, Rwanda,
 *    Zambia, Ivory Coast, Zimbabwe, or Egypt - confirmed by literally
 *    counting rows per ISO3 code in the live file, not guessed.
 * 3. Unit format - RTFP is NOT already per-tonne. Units come from the
 *    per-row `components` column (e.g. "maize_flour (2.1 KG, Index
 *    Weight = 0.48)") and vary per country/commodity - this is exactly
 *    why price-normalize.js's toPricePerTonne() exists.
 * 4. Crop overlap - verified per-country below in COUNTRY_CROP_MAP.
 *    Notably: Senegal and Burkina Faso do NOT track groundnuts in RTFP
 *    at all (not in their `components` list), even though our
 *    country_config lists groundnuts as a crop for both - this module
 *    simply does not write a groundnuts row for them rather than
 *    fabricate one.
 *
 * DATA SHAPE: unlike wfp-food-prices.js (long format: one row per
 * market+commodity+month), this CSV is WIDE format: one row per
 * market+month, with one column per commodity. Two kinds of columns per
 * commodity: the bare name (e.g. `maize`) is the RAW reported price -
 * sparse, only populated the months a real survey happened - and the
 * `c_`-prefixed name (e.g. `c_maize`) is the ML-filled CLOSE price -
 * populated for every market every month. Per the planning doc's
 * "Predicted vs Live" labeling requirement, this module reads the `c_`
 * column and writes source_type: 'estimated' - it never presents this as
 * "live"/"reported" data, since it's WFP's real data with gaps filled in
 * by a model between actual survey rounds.
 */

const CSV_URL_TEMPLATE = (year) =>
  `https://data.humdata.org/dataset/82efaf85-d581-4fa8-a6f9-e5b4fe2e8b94/resource/${RESOURCE_ID_BY_YEAR[year]}/download/global_food_${year}.csv`;

// Looked up via HDX's package_show API on 2026-07-07:
//   curl https://data.humdata.org/api/3/action/package_show?id=global-real-time-food-prices
const RESOURCE_ID_BY_YEAR = {
  2026: '7632eab9-f823-46d6-9305-b7beb42a04fb',
  2025: '8cb3182d-a130-4d93-8693-075c6dc8334a',
};

const CURRENT_YEAR = 2026;

// Verified present in the live 2026 CSV's `components` column for each
// country (checked 2026-07-07). Maps our crop slug -> the exact
// commodity column name in the dataset. Each entry also carries the
// "estimated" column to read (always the c_-prefixed close price).
const COUNTRY_CROP_MAP = {
  NG: { maize: 'maize_flour', rice: 'rice' },
  KE: { maize: 'maize_fao' },
  ET: { maize: 'maize' }, // no coffee ticker in RTFP for Ethiopia (unlike raw WFP)
  UG: { maize: 'maize' },
  CM: { 'palm-oil': 'oil' },
  SN: { rice: 'rice' }, // groundnuts NOT tracked by RTFP for Senegal - omitted, not faked
  MZ: { maize: 'maize_meal' },
  ML: { sorghum: 'sorghum', groundnuts: 'groundnuts' },
  BF: { sorghum: 'sorghum' }, // groundnuts NOT tracked by RTFP for Burkina Faso - omitted
};

const ISO3_BY_CODE = {
  NG: 'NGA',
  KE: 'KEN',
  ET: 'ETH',
  UG: 'UGA',
  CM: 'CMR',
  SN: 'SEN',
  MZ: 'MOZ',
  ML: 'MLI',
  BF: 'BFA',
};

export async function scrapeRtfpCountries(countryCodes) {
  const { rows, header } = await downloadAndParseCsv(CURRENT_YEAR);
  const results = {};

  for (const countryCode of countryCodes) {
    const cropMap = COUNTRY_CROP_MAP[countryCode];
    const iso3 = ISO3_BY_CODE[countryCode];
    if (!cropMap || !iso3) {
      results[countryCode] = { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'not_configured' };
      continue;
    }
    results[countryCode] = await processCountry(countryCode, iso3, cropMap, rows, header);
  }

  return results;
}

export function makeRtfpScraper(countryCode) {
  return async function scrape() {
    const results = await scrapeRtfpCountries([countryCode]);
    return results[countryCode];
  };
}

async function processCountry(countryCode, iso3, cropMap, rows, header) {
  const countryRows = rows.filter((r) => r.ISO3 === iso3);
  if (countryRows.length === 0) {
    return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'no_rows_for_country' };
  }

  let rowsWritten = 0;
  let rowsSkipped = 0;

  for (const [cropSlug, commodityCol] of Object.entries(cropMap)) {
    const estimatedCol = `c_${commodityCol}`;
    if (!header.includes(estimatedCol)) {
      rowsSkipped += 1;
      continue;
    }

    const valued = countryRows.filter((r) => {
      const v = Number(r[estimatedCol]);
      return r[estimatedCol] !== '' && Number.isFinite(v) && v > 0;
    });
    if (valued.length === 0) {
      rowsSkipped += 1;
      continue;
    }

    const latestDate = valued.reduce((max, r) => (r.DATES > max ? r.DATES : max), '');
    const latestRows = valued.filter((r) => r.DATES === latestDate);

    const avgRawPrice = latestRows.reduce((sum, r) => sum + Number(r[estimatedCol]), 0) / latestRows.length;
    const rawPriceLocal = Math.round(avgRawPrice * 100) / 100;
    const currencyCode = latestRows[0].currency;
    const unit = extractUnitForCommodity(latestRows[0].components, commodityCol);

    // BUG FIX (2026-07-09): pricePerTonne was already being computed
    // correctly here via toPricePerTonne(), but priceLocal - the field
    // the website actually reads and displays labeled "/ tonne" - was
    // still being set to the RAW per-unit price (e.g. the price for a
    // "2.1 KG" pack), not the converted tonne figure. The correct number
    // existed in the database the whole time, just in a column nothing
    // rendered. Fixed by making priceLocal BE the converted value, and
    // skipping the row entirely (never guessing) when the unit can't be
    // parsed as a weight - e.g. Cameroon's "oil" column is in "L"
    // (litres), a volume unit with no safe density conversion.
    const pricePerTonne = unit ? toPricePerTonne(rawPriceLocal, unit, { cropSlug }) : null;
    if (pricePerTonne === null) {
      rowsSkipped += 1;
      continue;
    }
    const priceLocal = Math.round(pricePerTonne * 100) / 100;
    const isDensityConverted = cropSlug === 'palm-oil' && /\bl(itres?)?\b/i.test(unit ?? '');
    const unitType = isDensityConverted ? 'weight' : classifyUnitType(unit);
    const sourceNote = isDensityConverted
      ? 'normalized to price/tonne via a fixed 0.9 kg/L palm oil density'
      : 'normalized to price/tonne';

    const result = await writeCommodityPrice({
      countryCode,
      cropName: cropSlug,
      priceLocal,
      currencyCode,
      dataDate: latestDate,
      source: `World Bank Real Time Food Prices (estimated, national avg of ${latestRows.length} markets, ${sourceNote})`,
      sourceKey: 'World Bank Real Time Food Prices',
      // Extra fields beyond the original writeCommodityPrice signature -
      // priceWriter.js's insert needs to accept these; see the
      // accompanying Supabase migration adding these three columns.
      sourceType: 'estimated',
      pricePerTonne,
      unitRaw: unit,
      unitType,
    });

    if (result.inserted) rowsWritten += 1;
    else rowsSkipped += 1;
  }

  return { rowsWritten, rowsSkipped };
}

/**
 * The `components` column looks like:
 *   "maize_flour (2.1 KG, Index Weight = 0.48), rice (2.8 KG, Index Weight = 0.18), ..."
 * Extracts the unit string (e.g. "2.1 KG") for one named commodity.
 */
function extractUnitForCommodity(componentsStr, commodityKey) {
  if (!componentsStr) return null;
  const escaped = commodityKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = componentsStr.match(new RegExp(`${escaped}\\s*\\(([^,)]+)`));
  return match ? match[1].trim() : null;
}

async function downloadAndParseCsv(year) {
  const url = CSV_URL_TEMPLATE(year);
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download RTFP dataset for ${year}: HTTP ${response.status}`);
  }
  const text = await response.text();
  return parseCsv(text);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = splitCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length !== header.length) continue;
    const row = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx];
    });
    rows.push(row);
  }
  return { rows, header };
}

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
