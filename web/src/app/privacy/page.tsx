import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AgroLease collects, uses, and protects your information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-28 pb-16">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-foreground/50">Last updated: July 2026</p>

      <div className="mt-8 space-y-8 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <p className="mt-2">
            Today, the only personal information AgroLease collects is what you submit through
            our Early Access form: your name, email, country, role, and (optionally) farm size.
            We use this only to notify you as AgroLease becomes available in your country and
            to understand demand across regions and roles.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we don&apos;t do</h2>
          <p className="mt-2">
            We do not sell your information to third parties. We do not send marketing email
            beyond product launch updates you&apos;ve signed up for.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Cookies and analytics</h2>
          <p className="mt-2">
            AgroLease uses Vercel Web Analytics to understand overall site traffic - which
            pages are visited, approximate visitor counts, referring sites, and general
            location at the country level. This is cookieless: it does not use tracking
            cookies, does not build a profile of you individually, and does not collect
            personal information such as your name or email through your browsing activity
            alone. It is separate from, and never linked to, anything you submit through the
            Early Access form.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Accessing your Early Access information
          </h2>
          <p className="mt-2">
            If you&apos;ve joined Early Access and want to know what information we hold about
            you, have it corrected, or have it deleted, contact us at the email address in the
            footer and we will action the request directly in our records.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to the email address in the footer.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-foreground/50">
        This is a living document and will be expanded as the platform (agreements, harvest
        records, settlements) launches and collects more than early-access signups and
        aggregate site-traffic analytics.
      </p>
    </div>
  );
}
