import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AgroLease collects, uses, and protects your information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
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
            The public price pages do not require an account and do not use tracking cookies.
            If we add analytics in the future, this page will be updated first.
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
        records, settlements) launches and collects more than early-access signups.
      </p>
    </div>
  );
}
