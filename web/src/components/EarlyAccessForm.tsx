'use client';

import { useState, type FormEvent } from 'react';

const ROLES = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'farm_operator', label: 'Farm Operator' },
  { value: 'land_owner', label: 'Land Owner' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'processor', label: 'Processor' },
  { value: 'other', label: 'Other' },
];

export function EarlyAccessForm({ sourcePage }: { sourcePage?: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      countryCode: formData.get('countryCode') || null,
      role: formData.get('role'),
      farmSizeHectares: formData.get('farmSizeHectares')
        ? Number(formData.get('farmSizeHectares'))
        : null,
      sourcePage: sourcePage ?? null,
      website: formData.get('website'), // honeypot
    };

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrorMessage(body?.error?.message ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-green-light/40 bg-brand-green/10 p-6 sm:p-8 text-center"
      >
        <h3 className="text-xl font-semibold">Thank you</h3>
        <p className="mt-2 text-foreground/70">
          You&apos;re on the list. We&apos;ll email you as AgroLease becomes available in your
          country.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot: hidden from real users, catches basic bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input
            name="name"
            type="text"
            required
            maxLength={200}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Country</span>
          <input
            name="countryCode"
            type="text"
            placeholder="e.g. Nigeria"
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Role</span>
          <select
            name="role"
            required
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="" disabled>
              Select a role
            </option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span>Farm size (hectares, optional)</span>
          <input
            name="farmSizeHectares"
            type="number"
            min={0}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
      </div>

      {status === 'error' && errorMessage && (
        <p role="alert" className="text-sm text-red-500">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto rounded-full bg-brand-green px-6 py-3 font-semibold text-white hover:bg-brand-green-light transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Get Early Access'}
      </button>

      {/* Trust line near the submit button, per feedback - a single
          reassurance sentence like this can measurably increase signup
          completion. */}
      <p className="text-xs text-foreground/50">
        We respect your privacy. We&apos;ll only email you about AgroLease updates and launch
        announcements.
      </p>
    </form>
  );
}
