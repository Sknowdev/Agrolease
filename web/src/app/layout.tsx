import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agrolease.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AgroLease - Live Crop Prices, Verified by Country',
    template: '%s | AgroLease',
  },
  description:
    'AgroLease helps landowners, agricultural companies, and farm operators track crop prices, record harvests, protect agreements, and reduce costly disputes - all in one platform.',
  openGraph: {
    type: 'website',
    siteName: 'AgroLease',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        {/*
         * No top padding here on purpose: the header is now `fixed`
         * (floating capsule, see SiteHeader) rather than `sticky`, and
         * the homepage hero is meant to bleed all the way to the top of
         * the viewport with the pill floating over it - that's the whole
         * point of the "floating nav over full-bleed image" look. Every
         * OTHER page (no full-bleed top section) adds its own top
         * padding/margin to clear the floating pill instead - see
         * about/page.tsx, platform/page.tsx, prices/[country]/[crop]/page.tsx,
         * etc. for the `pt-28` convention used there.
         */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/*
         * Vercel Web Analytics (2026-07-10, per request to "introduce
         * analysis"). Cookieless, no personal data collected, works
         * automatically since this app already deploys on Vercel - no new
         * account, no new vendor login. Page views/visitor counts appear
         * directly in the Vercel dashboard's Analytics tab for this
         * project. Disclosed honestly in /privacy below.
         */}
        <Analytics />
      </body>
    </html>
  );
}
