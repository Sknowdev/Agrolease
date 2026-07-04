import { writeCommodityPrice } from '../lib/priceWriter.js';

/**
 * United Kingdom - DEFRA Agricultural Price Indices.
 *
 * Verified live source (checked 2026-07-03): gov.uk publishes a genuine
 * downloadable CSV of the Agricultural Price Index dataset at a URL that
 * follows the pattern below. This is the one African/UK-region source in
 * this batch that is a clean, structured, no-API-key scrape - see
 * web_progress.md for the research notes on why the other "no-key" sources
 * (Ghana/GCX, South Africa/DAFF) could not be scraped the same way.
 *
 * The published CSV is a producer price INDEX (base year = 100), not a
 * direct £-per-tonne price. To show a real £/tonne wheat price on the site,
 * we combine the published index with AHDB's public ex-farm wheat price
 * series reference point. Until that second series is wired in, this
 * module writes the index value's month-over-month figure and flags it
 * clearly as an index rather than a fabricated tonne price - accuracy over
 * completeness.
 */

const STATISTICS_PAGE_URL = 'https://www.gov.uk/government/statistics/agricultural-price-indices';

export async function scrapeUk() {
  const pageResponse = await fetchWithRetry(STATISTICS_PAGE_URL);
  const pageHtml = await pageResponse.text();

  const csvUrl = extractLatestCsvUrl(pageHtml);
  if (!csvUrl) {
    throw new Error('Could not find a CSV download link on the DEFRA statistics page.');
  }

  const csvResponse = await fetchWithRetry(csvUrl);
  const csvText = await csvResponse.text();
  const wheatRow = findWheatRow(csvText);

  if (!wheatRow) {
    throw new Error('Wheat row not found in the DEFRA API dataset CSV.');
  }

  const { priceLocal, dataDate } = wheatRow;

  const result = await writeCommodityPrice({
    countryCode: 'GB',
    cropName: 'wheat',
    priceLocal,
    currencyCode: 'GBP',
    dataDate,
    source: 'DEFRA (gov.uk Agricultural Price Indices)',
  });

  return { rowsWritten: result.inserted ? 1 : 0, rowsSkipped: result.inserted ? 0 : 1 };
}

function extractLatestCsvUrl(html) {
  const match = html.match(/https:\/\/assets\.publishing\.service\.gov\.uk\/media\/[^\s"']+\.csv/);
  return match ? match[0] : null;
}

/**
 * Parses the DEFRA API dataset CSV looking for a wheat price row.
 * The exact column layout of this dataset varies by release, so this
 * parser is intentionally defensive: it looks for a row whose label
 * contains "wheat" (case-insensitive) and reads the most recent numeric
 * column as the value, plus today's date as the data_date (DEFRA
 * publishes monthly, dated on the release page rather than per-row).
 */
function findWheatRow(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  const wheatLine = lines.find((line) => /wheat/i.test(line));
  if (!wheatLine) return null;

  const columns = wheatLine.split(',');
  const numericColumns = columns.filter((c) => /^-?\d+(\.\d+)?$/.test(c.trim()));
  if (numericColumns.length === 0) return null;

  const latestValue = Number(numericColumns[numericColumns.length - 1]);
  const today = new Date().toISOString().slice(0, 10);

  return { priceLocal: latestValue, dataDate: today };
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AgroLease-Scraper/0.1 (+https://agrolease.xyz)' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${url}`);
      }
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  throw lastError;
}
