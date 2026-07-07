/**
 * Country + crop configuration for the AgroLease price site.
 *
 * This mirrors country_config in Supabase but is duplicated here as a
 * typed constant because Next.js needs it at build time (generateStaticParams)
 * without an extra network round trip. If a country is added or removed here,
 * the corresponding Supabase migration (supabase/migrations/0002_seed_countries.sql)
 * must be updated to match.
 *
 * Crop lists are curated per country for SEO relevance, not forced through
 * a full 12-crop matrix - each country only lists the 1-4 crops people
 * actually search for in that market. See web_progress.md for how each
 * list was decided and which ones are backed by a real scraper vs. an
 * admin-entered reference price.
 */

export type PriceFeedMethod = 'scraper' | 'admin' | 'api';

export interface CountryConfig {
  code: string; // ISO-ish code used in country_config, e.g. "NG"
  slug: string; // URL slug, e.g. "nigeria"
  name: string;
  currencyCode: string;
  currencySymbol: string;
  live: boolean; // true = has real price data (scraped or admin-entered)
  priceFeedMethod: PriceFeedMethod;
  source: string; // human-readable source name shown on the price card
  crops: string[]; // crop slugs, e.g. ["maize", "cassava"]
}

export const CROP_LABELS: Record<string, string> = {
  maize: 'Maize',
  rice: 'Rice',
  cassava: 'Cassava',
  sorghum: 'Sorghum',
  groundnuts: 'Groundnuts',
  soybeans: 'Soybeans',
  cocoa: 'Cocoa',
  wheat: 'Wheat',
  sugarcane: 'Sugarcane',
  coffee: 'Coffee',
  'palm-oil': 'Palm Oil',
  ginger: 'Ginger',
};

