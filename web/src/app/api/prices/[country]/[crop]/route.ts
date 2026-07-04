import { NextResponse } from 'next/server';
import { getCountryBySlug } from '@/config/countries';
import { getPriceSummary } from '@/lib/prices';

/**
 * Backs the homepage's interactive "Live Commodity Prices" widget
 * (client component with country/crop dropdowns). The static
 * /prices/[country]/[crop] page is still the canonical, indexable,
 * server-rendered SEO page for each crop - this route only exists so the
 * homepage widget can re-fetch a summary on the client without a full
 * page navigation when someone changes the dropdown.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string; crop: string }> }
) {
  const { country: countrySlug, crop: cropSlug } = await params;
  const country = getCountryBySlug(countrySlug);

  if (!country || !country.crops.includes(cropSlug)) {
    return NextResponse.json({ summary: null }, { status: 200 });
  }

  const summary = await getPriceSummary(country.code, cropSlug);
  return NextResponse.json({ summary });
}
