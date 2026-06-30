AGROLEASE ENGINEERING CONSTITUTION
Permanent Rules — Attached to Every Build Session
This document never changes between sections. Every AI agent working on AgroLease reads this first. It defines how everything must always be built — not what to build.

CORE IDENTITY
AgroLease is an agricultural partnership management platform. It records agreements, tracks harvests, generates verified invoices, and maintains tamper-evident audit trails between land owners and farm operators.
AgroLease never moves money between partners. It records and verifies. That is the product.

DATA INTEGRITY RULES — NON-NEGOTIABLE
These rules apply to every record, in every country, in every version, forever.
Sealed records are immutable. Once a harvest record is sealed, it is never overwritten silently. Any modification after sealing must preserve the original value in original_values (jsonb), set is_tampered: true, and append a permanent entry to audit_flags. There are no exceptions to this rule — not for admin, not for support, not for bug fixes.
Every record carries the Conduit ID and Land Label. No harvest record, invoice, dispute log, or compliance export leaves the system without both the Conduit ID and the human-readable Land Label denormalized onto it. This is enforced at write time, not display time.
Photos are mandatory on every harvest record. The gate logging flow does not advance without a photo. This is enforced at the UI level (submit button disabled) and at the API level (record rejected if no photo URL). There are no exceptions.
AgroLease never touches settlement money. The platform generates verified invoices and tracks payment confirmation. Money moves directly between partners through their banking relationship. No escrow, no wallet, no payment processing between partners.

ARCHITECTURAL RULES
Geography is configuration, not code. Country, currency, payment provider, price feed source, overwrite fee floor, scrape UTC hour, and compliance template all live in country_config. No country-specific logic ever enters application code. Adding a new country means inserting one row — nothing else.
Heavy computation lives on the backend. The mobile app displays data, collects input, uploads files, and receives notifications. All logic — scoring, geometry, satellite processing, scraping, invoice calculation, audit flagging — runs on backend services. The app is a display and input layer, always.
The mobile app stays lightweight regardless of the number of supported countries. Feature surface grows through configuration and backend services. The app binary never grows proportionally to country count.
One shared database. The Fastify backend, scraping bot, satellite bot, and notification service all read from and write to the same Supabase database. The mobile app never calls Supabase or any external service directly — everything routes through the Fastify API.
Feature flags from day one. Every feature that is not yet live is controlled by a feature_flags row, not by hardcoded conditionals. This enables gradual rollout, country-by-country activation, beta testing, and backend rollout without app store updates.

PRODUCT RULES
Coming Soon instead of hidden. Every deferred feature is visible in the app as a Coming Soon state. Users must understand where the product is going. Hidden features erode trust. Coming Soon states build it.
Test every milestone before moving to the next. No feature stacking. No unfinished work carried forward. Each milestone ends only when every test in that milestone passes.
Vertical slices over horizontal feature completion. Every milestone delivers a usable experience across the full product surface — not a complete single feature. A user opening the app at any milestone should see the shape of the whole product, not just one working corner.

PRICING RULES
Platform pricing originates from USD only. Every paid feature stores its master price in USD. Local currency display is calculated fresh daily using the exchange rate in exchange_rates. Changing the USD master price automatically changes every country's displayed local amount. Local prices are never hardcoded.
Commodity prices originate from each country's local currency. Scraped or admin-entered prices are stored in the country's native currency. USD equivalent is calculated using the current exchange rate and stored alongside for reference. Invoices are generated from native prices first. USD is always informational.

SECURITY RULES
Paystack webhook signatures must be verified before any payment is processed. The raw request body is used for HMAC-SHA512 verification against the PAYSTACK_SECRET_KEY. Unverified webhooks are rejected with 401.
Profile IDs are public-facing identifiers, not security credentials. They identify businesses on the network. They are never used for authentication. Auth is always Supabase Auth (OTP or email).
Conduit IDs identify relationships, not businesses. CON-NG-000184 is the ID of one specific land owner–farm operator relationship on one parcel. It is not a tenant ID, not a landlord ID, and not a business credential.
Security officers are approved by both parties before logging a single record. The three-stage system (link → attach → other side approves) is not optional and cannot be bypassed. A guard who has only been approved by one party cannot create records.

DEPLOYMENT RULES
Railway hosts the Fastify backend, scraping bot, and satellite bot as separate deployable services. They share one Supabase database. Each service has its own Railway project with its own environment variables.
Environment variables are never hardcoded. API keys, Supabase URLs, Paystack keys, and Railway secrets are always injected via environment variables. No secret ever appears in committed code.
EAS (Expo Application Services) handles all mobile builds. No local machine builds are used for production. eas build --platform all --profile production is the only accepted path to the App Store and Play Store.

DEVELOPMENT ORDER RULES
Database schema is established before any application code. Every milestone begins from an existing, tested schema. Schema migrations run before any route or screen is written.
Every backend route that creates a relevant event calls the notification service before returning its response.Notifications are not an afterthought. They are part of the contract of every route.
The scraping bot reads country_config to determine which sources to run and at which UTC hour. It never has per-country hardcoding. New countries add a source module. The scheduler handles UTC grouping automatically — never one cron per country.

