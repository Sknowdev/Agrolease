import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
