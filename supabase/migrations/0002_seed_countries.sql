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

  -- ===== COMING SOON (routes exist, no live data yet) =====
  ('KE', 'Kenya',          'KES', 'KSh', 'KilimoSTAT', 'api', 'daily',   'Africa/Nairobi',  3, 0, false, true),
  ('ET', 'Ethiopia',       'ETB', 'Br',  'WFP-VAM',    'api', 'daily',   'Africa/Addis_Ababa', 3, 0, false, true),
  ('TZ', 'Tanzania',       'TZS', 'TSh', 'WFP-VAM',    'api', 'daily',   'Africa/Dar_es_Salaam', 3, 0, false, true),
  ('UG', 'Uganda',         'UGX', 'USh', 'WFP-VAM',    'api', 'daily',   'Africa/Kampala',  3, 0, false, true),
  ('RW', 'Rwanda',         'RWF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Kigali',   2, 1, false, true),
  ('ZM', 'Zambia',         'ZMW', 'ZK',  'WFP-VAM',    'api', 'daily',   'Africa/Lusaka',   2, 1, false, true),
  ('CM', 'Cameroon',       'XAF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Douala',   1, 2, false, true),
  ('CI', 'Ivory Coast',    'XOF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Abidjan',  0, 3, false, true),
  ('SN', 'Senegal',        'XOF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Dakar',    0, 3, false, true),
  ('MZ', 'Mozambique',     'MZN', 'MT',  'WFP-VAM',    'api', 'daily',   'Africa/Maputo',   2, 1, false, true),
  ('ZW', 'Zimbabwe',       'USD', '$',   'WFP-VAM',    'api', 'daily',   'Africa/Harare',   2, 1, false, true),
  ('EG', 'Egypt',          'EGP', '£',   'WFP-VAM',    'api', 'daily',   'Africa/Cairo',    2, 1, false, true),
  ('ML', 'Mali',           'XOF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Bamako',   0, 3, false, true),
  ('BF', 'Burkina Faso',   'XOF', 'Fr',  'WFP-VAM',    'api', 'daily',   'Africa/Ouagadougou', 0, 3, false, true)
on conflict (country_code) do nothing;
