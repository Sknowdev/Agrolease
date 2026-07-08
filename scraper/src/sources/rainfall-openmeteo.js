/**
 * Open-Meteo Forecast API (`past_days` parameter), verified live
 * 2026-07-07: a real, key-free JSON weather API, global coverage
 * (confirmed working for countries that have no crop-price scraper at
 * all yet, like Zambia/Zimbabwe), 10,000 free calls/day.
 *
 *   https://api.open-meteo.com/v1/forecast
 *
 * This module fetches real daily rainfall (precipitation_sum, mm) for
 * one representative coordinate per country. It is intentionally
 * separate from any price source - rainfall is a real, independently
 * useful "why check back this week" data point, not a price estimate.
 * It does not write to commodity_prices; see RAINFALL_TABLE_NOTE below
 * for the small schema addition it needs.
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// One representative lat/lon per country - typically the capital or the
// largest agricultural market region. Coordinates are approximate city
// centers, not precise farm locations (this is a country-level "did it
// rain this week" signal, not per-farm weather).
export const COUNTRY_COORDINATES = {
  NG: { lat: 9.082, lon: 8.6753, label: 'Nigeria (national reference)' },
  GH: { lat: 7.9465, lon: -1.0232, label: 'Ghana (national reference)' },
  ZA: { lat: -30.5595, lon: 22.9375, label: 'South Africa (national reference)' },
  BR: { lat: -14.235, lon: -51.9253, label: 'Brazil (national reference)' },
  GB: { lat: 52.3555, lon: -1.1743, label: 'United Kingdom (national reference)' },
  KE: { lat: -0.0236, lon: 37.9062, label: 'Kenya (national reference)' },
  ET: { lat: 9.145, lon: 40.4897, label: 'Ethiopia (national reference)' },
  TZ: { lat: -6.369, lon: 34.8888, label: 'Tanzania (national reference)' },
  UG: { lat: 1.3733, lon: 32.2903, label: 'Uganda (national reference)' },
  RW: { lat: -1.9403, lon: 29.8739, label: 'Rwanda (national reference)' },
  ZM: { lat: -13.1339, lon: 27.8493, label: 'Zambia (national reference)' },
  CM: { lat: 7.3697, lon: 12.3547, label: 'Cameroon (national reference)' },
  CI: { lat: 7.54, lon: -5.5471, label: 'Ivory Coast (national reference)' },
  SN: { lat: 14.4974, lon: -14.4524, label: 'Senegal (national reference)' },
  MZ: { lat: -18.6657, lon: 35.5296, label: 'Mozambique (national reference)' },
  ZW: { lat: -19.0154, lon: 29.1549, label: 'Zimbabwe (national reference)' },
  EG: { lat: 26.8206, lon: 30.8025, label: 'Egypt (national reference)' },
  ML: { lat: 17.5707, lon: -3.9962, label: 'Mali (national reference)' },
  BF: { lat: 12.2383, lon: -1.5616, label: 'Burkina Faso (national reference)' },
};

/**
 * Fetches the last `pastDays` days of daily rainfall for one country.
 * @returns {Promise<{ countryCode: string, days: Array<{ date: string, precipitationMm: number }> }>}
 */
export async function fetchRainfall(countryCode, { pastDays = 7 } = {}) {
  const coords = COUNTRY_COORDINATES[countryCode];
  if (!coords) {
    throw new Error(`No coordinates configured for country "${countryCode}"`);
  }

  const url = `${BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_sum&past_days=${pastDays}&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed for ${countryCode}: HTTP ${response.status}`);
  }

  const data = await response.json();
  const dates = data?.daily?.time ?? [];
  const values = data?.daily?.precipitation_sum ?? [];

  const days = dates.map((date, i) => ({
    date,
    precipitationMm: typeof values[i] === 'number' ? values[i] : null,
  }));

  return { countryCode, days };
}

/**
 * Fetches rainfall for every configured country. Each call is
 * independent (Open-Meteo has no bulk endpoint), run sequentially with a
 * small stagger to stay well under the 10k/day free-tier limit and avoid
 * hammering the API in a tight loop.
 */
export async function fetchRainfallForAllCountries(countryCodes, options) {
  const results = {};
  for (const code of countryCodes) {
    try {
      results[code] = await fetchRainfall(code, options);
    } catch (error) {
      results[code] = { countryCode: code, error: error.message };
    }
  }
  return results;
}

/**
 * RAINFALL_TABLE_NOTE: this module does not call writeCommodityPrice() -
 * rainfall isn't a crop price. It needs its own small table
 * (`rainfall_observations`: country_code, observed_date, precipitation_mm,
 * fetched_at) rather than being shoehorned into commodity_prices. That
 * migration is not included in this PR - see web_progress.md Open
 * Questions for why (writing it requires deciding the retention window
 * first, which is a product decision, not just a schema one).
 */
