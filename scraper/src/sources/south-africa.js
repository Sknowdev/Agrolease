/**
 * South Africa - NOT scrapable, admin-entered pricing (checked 2026-07-04).
 *
 * The originally planned source, DAFF / the National Department of
 * Agriculture (nda.gov.za, now reorganized under dalrrd.gov.za), only
 * publishes its price-watch reports as PDFs, not as CSV/HTML tables.
 * A live re-check of dalrrd.gov.za timed out (inconclusive on the exact
 * current URL structure), but this doesn't change the underlying
 * finding: even when reachable, this source has never offered a
 * structured, scrapable price feed - only PDF reports that would need
 * fragile PDF-text-extraction, which risks silently parsing garbage
 * numbers out of a layout-shifted document.
 *
 * Per the "never claim an untested/broken source works" rule, South
 * Africa uses the ABS Section 1 admin-entered price pattern instead of a
 * PDF scraper. This can be revisited later if a structured DAFF/DALRRD
 * data feed is found.
 */
export async function scrapeSouthAfrica() {
  console.log(
    '[south-africa] Skipped: DAFF/DALRRD only publishes PDF price-watch reports, no ' +
      'structured feed found. South Africa prices are admin-entered - see docs comment ' +
      'in this file and web_progress.md.'
  );
  return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'pdf_only_source' };
}
