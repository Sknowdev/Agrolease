import type { Metadata } from 'next';
import { EarlyAccessForm } from '@/components/EarlyAccessForm';

export const metadata: Metadata = {
  title: 'Get Early Access',
  description: 'Join the AgroLease early access list to be notified as we launch in your country.',
  alternates: { canonical: '/early-access' },
};

export default function EarlyAccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-center">Get Early Access</h1>
      <p className="mt-3 text-foreground/70 text-center">
        Tell us a bit about yourself and we&apos;ll notify you as AgroLease becomes available in
        your country.
      </p>
      <div className="mt-8">
        <EarlyAccessForm sourcePage="/early-access" />
      </div>
    </div>
  );
}