PERMANENT NON-NEGOTIABLES
These are never overridden by any section, any version, or any agent instruction:
Never silently edit a sealed harvest record
Never move money between partners
Never hardcode country-specific logic in application code
Never let the mobile app call external services directly
Never activate a feature without a Coming Soon state preceding it
Never ship a phase with untested features
Never store local currency prices as the master price — USD is always the source of truth for platform fees

OPERATIONAL ENGINEERING RULES
These rules apply from the first line of code in Section 1 and never change.
API versioning from day one. Every route is prefixed /v1/. No exceptions. When a breaking change is required, /v2/ is introduced alongside /v1/ — the old version is never removed until every client is confirmed migrated. A URL without a version prefix will never exist in production.
RBAC instead of role checks throughout the codebase. Permissions are enforced through a dedicated permission system, not scattered if role === 'owner' conditionals. A permissions table defines what each role can do. A middleware layer checks permissions before any route handler executes. Adding a new role or changing what a role can do is a data change, not a code change.
Expensive, retryable, or long-running work never runs synchronously inside HTTP requests. HTTP handlers enqueue background jobs and return once the request has been safely accepted. Simple synchronous operations (creating a profile, updating a setting, reading a record) may remain inline. Invoice generation, notification delivery, satellite processing, audit log writes, Trust Score recalculation, scraper retries, and legal export generation all run through the job queue.
Audit event log is separate from business tables. Every important action — record created, invoice approved, dispute raised, rule changed, payment confirmed, guard locked — is written to a dedicated audit_events table. This table is append-only. It is never updated, never soft-deleted. It exists independently of whether the related business record still exists. Any state in the system must be replayable from this log.
Soft deletes only. No hard deletes on user data. Records, Conduits, profiles, invoices, and disputes are never permanently deleted. Every table that can be "deleted" has a deleted_at timestamp column. Queries filter WHERE deleted_at IS NULL by default. Hard deletes are reserved for system-level cleanup of temporary data (expired link codes, draft Conduits abandoned before payment).
Standard error format on every API response. Every error response from every endpoint follows the same structure: { error: { code, message, field? } }. No freeform error strings. Error codes are documented in the OpenAPI spec. The mobile app handles errors by code, not by parsing message strings.
OpenAPI spec generated and maintained. Fastify generates an OpenAPI 3.0 spec automatically from route schemas. This spec is the contract between backend and mobile. The mobile app never guesses endpoint shapes — it references the spec. The spec is served at /v1/docs and updated automatically on every deployment.
Rate limiting on every public endpoint. Idempotency keys on every payment and webhook route. Payment initialization and webhook receipt endpoints require an idempotency key header. Duplicate requests with the same key return the cached result without re-processing. Rate limiting is enforced at the API gateway level — not per route in application code.
Structured logging and error monitoring from day one. Every log line is structured JSON: { level, timestamp, service, request_id, conduit_id?, user_id?, message, ...context }. Sentry captures every unhandled exception in both the backend and the mobile app. OpenTelemetry traces every request from mobile through backend to database. These are not optional production additions — they are wired in during Milestone 1.
Three environments: local, staging, production. No exceptions. No feature is tested directly in production. Every Railway service has three deployments. Supabase has three projects. Environment variables are injected per environment. The staging environment receives every deployment before production. Production deployments require a passing CI build on staging.
CI/CD pipeline gates every deployment. No code reaches Railway or the app stores without passing: lint, type check, unit tests, integration tests against staging Supabase, and a build verification. GitHub Actions (or equivalent) runs this pipeline on every pull request and every merge to main. A failing pipeline blocks deployment — no manual overrides.
Migration rollback strategy required for every schema change. Every migration file has a corresponding rollback. Schema changes that cannot be rolled back safely (dropping columns, changing types on populated tables) require a multi-step migration plan documented before execution.
Admin roles are defined separately from user roles. There is no single "admin" role. Three admin roles exist from Section 1: support_admin (can view any Conduit, cannot modify), finance_admin (can view payment records, process refunds, cannot view harvest records), super_admin (full access, restricted to named individuals). Admin access is logged in audit_events like any other action.
Analytics events from day one. Every meaningful user action fires an analytics event to a dedicated analytics_eventstable. Screen views, feature interactions, Coming Soon taps, payment completions, Conduit activations — all captured. This data powers product decisions later without requiring app updates or data reconstruction.
Pagination and filtering conventions are consistent across all list endpoints. Every list endpoint accepts limit, cursor, and filter parameters with the same shape. Responses always include a next_cursor field. No endpoint returns unbounded lists. The convention is defined once and enforced by middleware.
File upload pipeline enforces limits, optimization, and safety. Every file upload passes through: size check (max 10MB per file), type validation (images only for truck photos and evidence), image optimization (resize to 1200px max dimension, compress to < 500KB), and storage in a non-public Supabase bucket (served via signed URLs only). Virus scanning is enabled on the Supabase Storage bucket if supported, or delegated to a dedicated service.

