import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing use of the AgroLease website and price data.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-28 pb-16">
      <p className="eyebrow">Terms</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-foreground/50">Last updated: July 2026</p>

      <div className="mt-8 space-y-8 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Price data</h2>
          <p className="mt-2">
            Crop prices shown on AgroLease are presented as AgroLease market reference prices,
            intended as a general guide. They are not a guarantee of the price you will
            receive or pay in an actual transaction, and should not be treated as financial
            advice.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Early access</h2>
          <p className="mt-2">
            Joining the Early Access list does not guarantee access to any specific feature or
            country by any specific date. We&apos;ll contact you using the details you provide
            as new features and countries become available.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p className="mt-2">
            You agree not to scrape, republish at scale, or misrepresent AgroLease&apos;s data
            as an official government or exchange source.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Site analytics</h2>
          <p className="mt-2">
            AgroLease uses cookieless, aggregate web analytics (see our{' '}
            <a href="/privacy" className="text-brand-green-light hover:underline">
              Privacy Policy
            </a>
            ) to understand how the site is used. This helps us prioritize which countries and
            crops to bring online next.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p className="mt-2">
            As the platform grows beyond price tracking into agreements, harvest records, and
            settlements, these terms will be expanded to cover that functionality.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-foreground/50">
        This is a living document and will be expanded as the platform launches more features.
      </p>
    </div>
  );
}
