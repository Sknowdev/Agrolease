import ExcelJS from 'exceljs';
import { writeCommodityPrice } from '../lib/priceWriter.js';

/**
 * United Kingdom - AHDB "UK Corn Returns" weekly ex-farm wheat price.
 *
 * REPLACES the original DEFRA-based module (2026-07-09). The DEFRA
 * Agricultural Price Index CSV this module used to scrape is a producer
 * price INDEX (base year = 100) - a month-over-month change figure, NOT
 * a real £-per-tonne price. The old code wrote that index value directly
 * into price_local and displayed it as "£<value> / tonne", which looked
 * plausible (the index happened to sit in the 100-120 range) but was
 * never a real price - this was flagged as a known limitation in the
 * old code's comments, but the user correctly caught it live on the
 * site: it showed ~£107/tonne when real UK wheat trades at £160-190/tonne.
 *
 * REAL SOURCE (verified live 2026-07-09): AHDB's mandatory weekly grain
 * purchase survey ("UK Corn Returns"), published as a stable-URL Excel
 * file, no key/auth required:
 *
 *   https://projectblue.blob.core.windows.net/media/Default/MI%20Reports/
 *     D%26A%20Arable/Daily%20and%20Weekly%20Price%20Reports/UK%20Corn%20Returns.xlsx
 *
 * Confirmed via direct download: "Spot" sheet, row labeled "United
 * Kingdom" (the national aggregate, not a regional breakdown), column
 * header "Wheat > Feed & Other" = a real £/tonne spot price (£178.40 for
 * the week ending 2 July 2026, matching real-world UK wheat prices in
 * the £160-190 range the user expected). The file's HTTP Last-Modified
 * header tracks the report's own "week ending" date, confirming it's
 * updated weekly as AHDB states.
 *
 * "Feed & Other" wheat (not "Bread"/milling wheat) is used because it's
 * the one column consistently populated for the UK aggregate row across
 * recent weeks - milling wheat premiums are thinner/more volatile and
 * sometimes show "-" (no data) for a given week.
 */

const CORN_RETURNS_URL =
  'https://projectblue.blob.core.windows.net/media/Default/MI%20Reports/D%26A%20Arable/Daily%20and%20Weekly%20Price%20Reports/UK%20Corn%20Returns.xlsx';

export async function scrapeUk() {
  const buffer = await fetchWithRetry(CORN_RETURNS_URL);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet('Spot');
  if (!sheet) {
    throw new Error('AHDB Corn Returns workbook has no "Spot" sheet - file layout may have changed.');
  }

  // Normalize to a plain array-of-arrays (1 row = 1 array, values only),
  // matching the shape the parsing helpers below expect.
  const rows = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    const values = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      values[colNumber] = cell.value === null || cell.value === undefined ? null : cell.value;
    });
    rows.push(values);
  });

  const dataDate = findWeekEndingDate(rows);
  const priceLocal = findUkFeedWheatPrice(rows);

  if (priceLocal === null) {
    throw new Error(
      'Could not find the "United Kingdom" / "Feed & Other" wheat price row in the AHDB Corn Returns sheet - layout may have changed.'
    );
  }

  const result = await writeCommodityPrice({
    countryCode: 'GB',
    cropName: 'wheat',
    priceLocal,
    currencyCode: 'GBP',
    dataDate,
    source: 'AHDB UK Corn Returns (weekly ex-farm spot price, Feed & Other wheat, UK aggregate)',
  });

  return { rowsWritten: result.inserted ? 1 : 0, rowsSkipped: result.inserted ? 0 : 1 };
}

/**
 * Row 4 (0-indexed: 3) of the "Spot" sheet has a cell like:
 *   "For the week ending: Thursday 2 July 2026"
 * Extracts that date and returns it as an ISO "YYYY-MM-DD" string.
 */
function findWeekEndingDate(rows) {
  for (const row of rows) {
    for (const cellValue of row ?? []) {
      const text = cellToPlainText(cellValue);
      if (text && /week ending/i.test(text)) {
        const match = text.match(/week ending:?\s*\w+\s+(\d{1,2})\s+(\w+)\s+(\d{4})/i);
        if (match) {
          const [, day, monthName, year] = match;
          const parsed = new Date(`${day} ${monthName} ${year} UTC`);
          if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
          }
        }
      }
    }
  }
  // Fall back to today if the date cell can't be parsed - better to write
  // a price with today's date than to fail the whole scrape over a date
  // string format change.
  return new Date().toISOString().slice(0, 10);
}

/**
 * ExcelJS returns merged/rich-text cells (like the "week ending" header,
 * which has two differently-styled text runs) as a { richText: [...] }
 * object rather than a plain string. Flattens either shape to plain text.
 */
function cellToPlainText(cellValue) {
  if (typeof cellValue === 'string') return cellValue;
  if (cellValue && Array.isArray(cellValue.richText)) {
    return cellValue.richText.map((run) => run.text).join('');
  }
  return null;
}

/**
 * Finds the row whose first cell is exactly "United Kingdom", then finds
 * the "Wheat" > "Feed & Other" column by reading the two header rows
 * above the price rows (one row has "Wheat"/"Barley"/"Oats" section
 * labels, the next has "Bread"/"Other"/"Feed & Other" sub-labels) rather
 * than hardcoding a column index, so a future column reshuffle doesn't
 * silently read the wrong crop's price.
 */
function findUkFeedWheatPrice(rows) {
  let wheatSectionStartCol = null;
  let barleySectionStartCol = null;
  let feedOtherCol = null;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const rowText = row.map(cellToPlainText);

    if (wheatSectionStartCol === null) {
      const wheatIdx = rowText.findIndex((c) => c === 'Wheat');
      const barleyIdx = rowText.findIndex((c) => c === 'Barley');
      if (wheatIdx !== -1) {
        wheatSectionStartCol = wheatIdx;
        barleySectionStartCol = barleyIdx !== -1 ? barleyIdx : row.length;
        continue;
      }
    }

    if (wheatSectionStartCol !== null && feedOtherCol === null) {
      // Look for "Feed & Other" within the Wheat section's column range only.
      for (let c = wheatSectionStartCol; c < barleySectionStartCol; c += 1) {
        if (rowText[c] === 'Feed & Other') {
          feedOtherCol = c;
          break;
        }
      }
      if (feedOtherCol !== null) continue;
    }

    if (feedOtherCol !== null && rowText.includes('United Kingdom')) {
      const raw = row[feedOtherCol];
      const value = Number(raw);
      return Number.isFinite(value) && value > 0 ? value : null;
    }
  }

  return null;
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
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  throw lastError;
}
