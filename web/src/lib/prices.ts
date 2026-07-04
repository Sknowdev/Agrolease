import { getSupabaseClient } from './supabase';

export interface PricePoint {
  id: string;
  countryCode: string;
  cropName: string;
  priceLocal: number;
  currencyCode: string;
  priceUsd: number | null;
  source: string | null;
  dataDate: string; // ISO date, "YYYY-MM-DD"
  enteredBy: 'scraper' | 'admin';
}

export interface PriceSummary {
  latest: PricePoint;
  previous: PricePoint | null;
  lowest: number;
  highest: number;
  average: number;
  history: PricePoint[]; // ascending by date, most recent last
  trendPercent: number | null; // 7-day trend, null if not enough data
}

function mapRow(row: {
  id: string;
  country_code: string;
  crop_name: string;
  price_local: number;
  currency_code: string;
  price_usd: number | null;
  source: string | null;
  data_date: string;
  entered_by: 'scraper' | 'admin';
}): PricePoint {
  return {
    id: row.id,
    countryCode: row.country_code,
    cropName: row.crop_name,
    priceLocal: Number(row.price_local),
    currencyCode: row.currency_code,
    priceUsd: row.price_usd !== null ? Number(row.price_usd) : null,
    source: row.source,
    dataDate: row.data_date,
    enteredBy: row.entered_by,
  };
}

/**
 * Fetches price history for one country+crop, ordered most-recent-first
 * from the DB, then returns a summary shaped for the price page:
 * latest value, previous value, low/high across the returned window,
 * and a 7-day trend percentage when at least 2 data points exist.
 *
 * Returns null if there is no price data at all for this combination -
 * the page then renders the "not available yet" state, per the approved plan.
 */
export async function getPriceSummary(
  countryCode: string,
  cropName: string,
  { days = 30 }: { days?: number } = {}
): Promise<PriceSummary | null> {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    // No Supabase credentials configured yet (e.g. first local run before
    // .env.local is filled in). Treat as "no data" rather than crashing
    // the whole page - the coming-soon / not-available state covers this.
    console.warn('[prices] Supabase not configured:', (err as Error).message);
    return null;
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('commodity_prices')
    .select(
      'id, country_code, crop_name, price_local, currency_code, price_usd, source, data_date, entered_by'
    )
    .eq('country_code', countryCode.toUpperCase())
    .eq('crop_name', cropName)
    .gte('data_date', sinceIso)
    .order('data_date', { ascending: false });

  if (error) {
    console.error(`[prices] failed to fetch ${countryCode}/${cropName}:`, error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  const rows = data.map(mapRow);
  const latest = rows[0];
  const previous = rows[1] ?? null;
  const values = rows.map((r) => r.priceLocal);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  // 7-day trend: compare latest to the row closest to 7 days before latest.
  let trendPercent: number | null = null;
  const latestDate = new Date(latest.dataDate);
  const sevenDaysAgo = new Date(latestDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const baseline = rows.find((r) => new Date(r.dataDate) <= sevenDaysAgo);
  if (baseline && baseline.priceLocal > 0) {
    trendPercent = ((latest.priceLocal - baseline.priceLocal) / baseline.priceLocal) * 100;
  }

  return {
    latest,
    previous,
    lowest,
    highest,
    average,
    history: [...rows].reverse(), // ascending for charting
    trendPercent,
  };
}
