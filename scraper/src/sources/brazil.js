/**
 * Brazil - NOT scrapable, admin-entered pricing (downgraded 2026-07-04).
 *
 * DEVIATION FROM THE ORIGINAL PLAN: Brazil was originally planned as a
 * "live, scraper-backed" country using CONAB, then (mid-investigation, in
 * an earlier session) tentatively re-pointed at IBGE's SIDRA open API as
 * a no-key substitute. Neither holds up under a real check:
 *
 *   - CONAB's own site (conab.gov.br, consultaweb.conab.gov.br/precospaa)
 *     is a JS single-page consulta tool, not scrapable via a simple HTTP
 *     request.
 *   - IBGE SIDRA: fetched the full aggregates catalog
 *     (servicodados.ibge.gov.br/api/v3/agregados) and searched all ~1,900
 *     aggregate groups for anything price-related. The only real matches
 *     are consumer price indices (IPCA/INPC/IPCAE) - general inflation
 *     baskets, not crop-specific commodity prices - plus the
 *     "Levantamento Sistemático da Produção Agrícola" / "Produção
 *     Agrícola Municipal" groups, which are production/yield/harvest-area
 *     surveys (tonnes produced, area planted), not market prices at all.
 *     The specific table ID guessed in an earlier session (6588) is
 *     exactly one of these production surveys, not a price series -
 *     confirming that substitution was wrong.
 *
 * No real, no-key, structured price source was found for Brazil. Rather
 * than fabricate a price feed from mismatched data (e.g. presenting a
 * production/yield number as if it were a market price), Brazil is
 * downgraded from priceFeedMethod 'scraper' to 'admin', matching Ghana
 * and South Africa. See web/src/config/countries.ts and
 * supabase/migrations/0002_seed_countries.sql for the corresponding
 * config/schema changes, and web_progress.md for the full reasoning.
 */
export async function scrapeBrazil() {
  console.log(
    '[brazil] Skipped: neither CONAB (JS-only consulta tool) nor IBGE/SIDRA (no crop-price ' +
      'aggregate exists, only production/yield surveys and general CPI) offer a real, ' +
      'scrapable price feed. Brazil prices are admin-entered - see docs comment in this ' +
      'file and web_progress.md.'
  );
  return { rowsWritten: 0, rowsSkipped: 0, skippedReason: 'no_verified_source' };
}