PLATFORM SCALABILITY & RESILIENCE RULES
These rules exist because AgroLease operates in markets where connectivity is unreliable, user bases grow unpredictably, and AI agents will continue building this system over time. They are permanent.
Offline-first behavior on mobile. AgroLease users are farmers. Connectivity is unreliable. The mobile app must function without a persistent internet connection wherever possible.
Reads use cached data whenever live data is unavailable. The last known state is always shown with a visible "last updated" timestamp — never a blank screen.
Writes are queued locally when offline. Gate logging, photo capture, and form submissions are stored in a local queue and submitted automatically when connectivity returns.
Synchronization retries automatically on reconnection using exponential backoff.
Conflicts between locally queued writes and server state are resolved on the backend according to documented merge rules. The server is always the source of truth. Local queued data is never silently discarded — conflicts are logged in audit_events.
Multi-tenancy isolation on every request. Every request is scoped to the authenticated user's authorized Conduits. No endpoint may expose records, invoices, messages, satellite data, or any other resource outside that authorization boundary — regardless of whether the requesting user knows a valid ID. Authorization is checked on the record, not just on the route.
One queue technology throughout the entire platform. The background job queue is BullMQ backed by Redis. No other queue technology (RabbitMQ, SQS, Celery, Sidekiq, or any other) is introduced at any point in any section. Every async job — across the API, scraper, satellite bot, notification service, and legal export generator — uses BullMQ. One queue technology keeps operational complexity constant as the platform grows.
Every foreign key has an index. Unless PostgreSQL creates one automatically (primary keys), every foreign key column receives an explicit index at migration time. Any table expected to exceed 100,000 rows in production must have indexes covering its primary query paths before that table is deployed. This applies without exception to: audit_events, analytics_events, notifications, harvest_records, commodity_prices, satellite_reports, messages, listing_messages. Index requirements are documented in the migration file alongside the table definition.
Daily backups with tested restoration. Production Supabase has daily automated backups enabled. Point-in-time recovery is enabled where supported. Backup restoration is tested quarterly — not assumed to work. The test result is documented in the operational runbook. Recovery time objective: 4 hours. Recovery point objective: 24 hours.
Every secret must be rotatable without application downtime. No secret is hardcoded anywhere in the codebase. All secrets are injected via environment variables per environment. When a secret is rotated (API key, webhook signing key, database password), the rotation must be completable by updating an environment variable in Railway — not by deploying new code, not by restarting services during business hours, not by touching the database. Secret rotation procedures are documented in the operational runbook for every external service the platform depends on.
Metrics are required alongside logging. Logs explain what happened. Metrics reveal how well the system is performing. The following metrics are instrumented from the first production deployment and never removed:
API request latency (p50, p95, p99 per route)
Background job queue latency (time from enqueue to processing start, per queue)
Scraper run duration and success/failure rate per country
Satellite processing duration per Conduit
Push notification delivery success rate
Payment success rate per provider per country
Supabase Storage usage (total and per bucket)
Active Conduit count and growth rate
Metrics are collected via OpenTelemetry and shipped to a metrics backend (Railway Metrics, Grafana, or equivalent). Alerts are configured for: p99 API latency exceeding 2 seconds, job queue depth exceeding 500, scraper failure on 2 consecutive runs, payment webhook failure rate exceeding 5%.
Server-controlled app configuration. Every mobile app version must support runtime configuration from the server. The endpoint GET /v1/app-config is implemented from Section 1 and never removed. It returns:
minimum_supported_version — versions below this receive a forced upgrade screen
latest_version — used to prompt optional upgrade
maintenance_mode — boolean, triggers a full-screen maintenance notice in the app
maintenance_message — displayed during maintenance mode
support_email — support@agrolease.com or overridden per country
privacy_policy_url, terms_url — served from Railway, updatable without app release
feature_flags — full flag state for the user's country
platform_pricing_usd — { conduit: 250, satellite: 100, legal_readiness: 200 } — master prices, never hardcoded in the app
announcement_banner — optional text shown at the top of the dashboard
active_countries — list of active country codes
The mobile app calls this endpoint on every launch and caches the response. Every value in this response takes precedence over anything bundled in the app binary. Changing the Conduit price, activating a country, or triggering maintenance mode requires no app store update.
AI agents must extend existing architecture, not replace working production systems. No module, service, route, schema, or pattern that is live in production may be rewritten unless one of the following is true: the rewrite is explicitly instructed in the current build section, or a documented architectural defect (data loss risk, security vulnerability, or fundamental performance failure) requires replacement. Refactoring for preference, style, or familiarity with a different pattern is not a valid reason to rewrite stable production code. When in doubt, extend — never replace.

AgroLease Engineering Constitution — June 2026 — This document is permanent.


