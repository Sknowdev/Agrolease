-- AgroLease - Crop Price Site - Initial schema
-- Reuses the exact table shapes from ABS Section 1 (country_config,
-- commodity_prices, exchange_rates) so the future mobile app backend
-- extends this data without a rebuild. Adds two new tables specific to
-- this price site: early_access_signups and scraper_run_logs.
--
-- Apply to BOTH the staging and production Supabase projects.
-- Run in the Supabase SQL editor, or via `supabase db push` if you have
-- the Supabase CLI linked to the project.

-- ---------------------------------------------------------------------------
-- country_config (from ABS Section 1)
-- ---------------------------------------------------------------------------
create table if not exists country_config (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique,          -- e.g. 'NG', 'GH', 'GB'
  country_name text not null,
  currency_code text not null,                 -- e.g. 'NGN'
  currency_symbol text not null,                -- e.g. '₦'
  price_feed_source text,                       -- e.g. 'FMARD', 'DEFRA'
  price_feed_method text,                       -- e.g. 'scraper', 'admin'
  update_frequency text,                        -- e.g. 'daily', 'weekly', 'monthly'
  timezone text,
  utc_offset_hours numeric,
  scrape_utc_hour int,
  active boolean not null default false,
  coming_soon boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_country_config_active on country_config(active);

-- ---------------------------------------------------------------------------
-- commodity_prices (from ABS Section 1)
-- ---------------------------------------------------------------------------
create table if not exists commodity_prices (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references country_config(country_code),
  crop_name text not null,                      -- lowercase, e.g. 'maize'
  price_local numeric not null,
  currency_code text not null,
  price_usd numeric,
  exchange_rate numeric,
  source text,                                  -- e.g. 'FMARD', 'DEFRA', 'admin'
  data_date date not null,
  entered_by text not null default 'scraper' check (entered_by in ('scraper', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists idx_commodity_prices_country_crop_date
  on commodity_prices(country_code, crop_name, data_date desc);

-- ---------------------------------------------------------------------------
-- exchange_rates (from ABS Section 1)
-- ---------------------------------------------------------------------------
create table if not exists exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null default 'USD',
  target_currency text not null,
  rate numeric not null,                        -- 1 USD = `rate` target_currency
  fetched_at timestamptz not null default now()
);

create index if not exists idx_exchange_rates_target on exchange_rates(target_currency, fetched_at desc);

-- ---------------------------------------------------------------------------
-- early_access_signups (new - this site's waitlist / market validation data)
-- ---------------------------------------------------------------------------
create table if not exists early_access_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  country_code text,                            -- free text; not FK, since
                                                  -- signups can come from any country
  role text not null check (role in (
    'farmer', 'buyer', 'farm_operator', 'land_owner',
    'cooperative', 'exporter', 'processor', 'other'
  )),
  farm_size_hectares numeric,                    -- optional, per suggestion #7
  source_page text,                              -- which /prices/... page they signed up from
  created_at timestamptz not null default now()
);

create index if not exists idx_early_access_email on early_access_signups(email);
create index if not exists idx_early_access_created_at on early_access_signups(created_at desc);

-- ---------------------------------------------------------------------------
-- scraper_run_logs (new - operational visibility, mirrors ABS admin panel's
-- "scraper status: last run, last success, any failures")
-- ---------------------------------------------------------------------------
create table if not exists scraper_run_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                         -- e.g. 'nigeria', 'uk'
  status text not null check (status in ('success', 'partial', 'failed')),
  rows_written int not null default 0,
  rows_skipped int not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_scraper_run_logs_source_date on scraper_run_logs(source, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) role can only READ country_config and commodity_prices,
-- and INSERT into early_access_signups (the waitlist form). Everything
-- else requires the service_role key, which only the scraper/admin use.
-- ---------------------------------------------------------------------------
alter table country_config enable row level security;
alter table commodity_prices enable row level security;
alter table exchange_rates enable row level security;
alter table early_access_signups enable row level security;
alter table scraper_run_logs enable row level security;

drop policy if exists "public read country_config" on country_config;
create policy "public read country_config" on country_config
  for select using (true);

drop policy if exists "public read commodity_prices" on commodity_prices;
create policy "public read commodity_prices" on commodity_prices
  for select using (true);

drop policy if exists "public insert early_access_signups" on early_access_signups;
create policy "public insert early_access_signups" on early_access_signups
  for insert with check (true);

-- No public policies on exchange_rates or scraper_run_logs: internal only.
-- No public UPDATE/DELETE policy anywhere: writes beyond the waitlist INSERT
-- always go through the service_role key (scraper / future admin panel).
