import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';

import healthRoute from './routes/health.js';
import homeRoute from './routes/home.js';
import profilesRoute from './routes/profiles.js';
import securityRoute from './routes/security.js';

// Load the repo root .env explicitly, resolved relative to this file's
// own location (not process.cwd()) - same fix already applied to
// scraper/src/lib/supabaseClient.js (see PR #18) so this backend
// behaves identically regardless of which directory it's started from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 4000;
const HOST = process.env.BACKEND_HOST ?? '0.0.0.0';

/**
 * AgroLease mobile app backend.
 *
 * Task 1 scope only: this server exists to prove it can run locally
 * (npm run dev / docker run) and respond on /health. No business logic,
 * no auth, no routes beyond /health - those come with Task 2 onward.
 *
 * Built platform-agnostic on purpose (plain Node + Fastify, Dockerfile,
 * no Railway/Vercel-specific SDK) per the confirmed decision to drop
 * Railway project-wide - see docs/CHANGE_LOG_PRODUCT_PLAN.md. This task
 * does not deploy it anywhere live.
 */
function buildServer() {
  const app = Fastify({ logger: true });
  // CORS is only relevant when testing via `expo start --web` (a real
  // browser origin, e.g. :8081, calling this API on a different origin,
  // e.g. :4055/4000) - native iOS/Android builds never send an Origin
  // header and are unaffected either way. Wide-open in development
  // (no NODE_ENV=production set anywhere in this task) since there is
  // no browser-based production deployment of this API planned; revisit
  // with an explicit allowlist if/when this backend is ever fronted by
  // a real web client in production.
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.register(healthRoute);
  // Task 2 routes - all under /v1/ per the Constitution's API
  // versioning rule ("A URL without a version prefix will never exist
  // in production" - /health is the one pre-existing exception from
  // Task 1, kept as-is rather than retroactively versioning it).
  app.register(profilesRoute);
  app.register(securityRoute);
  app.register(homeRoute);
  return app;
}

async function main() {
  const app = buildServer();
  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();

export { buildServer };
