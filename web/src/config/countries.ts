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
    source: 'FMARD (Federal Ministry of Agriculture)',
    crops: ['maize', 'cassava', 'rice', 'sorghum', 'groundnuts', 'soybeans'],
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
    priceFeedMethod: 'scraper',
    source: 'IBGE (Brazilian Institute of Geography and Statistics)',
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

  // ===== COMING SOON =====
  {
    code: 'KE',
    slug: 'kenya',
    name: 'Kenya',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    live: false,
    priceFeedMethod: 'api',
    source: 'KilimoSTAT',
    crops: ['maize', 'coffee'],
  },
  {
    code: 'ET',
    slug: 'ethiopia',
    name: 'Ethiopia',
    currencyCode: 'ETB',
    currencySymbol: 'Br',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'coffee'],
  },
  {
    code: 'TZ',
    slug: 'tanzania',
    name: 'Tanzania',
    currencyCode: 'TZS',
    currencySymbol: 'TSh',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'sorghum'],
  },
  {
    code: 'UG',
    slug: 'uganda',
    name: 'Uganda',
    currencyCode: 'UGX',
    currencySymbol: 'USh',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'coffee'],
  },
  {
    code: 'RW',
    slug: 'rwanda',
    name: 'Rwanda',
    currencyCode: 'RWF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'coffee'],
  },
  {
    code: 'ZM',
    slug: 'zambia',
    name: 'Zambia',
    currencyCode: 'ZMW',
    currencySymbol: 'ZK',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'groundnuts'],
  },
  {
    code: 'CM',
    slug: 'cameroon',
    name: 'Cameroon',
    currencyCode: 'XAF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['cocoa', 'palm-oil'],
  },
  {
    code: 'CI',
    slug: 'ivory-coast',
    name: 'Ivory Coast',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['cocoa', 'palm-oil'],
  },
  {
    code: 'SN',
    slug: 'senegal',
    name: 'Senegal',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['groundnuts', 'rice'],
  },
  {
    code: 'MZ',
    slug: 'mozambique',
    name: 'Mozambique',
    currencyCode: 'MZN',
    currencySymbol: 'MT',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['maize', 'cassava'],
  },
  {
    code: 'ZW',
    slug: 'zimbabwe',
    name: 'Zimbabwe',
    currencyCode: 'USD',
    currencySymbol: '$',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['wheat', 'maize'],
  },
  {
    code: 'EG',
    slug: 'egypt',
    name: 'Egypt',
    currencyCode: 'EGP',
    currencySymbol: '£',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['wheat', 'rice'],
  },
  {
    code: 'ML',
    slug: 'mali',
    name: 'Mali',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['sorghum', 'groundnuts'],
  },
  {
    code: 'BF',
    slug: 'burkina-faso',
    name: 'Burkina Faso',
    currencyCode: 'XOF',
    currencySymbol: 'Fr',
    live: false,
    priceFeedMethod: 'api',
    source: 'WFP VAM',
    crops: ['sorghum', 'groundnuts'],
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
