-- AgroLease - Seed country_config
-- 19 countries total: the 18 from ABS Section 1+2, plus Brazil (added
-- pragmatically because CONAB/IBGE is a no-API-key source and the user
-- wants it live at launch even though it is formally a Section 3 country).
--
-- 5 are "live" (active = true, coming_soon = false) at launch:
--   Nigeria, Ghana, South Africa, Brazil, United Kingdom
-- The remaining 14 are seeded now so their /prices/... routes exist and
-- are indexable, but are marked coming_soon = true.
--
-- NOTE ON GHANA: GCX (the originally planned source) turned out to be a
-- members-only trading platform, not a public price bulletin (see
-- web_progress.md). Ghana is still marked "live" here because we serve
-- admin-entered reference prices for it, matching the ABS Section 1
-- admin-fallback pattern - not because an automated scraper is running.
--
-- NOTE ON NIGERIA: source changed from the originally planned FMARD to
-- NBS Food Price Tracking. Live verification (2026-07-04) found
-- fmard.gov.ng now permanently redirects to agriculture.gov.ng, which has
-- no price/market pages at all. NBS's public dataset (linked from
-- nigerianstat.gov.ng) is a genuine, verified working replacement - see
-- web_progress.md.
--
-- NOTE ON BRAZIL: downgraded from 'scraper' to 'admin' after live
-- verification found neither CONAB (JS-only consulta tool) nor IBGE/SIDRA
-- (a tentative substitute explored in an earlier session) expose a real
-- crop-price data feed - SIDRA only has production/yield surveys and
-- general consumer price indices, not commodity market prices. See
-- web_progress.md.
--
-- NOTE ON THE "COMING SOON" WAVE (2026-07-07 update): 11 of these 14
-- countries were flipped from coming_soon=true / price_feed_method='api'
-- (with an unverified 'KilimoSTAT' or 'WFP-VAM' source label) to
-- coming_soon=false / price_feed_method='scraper', after verifying a
-- real, working, no-key data source: the WFP Global Food Prices dataset,
-- republished on HDX (data.humdata.org/dataset/global-wfp-food-prices).
-- "WFP-VAM" was never actually verified - WFP's own api.vam.wfp.org and
-- dataviz.vam.wfp.org endpoints return HTTP 403 on direct request, and
-- KilimoSTAT (Kenya) was never checked live either. See
-- scraper/src/sources/wfp-food-prices.js and web_progress.md for the
-- full verification notes.
--
-- NOTE ON ZAMBIA/ZIMBABWE (re-verified 2026-07-08, still coming_soon):
-- exhaustively re-checked 8 candidate sources across both countries -
-- WFP global CSV, WFP's own dedicated per-country HDX datasets
-- (wfp-food-prices-for-zambia / -zimbabwe), World Bank RTFP, the FEWS
-- NET fdw.fews.net API, ZamStats, ZIMSTAT's Producer Price Index -
-- Agriculture, and Zimbabwe's Grain Marketing Board site. Every one is
-- either empty for these two countries, years-stale (Zambia groundnuts
-- last updated 2022; Zimbabwe maize/wheat/soybeans/sorghum all stale,
-- FEWS NET stopped 2022-04), or an aggregate index with no per-crop
-- breakdown (ZIMSTAT PPIA). None meet the bar for a genuinely current,
-- per-crop price, so both stay coming_soon rather than present stale or
-- index-only figures as live. Full detail in web/src/config/countries.ts
-- and web_progress.md.
--
-- NOTE ON YAM (added 2026-07-08): verified real, current WFP Global Food
-- Prices data for "Yam" in Nigeria and Cameroon - see
-- web/src/config/countries.ts CROP_LABELS comment and
-- scraper/src/sources/wfp-food-prices.js for exact figures. No SQL
-- changes needed here since crops are stored in web/src/config/
-- countries.ts, not in this table.
--
-- Run this AFTER 0001_init.sql on both staging and production projects.

insert into country_config (
  country_code, country_name, currency_code, currency_symbol,
  price_feed_source, price_feed_method, update_frequency,
  timezone, utc_offset_hours, scrape_utc_hour, active, coming_soon
) values
  -- ===== LIVE AT LAUNCH =====
  ('NG', 'Nigeria',        'NGN', '₦',  'NBS-FoodPriceTracking', 'scraper', 'daily', 'Africa/Lagos', 1, 2, true, false),
  ('GH', 'Ghana',          'GHS', '₵',  'admin',  'admin',   'weekly',  'Africa/Accra',    0,    3,  true,  false),
  ('ZA', 'South Africa',   'ZAR', 'R',  'DAFF',   'admin',   'weekly',  'Africa/Johannesburg', 2, 1, true,  false),
  ('BR', 'Brazil',         'BRL', 'R$', 'admin',  'admin',   'weekly',  'America/Sao_Paulo', -3, 6, true, false),
  ('GB', 'United Kingdom', 'GBP', '£',  'DEFRA',  'scraper', 'monthly', 'Europe/London',   0,    3,  true,  false),

  -- ===== NOW LIVE - WFP Global Food Prices (verified 2026-07-07) =====
  ('KE', 'Kenya',          'KES', 'KSh', 'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Nairobi',  3, 0, true, false),
  ('ET', 'Ethiopia',       'ETB', 'Br',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Addis_Ababa', 3, 0, true, false),
  ('TZ', 'Tanzania',       'TZS', 'TSh', 'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Dar_es_Salaam', 3, 0, true, false),
  ('UG', 'Uganda',         'UGX', 'USh', 'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Kampala',  3, 0, true, false),
  ('RW', 'Rwanda',         'RWF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Kigali',   2, 1, true, false),
  ('CM', 'Cameroon',       'XAF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Douala',   1, 2, true, false),
  ('CI', 'Ivory Coast',    'XOF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Abidjan',  0, 3, true, false),
  ('SN', 'Senegal',        'XOF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Dakar',    0, 3, true, false),
  ('MZ', 'Mozambique',     'MZN', 'MT',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Maputo',   2, 1, true, false),
  ('EG', 'Egypt',          'EGP', '£',   'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Cairo',    2, 1, true, false),
  ('ML', 'Mali',           'XOF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Bamako',   0, 3, true, false),
  ('BF', 'Burkina Faso',   'XOF', 'Fr',  'WFP-GlobalFoodPrices', 'scraper', 'monthly', 'Africa/Ouagadougou', 0, 3, true, false),

  -- ===== STILL COMING SOON - no verified source found yet =====
  ('ZM', 'Zambia',         'ZMW', 'ZK',  'WFP-GlobalFoodPrices', 'api', 'daily',   'Africa/Lusaka',   2, 1, false, true),
  ('ZW', 'Zimbabwe',       'USD', '$',   'unverified', 'api', 'daily',   'Africa/Harare',   2, 1, false, true)
on conflict (country_code) do nothing;
