-- Rollback for 0003_add_price_normalization_columns.sql

drop index if exists idx_commodity_prices_source_type;

alter table commodity_prices
  drop column if exists source_type,
  drop column if exists price_per_tonne,
  drop column if exists unit_raw,
  drop column if exists unit_type;
