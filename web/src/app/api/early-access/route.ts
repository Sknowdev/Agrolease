import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const VALID_ROLES = [
  'farmer',
  'buyer',
  'farm_operator',
  'land_owner',
  'cooperative',
  'exporter',
  'processor',
  'other',
];

// Very small in-memory rate limiter: this is a single-region Next.js
// deployment for now, so a per-IP counter in module scope is sufficient
// to blunt basic abuse without adding an external dependency. If this
// scales to multiple regions/instances, replace with a shared store
// (e.g. Upstash Redis) - flagged here for future reference.
const submissionsByIp = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many submissions. Please try again later.' } },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
      { status: 400 }
    );
  }

  // Honeypot field: real users never fill this in (it's visually hidden).
  // Bots that blindly fill every field will trip it.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }); // pretend success, drop silently
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const countryCode = typeof body.countryCode === 'string' ? body.countryCode.trim() : null;
  const role = typeof body.role === 'string' ? body.role.trim() : '';
  const farmSizeHectares =
    typeof body.farmSizeHectares === 'number' && Number.isFinite(body.farmSizeHectares)
      ? body.farmSizeHectares
      : null;
  const sourcePage = typeof body.sourcePage === 'string' ? body.sourcePage : null;

  if (!name || name.length > 200) {
    return NextResponse.json(
      { error: { code: 'INVALID_NAME', message: 'Please provide a valid name.', field: 'name' } },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.', field: 'email' } },
      { status: 400 }
    );
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: { code: 'INVALID_ROLE', message: 'Please select a valid role.', field: 'role' } },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error('[early-access] Supabase not configured:', (err as Error).message);
    return NextResponse.json(
      { error: { code: 'NOT_CONFIGURED', message: 'Signups are temporarily unavailable. Please try again soon.' } },
      { status: 503 }
    );
  }

  const { error } = await supabase.from('early_access_signups').insert({
    name,
    email,
    country_code: countryCode,
    role,
    farm_size_hectares: farmSizeHectares,
    source_page: sourcePage,
  });

  if (error) {
    console.error('[early-access] insert failed:', error.message);
    return NextResponse.json(
      { error: { code: 'INSERT_FAILED', message: 'Could not save your signup. Please try again.' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
