import { Readable } from 'node:stream';
import readline from 'node:readline';
import { writeCommodityPrice } from '../lib/priceWriter.js';

/**
 * Nigeria - NBS Food Price Tracking (verified live 2026-07-04).
 *
 * IMPORTANT DEVIATION FROM THE ORIGINAL PLAN: the originally proposed
 * source, FMARD (fmard.gov.ng), no longer exists as a standalone site -
 * it now permanently redirects to agriculture.gov.ng, which has no
 * price/market bulletin pages at all. Re-checking live (not trusting the
 * earlier unverified "Cloudflare 525" note) confirmed FMARD is dead as a
 * data source.
 *
 * Replacement found via nigerianstat.gov.ng (the National Bureau of
 * Statistics), which links directly to nigeriafoodpricetracking.ng - an
 * official NBS pilot. Its dashboard page exposes a public, no-auth Google
 * Drive CSV export with granular state/LGA-level retail and farmgate
 * prices. This is a genuine upgrade in data quality over the original
 * plan (real government microdata, not just a bulletin page).
 *
 * See web_progress.md for full reasoning, including which crops this
 * dataset does NOT cover (cassava, groundnuts - deliberately left
 * unscraped rather than approximated from an unrelated item).
 */

const DRIVE_FILE_ID = '1rDD7k6Z95JsSyjJ1qHnyVI6ZWfETE45o';

// Maps the dataset's "Food Item" values to AgroLease crop slugs. Only
// unambiguous, non-derived matches are included:
//   - "Garri" is a processed cassava product, not raw cassava - NOT mapped
//     to "cassava" to avoid mislabeling a derived-product price as a raw
//     crop price.
//   - "Imported rice" is skipped in favor of "Local rice" as the more
//     representative farmgate/local-market reference price.
//   - Groundnuts has no matching item in this dataset at all.
const FOOD_ITEM_TO_CROP = {
  'Maize white': 'maize',
  'Maize yellow': 'maize',
  'Local rice': 'rice',
  Sorghum: 'sorghum',
  Soyabeans: 'soybeans',
};

// Farmgate is preferred (most relevant to farmers selling their harvest,
// which is AgroLease's core audience); falls back to Retail per-crop if
// a given crop has no Farmgate rows on the latest date.
const PREFERRED_PRICE_CATEGORY = 'Farmgate';
const FALLBACK_PRICE_CATEGORY = 'Retail';

export async function scrapeNigeria() {
  const csvStream = await openDatasetStream();
  const { latestDate, sums } = await accumulateLatestDatePrices(csvStream);

  if (!latestDate) {
    throw new Error('No usable rows found in the NBS Food Price Tracking dataset.');
  }

  const dataDate = toIsoDate(latestDate);
  let rowsWritten = 0;
  let rowsSkipped = 0;

  for (const crop of new Set(Object.values(FOOD_ITEM_TO_CROP))) {
    const stats = pickBestCategoryStats(sums, crop);
    if (!stats) continue;

    const priceLocal = Math.round((stats.total / stats.count) * 100) / 100;
    const result = await writeCommodityPrice({
      countryCode: 'NG',
      cropName: crop,
      priceLocal,
      currencyCode: 'NGN',
      dataDate,
      source: `NBS Food Price Tracking (${stats.category}, national avg of ${stats.count} readings)`,
    });

    if (result.inserted) rowsWritten += 1;
    else rowsSkipped += 1;
  }

  return { rowsWritten, rowsSkipped };
}

/**
 * Downloads the dataset CSV as a stream, working around Google Drive's
 * "file too large to scan for viruses" interstitial page for public
 * files. Verified working manually via curl on 2026-07-04; if Google
 * changes this flow, this is the first thing to re-check.
 */
async function openDatasetStream() {
  const interstitialUrl = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
  const interstitialResponse = await fetch(interstitialUrl, { redirect: 'follow' });
  const interstitialHtml = await interstitialResponse.text();

  const uuidMatch = interstitialHtml.match(/name="uuid" value="([a-f0-9-]{36})"/);
  if (!uuidMatch) {
    throw new Error(
      'Could not find the Google Drive download-confirmation token. The interstitial page layout may have changed.'
    );
  }

  const setCookies = interstitialResponse.headers.getSetCookie
    ? interstitialResponse.headers.getSetCookie()
    : [];
  const cookieHeader = setCookies.map((c) => c.split(';')[0]).join('; ');

  const downloadUrl = `https://drive.usercontent.google.com/download?id=${DRIVE_FILE_ID}&export=download&confirm=t&uuid=${uuidMatch[1]}`;
  const fileResponse = await fetch(downloadUrl, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });

  if (!fileResponse.ok || !fileResponse.body) {
    throw new Error(`Failed to download the NBS dataset: HTTP ${fileResponse.status}`);
  }

  return Readable.fromWeb(fileResponse.body);
}


/**
 * Streams the (large, ~1.27M row) CSV line by line, tracking the most
 * recent date seen and accumulating sum/count of UPRICE per
 * (crop, price category) for that most recent date only. Streaming
 * avoids loading the ~100MB+ file into memory at once.
 *
 * CSV columns: Date,State,LGA,Outlet Type,Country,Sector,Food Item,Price Category,UPRICE
 */
async function accumulateLatestDatePrices(csvStream) {
  const rl = readline.createInterface({ input: csvStream, crlfDelay: Infinity });

  let header = null;
  let latestDate = null; // as a comparable Date object
  let latestDateRaw = null; // as the "DD/MM/YYYY" string, for re-filtering
  // sums[crop][category] = { total, count }
  const sums = {};

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (!header) {
      header = line.split(',');
      continue;
    }

    const cols = splitCsvLine(line);
    const dateRaw = cols[0];
    const foodItem = cols[6];
    const priceCategory = cols[7];
    const priceRaw = cols[8];

    const crop = FOOD_ITEM_TO_CROP[foodItem];
    if (!crop) continue;

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price <= 0) continue;

    const rowDate = parseDdMmYyyy(dateRaw);
    if (!rowDate) continue;

    if (!latestDate || rowDate > latestDate) {
      latestDate = rowDate;
      latestDateRaw = dateRaw;
      // A newer date supersedes everything accumulated so far.
      for (const key of Object.keys(sums)) delete sums[key];
    }

    if (dateRaw !== latestDateRaw) continue;

    sums[crop] ??= {};
    sums[crop][priceCategory] ??= { total: 0, count: 0 };
    sums[crop][priceCategory].total += price;
    sums[crop][priceCategory].count += 1;
  }

  return { latestDate, sums };
}

function pickBestCategoryStats(sums, crop) {
  const categories = sums[crop];
  if (!categories) return null;

  if (categories[PREFERRED_PRICE_CATEGORY]?.count > 0) {
    return { ...categories[PREFERRED_PRICE_CATEGORY], category: PREFERRED_PRICE_CATEGORY };
  }
  if (categories[FALLBACK_PRICE_CATEGORY]?.count > 0) {
    return { ...categories[FALLBACK_PRICE_CATEGORY], category: FALLBACK_PRICE_CATEGORY };
  }
  return null;
}

/** Minimal CSV split - the dataset's fields never contain embedded commas. */
function splitCsvLine(line) {
  return line.split(',');
}

function parseDdMmYyyy(raw) {
  const match = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}
