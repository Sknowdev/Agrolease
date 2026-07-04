-- Rollback for 0001_init.sql
-- Drops everything created by the initial migration, in dependency order.

drop policy if exists "public insert early_access_signups" on early_access_signups;
drop policy if exists "public read commodity_prices" on commodity_prices;
drop policy if exists "public read country_config" on country_config;

drop table if exists scraper_run_logs;
drop table if exists early_access_signups;
drop table if exists exchange_rates;
drop table if exists commodity_prices;
drop table if exists country_config;
