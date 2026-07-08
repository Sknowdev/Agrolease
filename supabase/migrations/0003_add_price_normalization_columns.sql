-- AgroLease - Daily/Weekly Price feature - price normalization columns
--
-- Adds the fields needed to (a) distinguish real field observations from
-- World Bank RTFP's ML-filled weekly estimates, and (b) store a
-- crop-agnostic price-per-tonne figure computed at ingest time by
-- scraper/src/lib/price-normalize.js, rather than recomputing/guessing
-- unit conversions on every page render.
--
-- Existing rows (all "reported", all scraper-inserted before this
-- migration) get source_type = 'reported' and NULL for the three new
-- normalization columns - safe defaults, no backfill required. Every
-- current scraper module continues to work unchanged, since
-- writeCommodityPrice()'s new parameters all default to the "reported"
-- behavior if a caller doesn't pass them.
--
-- Apply to BOTH the staging and production Supabase projects, after
-- 0001_init.sql and 0002_seed_countries.sql.

alter table commodity_prices
  add column if not exists source_type text not null default 'reported'
    check (source_type in ('reported', 'estimated')),
  add column if not exists price_per_tonne numeric,
  add column if not exists unit_raw text,
  add column if not exists unit_type text
    check (unit_type is null or unit_type in ('weight', 'volume', 'count'));

comment on column commodity_prices.source_type is
  'reported = real field observation (WFP monthly survey, DEFRA, NBS, etc.). estimated = ML-filled series (World Bank RTFP) - must render with an "Estimated" badge, never a plain "Live" badge, per the Predicted vs Live labeling rule.';
comment on column commodity_prices.price_per_tonne is
  'Normalized price-per-metric-tonne, computed at ingest time by price-normalize.js. NULL when unit_raw is not weight-based (never a guessed conversion for L/Loaf/Bunch/Piece units).';
comment on column commodity_prices.unit_raw is
  'The unit exactly as reported by the source, e.g. "2.5 KG", "1 L", "30 pcs".';
comment on column commodity_prices.unit_type is
  'weight | volume | count, from classifyUnitType(). Drives whether a row is eligible for any per-tonne comparison/leaderboard view.';

create index if not exists idx_commodity_prices_source_type on commodity_prices(source_type);