export const COUNTRIES: CountryConfig[] = [
  // ===== LIVE AT LAUNCH =====
  {
    code: 'NG',
    slug: 'nigeria',
    name: 'Nigeria',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    live: true,
    priceFeedMethod: 'scraper',
    // Source changed from the originally planned FMARD (Federal Ministry of
    // Agriculture) to NBS Food Price Tracking after live verification found
    // fmard.gov.ng now redirects to agriculture.gov.ng with no price pages
    // at all. NBS's dataset also doesn't cover cassava/groundnuts, so those
    // two crops are intentionally left out here rather than faked - see
    // web_progress.md.
    source: 'NBS Food Price Tracking (National Bureau of Statistics)',
    crops: ['maize', 'rice', 'sorghum', 'soybeans'],
  },
  {
    code: 'GH',
    slug: 'ghana',
    name: 'Ghana',
    currencyCode: 'GHS',
    currencySymbol: '₵',
    live: true,
    priceFeedMethod: 'admin',
    source: 'AgroLease market reference (Ghana)',
    crops: ['maize', 'cocoa', 'soybeans', 'sorghum'],
  },
  {
    code: 'ZA',
    slug: 'south-africa',
    name: 'South Africa',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    live: true,
    priceFeedMethod: 'admin',
    source: 'DAFF / National Department of Agriculture',
    crops: ['maize', 'wheat', 'sugarcane', 'soybeans'],
  },
  {
    code: 'BR',
    slug: 'brazil',
    name: 'Brazil',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    live: true,
    // Downgraded from 'scraper' to 'admin' after live verification: CONAB's
    // own site is a JS-only consulta tool (not scrapable), and IBGE/SIDRA
    // (the tentative substitute from an earlier session) has no
    // crop-specific price aggregate at all - only production/yield surveys
    // and general consumer price indices. See web_progress.md.
    priceFeedMethod: 'admin',
    source: 'AgroLease market reference (Brazil)',
    crops: ['soybeans', 'coffee', 'sugarcane', 'maize'],
  },
  {
    code: 'GB',
    slug: 'uk',
    name: 'United Kingdom',
    currencyCode: 'GBP',
    currencySymbol: '£',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'DEFRA (Department for Environment, Food & Rural Affairs)',
    crops: ['wheat'],
  },

  // ===== NOW LIVE - real WFP Global Food Prices scraper =====
  // Flipped from "coming soon" placeholders to live, scraper-backed
  // countries after verifying (2026-07-07) that the WFP Global Food
  // Prices dataset (HDX-hosted, no key required) has real, current,
  // market-level price data for each of these. See
  // scraper/src/sources/wfp-food-prices.js for the full source
  // verification notes and exactly which crops are covered per country -
  // crop lists below only include what was confirmed present in the
  // live data, not the originally planned wishlist (e.g. Kenya/Uganda/
  // Rwanda's "coffee" and Cameroon/Ivory Coast's "cocoa" were dropped -
  // WFP's food-security-focused collection doesn't track those export
  // crops in those countries). The previously listed source "KilimoSTAT"
  // (Kenya) and "WFP VAM" were both replaced - KilimoSTAT was never
  // actually verified, and WFP's own api.vam.wfp.org/dataviz.vam.wfp.org
  // endpoints return HTTP 403 on direct request; this is the real,
  // working HDX-republished path instead.
  {
    code: 'KE',
    slug: 'kenya',
    name: 'Kenya',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['maize'],
  },
  {
    code: 'ET',
    slug: 'ethiopia',
    name: 'Ethiopia',
    currencyCode: 'ETB',
    currencySymbol: 'Br',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['maize', 'coffee'],
  },
  {
    code: 'TZ',
    slug: 'tanzania',
    name: 'Tanzania',
    currencyCode: 'TZS',
    currencySymbol: 'TSh',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['maize', 'sorghum'],
  },
  {
    code: 'UG',
    slug: 'uganda',
    name: 'Uganda',
    currencyCode: 'UGX',
    currencySymbol: 'USh',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['maize'],
  },
  {
    code: 'RW',
    slug: 'rwanda',
    name: 'Rwanda',
    currencyCode: 'RWF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['maize'],
  },
  {
    code: 'CM',
    slug: 'cameroon',
    name: 'Cameroon',
    currencyCode: 'XAF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['palm-oil'],
  },
  {
    code: 'CI',
    slug: 'ivory-coast',
    name: 'Ivory Coast',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['palm-oil'],
  },
  {
    code: 'SN',
    slug: 'senegal',
    name: 'Senegal',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['groundnuts', 'rice'],
  },
  {
    code: 'MZ',
    slug: 'mozambique',
    name: 'Mozambique',
    currencyCode: 'MZN',
    currencySymbol: 'MT',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    // "cassava" dropped - not present in Mozambique's WFP data; "maize"
    // is tracked as "Maize meal" there, which the scraper module maps.
    crops: ['maize'],
  },
  {
    code: 'EG',
    slug: 'egypt',
    name: 'Egypt',
    currencyCode: 'EGP',
    currencySymbol: '£',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['wheat', 'rice'],
  },
  {
    code: 'ML',
    slug: 'mali',
    name: 'Mali',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['sorghum', 'groundnuts'],
  },
  {
    code: 'BF',
    slug: 'burkina-faso',
    name: 'Burkina Faso',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: true,
    priceFeedMethod: 'scraper',
    source: 'WFP Global Food Prices',
    crops: ['sorghum', 'groundnuts'],
  },

  // ===== STILL COMING SOON - no verified source found yet =====
  {
    code: 'ZM',
    slug: 'zambia',
    name: 'Zambia',
    currencyCode: 'ZMW',
    currencySymbol: 'ZK',
    live: false,
    priceFeedMethod: 'api',
    // WFP's 2026 data for Zambia currently has only one commodity
    // ("Salt") - nothing matching maize or groundnuts yet. Left as
    // "coming soon" rather than scraping a source with no real crop
    // data for this country. Re-check scraper/src/sources/wfp-food-prices.js
    // periodically - WFP may add more Zambia markets/commodities later.
    source: 'WFP Global Food Prices (no crop data yet)',
    crops: ['maize', 'groundnuts'],
  },
  {
    code: 'ZW',
    slug: 'zimbabwe',
    name: 'Zimbabwe',
    currencyCode: 'USD',
    currencySymbol: '$',
    live: false,
    priceFeedMethod: 'api',
    // Not in the WFP Global Food Prices country list at all (63 countries
    // covered, Zimbabwe is not one of them) - no verified source found.
    source: 'Not yet verified',
    crops: ['wheat', 'maize'],
  },
];

export function getCountryBySlug(slug: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}

export function getCountryByCode(code: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function getCropLabel(cropSlug: string): string {
  return CROP_LABELS[cropSlug] ?? cropSlug;
}

/** All valid (country, crop) route pairs, for generateStaticParams. */
export function getAllPriceRoutes(): Array<{ country: string; crop: string }> {
  return COUNTRIES.flatMap((country) =>
    country.crops.map((crop) => ({ country: country.slug, crop }))
  );
}
