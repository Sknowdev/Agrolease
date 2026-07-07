import type { MetadataRoute } from 'next';
import { getAllPriceRoutes } from '@/config/countries';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agrolease.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const priceRoutes = getAllPriceRoutes().map(({ country, crop }) => ({
    url: `${siteUrl}/prices/${country}/${crop}`,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/prices`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/early-access`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    ...priceRoutes,
  ];
}
