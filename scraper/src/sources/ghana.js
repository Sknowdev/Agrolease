/**
 * Ghana - NOT scrapable, admin-entered pricing (verified 2026-07-04).
 *
 * The originally planned source, GCX (Ghana Commodity Exchange,
 * gcx.com.gh), was re-checked live and confirmed to now be a members-only
 * trading platform: the public site is a client-side Vite SPA with no
 * server-rendered price data, and its API host (api.gcx.com.gh) exposes
 * only a directory listing (a notification-api.zip artifact), not a
 * prices endpoint. There is no public bulletin left to scrape.
 *
 * Rather than scrape around GCX's members-only auth wall (which would be
 * both technically fragile and an authorization/ethics problem), Ghana
 * uses the ABS Section 1 "admin-entered price" pattern: a human enters a
 * market-reference price through the (future) admin panel, and it is
 * written to commodity_prices with entered_by = 'admin' instead of
 * 'scraper'. See supabase/migrations/0002_seed_countries.sql and
 * web/src/config/countries.ts (priceFeedMethod: 'admin') for how this is
 * reflected in the schema/config.
 *
 * This module exists so `npm run scrape:ghana` / `scrape:all` documents
 * *why* nothing runs here, instead of silently doing nothing or crashing.
 */
export async function scrapeGhana() {
  console.log(
    '[ghana] Skipped: GCX has no public price bulletin (members-only trading platform). ' +
      'Ghana prices are admin-entered - see docs comment in this file and web_progress.md.'
  );
  return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'no_public_source' };
}
