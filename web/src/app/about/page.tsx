import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'What AgroLease is, who it is for, and where the project is headed.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">About AgroLease</h1>

      <div className="mt-8 space-y-6 text-foreground/80 leading-relaxed">
        <p>
          AgroLease helps landowners and agricultural businesses manage leases, verify
          harvests, monitor market prices, and keep tamper-evident records for every
          transaction. Land disputes, spreadsheet errors, and undocumented harvests cost real
          money every season - AgroLease replaces that fragmented paperwork with one system
          both sides can trust.
        </p>
        <p>
          We&apos;re starting with a public, daily crop-price reference - live now for Nigeria,
          Ghana, South Africa, Brazil, and the UK, with more countries already indexed as
          &quot;coming soon.&quot; The full agreement, harvest-record, and settlement platform
          is in active development.
        </p>
        <p>
          AgroLease is an early-stage company. This page will be updated with our team,
          milestones, and press as the platform grows - for now, the fastest way to reach us
          is through the contact links in the footer.
        </p>
      </div>

      <p className="mt-10 text-sm text-foreground/50">
        This page is a living document and will be expanded over time.
      </p>
    </div>
  );
}
