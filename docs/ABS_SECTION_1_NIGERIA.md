AGROLEASE BUILD SPECIFICATION
SECTION 1 — Nigeria
Build and ship the complete Nigerian production application

Before reading this document, the agent must have read AGROLEASE_ENGINEERING_CONSTITUTION.md in full. The permanent rules defined there apply to every line of code written in this section. They are not repeated here.

MASTER AGENT ROLE
You are a senior full-stack engineer building AgroLease — an agricultural partnership management platform. You write production-quality code, not prototypes. Nigeria is the launch market. Every decision must already support 30+ countries through configuration — nothing is hardcoded to Nigeria.
This section finishes when:
The app is live on the App Store and Play Store
The Railway backend, scraping bot, and satellite bot are running in production
One real production Conduit has been created and activated in Nigeria
A real Land Owner can complete the full workflow from Conduit creation to harvest payment marking

STACK
Layer
Tool
Why
Mobile
React Native + Expo SDK 51+
One codebase, iOS + Android, EAS for builds
Backend
Node.js + Fastify
Fast, lightweight, agent-friendly
Database
Supabase (PostgreSQL)
Auth + DB + Storage + Realtime in one service
Auth
Supabase Auth
Phone OTP primary, email fallback
File Storage
Supabase Storage
Truck photos, NDVI maps, evidence files
Push Notifications
Expo Push + Supabase Edge Functions
Triggered by DB events
Realtime
Supabase Realtime
Both partners see records the moment they are created
Backend Hosting
Railway
Simple deploy, environment variables, cron support
Scraping Bot
Separate Node.js service on Railway
Runs on cron, writes to shared Supabase DB
Satellite Bot
Separate Node.js service on Railway
Weekly Sentinel-2 queries per Conduit
Satellite Imagery
Copernicus Sentinel-2 API (ESA)
Free government-backed data, 10m resolution
Maps
react-native-maps
Farm boundary drawing and Spatial Engine
Payments
Paystack
Nigeria-native: bank transfer, USSD, cards
Exchange Rates
Open Exchange Rates (free tier)
NGN ↔ USD conversion for display


ARCHITECTURE OVERVIEW
┌──────────────────────────────────────────────────────────┐
│                     MOBILE APP                           │
│              React Native + Expo                         │
│  State 1: Security Officer  |  State 2: Partner Login    │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼────────────────────────────────────┐
│                  BACKEND API                             │
│               Node.js + Fastify                          │
│              Deployed on Railway                         │
└──────┬──────────────┬──────────────────┬─────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐  ┌───────▼──────────────┐
│  SUPABASE   │ │ SCRAPING   │  │  SATELLITE BOT        │
│  PostgreSQL │ │    BOT     │  │  Weekly Sentinel-2    │
│  Auth       │◄│  Railway   │  │  queries per Conduit  │
│  Storage    │ │  Cron      │  │  Stores NDVI maps     │
│  Realtime   │ └────────────┘  └──────────────────────┘
└─────────────┘

The mobile app never calls Supabase or external services directly. Everything goes through the Fastify backend.

DATABASE SCHEMA
Establish the full schema before any application code. The schema is globally ready — Nigeria is one active row in country_config.
country_config
id, country_code, country_name, currency_code, currency_symbol,
price_feed_source, price_feed_method, update_frequency,
overwrite_fee_floor_local, timezone, utc_offset_hours,
scrape_utc_hour (int),
payment_provider (text),
payment_provider_public_key, active (boolean), created_at

Seed Nigeria row. All other countries inserted as inactive rows.
feature_flags
id, feature_key (text), country_code (FK country_config, nullable),
enabled (boolean, default false),
coming_soon (boolean, default true),
minimum_app_version (text, nullable),
created_at, updated_at

Every feature that is not yet live has a row here. The app reads feature state from the backend — never from hardcoded conditionals. Seed all Section 1 features on schema creation.
Initial seed rows:
feature_key
country_code
enabled
coming_soon
discovery
NG
false
true
legal_readiness
NG
false
true
hardware_weighbridge
NG
false
true
ai_geospatial
NG
false
true
ai_crop_stress
NG
false
true
satellite_timelapse
NG
false
true
farm_management_listings
NG
false
true
planet_labs
NG
false
true
satellite
NG
true
false
spatial_engine
NG
true
false
trust_score
NG
true
false

profiles
id (uuid, FK auth.users), profile_id (unique text),
display_name, phone, country_code (FK country_config),
kyc_verified (boolean), expo_push_token,
created_at, updated_at

conduits
id (uuid), conduit_id (text — CON-NG-000001),
land_owner_id (FK profiles), farm_operator_id (FK profiles, nullable),
status (draft | pending_payment | active | expired | cancelled),
land_name, land_size_hectares (decimal), land_location (text),
farm_boundary_coords (jsonb, nullable),
farm_boundary_type (pin | coords | polygon | gps, nullable),
country_code (FK country_config),
agreed_percentage (decimal),
payment_deadline_days (int),
late_fee_active (boolean), late_fee_percentage (decimal),
late_fee_grace_period_days (int),
overwrite_fee_local (decimal),
fixed_term_active (boolean, default false),
fixed_term_end_date (date, nullable),
invitation_expiry (timestamptz),
invitation_expiry_setting (24h | 7d | 30d | never),
satellite_active (boolean, default false),
satellite_activated_at (timestamptz),
amount_paid_by_owner (decimal, default 0),
amount_paid_by_operator (decimal, default 0),
paystack_payment_ref_owner (text),
paystack_payment_ref_operator (text),
activated_at (timestamptz), expires_at (timestamptz),
created_at, updated_at

conduit_sub_parcels
id (uuid), conduit_id (FK conduits),
parcel_name (text),
boundary_coords (jsonb),
locked_hectares (decimal),
anchor_point (jsonb),
drag_direction_degrees (decimal),
rotation_degrees (decimal, default 0),
created_at, updated_at

land_utilization_snapshots
id, conduit_id (FK conduits),
total_land_hectares (decimal),
utilized_hectares (decimal),
utilization_percentage (decimal),
active_parcel_count (int),
calculated_at (timestamptz)

security_officers
id (uuid), conduit_id (FK conduits),
full_name, phone, device_info,
linked_by (FK profiles),
status (pending_approval | active | locked | revoked),
approved_by_owner (boolean, default false),
approved_by_operator (boolean, default false),
link_code_used (text),
created_at, updated_at

link_codes
id, conduit_id (FK conduits), code (unique 6-char text),
expires_at (timestamptz, nullable),
expiry_setting (24h | 7d | 30d | never),
created_by (FK profiles), active (boolean), created_at

harvest_records
id (uuid), conduit_id (FK conduits),
conduit_display_id (text, denormalized),
land_label (text, denormalized),
record_type (entry | exit),
truck_photo_url (text, required),
plate_number (text),
gate_key_used (text),
crop_name (text),
weight_tonnes (decimal, nullable on entry),
evidence_rating (MEDIUM | HIGH),
logged_by_officer_id (FK security_officers),
logged_by_name (text, denormalized),
logged_by_phone (text, denormalized),
is_tampered (boolean, default false),
original_values (jsonb, nullable),
audit_flags (jsonb array, default []),
sealed_at (timestamptz),
created_at

invoices
id (uuid), conduit_id (FK conduits),
harvest_record_id (FK harvest_records),
conduit_display_id (text, denormalized),
land_label (text, denormalized),
crop_name, weight_tonnes,
market_price_local (decimal), market_price_usd (decimal),
currency_code, exchange_rate_at_creation (decimal),
agreed_percentage (decimal),
total_value_local (decimal), total_value_usd (decimal),
owner_share_local (decimal), operator_share_local (decimal),
status (draft | negotiating | approved | paid | disputed | frozen),
owner_approved (boolean, default false),
operator_approved (boolean, default false),
payment_marked_received (boolean, default false),
payment_marked_at (timestamptz),
created_at, updated_at

invoice_proposals
id, invoice_id (FK invoices), proposed_by (FK profiles),
proposed_by_role (owner | operator),
proposed_price_local (decimal), note (text, nullable),
created_at

disputes
id (uuid), conduit_id (FK conduits),
invoice_id (FK invoices),
harvest_record_id (FK harvest_records),
raised_by (FK profiles), raised_by_role (owner | operator),
reason (weight_discrepancy | crop_misclassification | unauthorised_entry | other),
description (text), evidence_urls (jsonb array),
status (open | resolved | unresolved),
resolved_by (FK profiles, nullable), resolved_at (timestamptz),
created_at, updated_at

messages
id (uuid), conduit_id (FK conduits),
sender_id (FK profiles), sender_role (owner | operator),
context_type (general | dispute | negotiation),
context_id (uuid, nullable),
body (text), read_by_recipient (boolean, default false),
created_at

agreement_change_log
id, conduit_id (FK conduits),
changed_field (text), old_value (text), new_value (text),
proposed_by (FK profiles), proposed_by_role (owner | operator),
status (proposed | counter_proposed | accepted | rejected),
accepted_at (timestamptz, nullable), created_at

fixed_term_overwrites
id, conduit_id (FK conduits),
initiated_by (FK profiles), initiated_by_role (owner | operator),
confirmed_by (FK profiles, nullable),
status (pending | confirmed | cancelled),
overwrite_fee_charged_local (decimal),
paystack_ref (text, nullable),
initiated_at (timestamptz), confirmed_at (timestamptz, nullable)

trust_scores
id, conduit_id (FK conduits, unique), score (decimal 0-100),
disputes_raised (int, default 0), late_payments (int, default 0),
rejected_invoices (int, default 0), audit_flags_count (int, default 0),
clean_approvals (int, default 0), fast_payments (int, default 0),
consecutive_dispute_free_months (int, default 0),
last_calculated_at (timestamptz), created_at, updated_at

satellite_reports
id (uuid), conduit_id (FK conduits),
report_date (date), ndvi_map_url (text),
rainfall_mm (decimal), cloud_cover_percentage (decimal),
image_available (boolean),
anomaly_detected (boolean, default false),
anomaly_type (text, nullable),
anomaly_description (text, nullable),
sentinel_scene_id (text),
created_at

commodity_prices
id, country_code (FK country_config), crop_name,
price_local (decimal), currency_code,
price_usd (decimal), exchange_rate (decimal),
source (text), data_date (date),
entered_by (admin | scraper), created_at

exchange_rates
id, base_currency (USD), target_currency,
rate (decimal), fetched_at (timestamptz)

notifications
id (uuid), recipient_id (FK profiles),
conduit_id (FK conduits, nullable),
type (text), title, body,
data (jsonb),
read (boolean, default false),
sent_at (timestamptz), created_at

permissions
id, role (text), resource (text), action (text), created_at

Defines what each role can do. Checked by middleware before every route handler. Never checked inline in route logic.
Seed rows:
role
resource
action
land_owner
conduit
create, read, update
farm_operator
conduit
read, update
security_officer
harvest_record
create
support_admin
conduit
read
support_admin
profile
read
finance_admin
invoice
read
finance_admin
payment
read, refund
super_admin
*
*

audit_events
id (uuid), event_type (text), actor_id (FK profiles, nullable),
actor_role (text), conduit_id (FK conduits, nullable),
resource_type (text), resource_id (uuid, nullable),
old_state (jsonb, nullable), new_state (jsonb, nullable),
ip_address (text, nullable), request_id (text),
created_at (timestamptz)

Append-only. Never updated. Never soft-deleted. Every important system action writes here regardless of whether the related business record still exists.
background_jobs
id (uuid), queue (text), job_type (text),
payload (jsonb), status (pending | processing | completed | failed),
attempts (int, default 0), max_attempts (int, default 3),
error (text, nullable), scheduled_at (timestamptz),
started_at (timestamptz, nullable),
completed_at (timestamptz, nullable),
created_at

BullMQ (Redis-backed) is the primary job runner. This table is a persistent audit record and fallback.
analytics_events
id (uuid), event_name (text), actor_id (FK profiles, nullable),
session_id (text, nullable), platform (ios | android | web),
conduit_id (FK conduits, nullable),
properties (jsonb), created_at (timestamptz)

Append-only. Every meaningful user action fires here from day one.
Initial events: screen_view, conduit_created, conduit_activated, payment_initiated, payment_completed, guard_linked, harvest_record_created, invoice_approved, dispute_raised, satellite_activated, coming_soon_tapped, remind_me_saved
Database indexes
Specify all indexes at migration time — never rely on the query planner to compensate for missing indexes at scale.
-- conduits
CREATE INDEX idx_conduits_land_owner ON conduits(land_owner_id);
CREATE INDEX idx_conduits_farm_operator ON conduits(farm_operator_id);
CREATE INDEX idx_conduits_status ON conduits(status);
CREATE INDEX idx_conduits_country ON conduits(country_code);
CREATE INDEX idx_conduits_expires_at ON conduits(expires_at);

-- harvest_records
CREATE INDEX idx_harvest_records_conduit ON harvest_records(conduit_id);
CREATE INDEX idx_harvest_records_officer ON harvest_records(logged_by_officer_id);
CREATE INDEX idx_harvest_records_sealed_at ON harvest_records(sealed_at);

-- invoices
CREATE INDEX idx_invoices_conduit ON invoices(conduit_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_harvest_record ON invoices(harvest_record_id);

-- disputes
CREATE INDEX idx_disputes_conduit ON disputes(conduit_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- messages
CREATE INDEX idx_messages_conduit ON messages(conduit_id);
CREATE INDEX idx_messages_context ON messages(context_type, context_id);

-- notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(recipient_id, read);

-- audit_events
CREATE INDEX idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_events_conduit ON audit_events(conduit_id);
CREATE INDEX idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

-- analytics_events
CREATE INDEX idx_analytics_events_actor ON analytics_events(actor_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- commodity_prices
CREATE INDEX idx_commodity_prices_country_crop_date ON commodity_prices(country_code, crop_name, data_date DESC);

-- satellite_reports
CREATE INDEX idx_satellite_reports_conduit_date ON satellite_reports(conduit_id, report_date DESC);


INFRASTRUCTURE & OPERATIONS
Establish all infrastructure before writing any feature code. These decisions are expensive to retrofit after launch.
API versioning
All routes are prefixed /v1/. Fastify registers a versioned plugin:
fastify.register(require('./routes'), { prefix: '/v1' })

No unversioned routes exist in production. /v1/docs serves the auto-generated OpenAPI spec.
RBAC middleware
A single requirePermission(resource, action) middleware is applied to every route. It reads the actor's role from their auth token, checks permissions, and rejects with 403 if the action is not permitted. No inline role checks exist anywhere in route handlers.
Background job queue
BullMQ backed by Redis (Railway Redis addon). Queues defined from Milestone 1:
Queue
Jobs
notifications
Send push notification, send email fallback
invoices
Generate invoice after exit record
trust_score
Recalculate score after triggering event
satellite
Process one Conduit's satellite data
scraper
Run one country's price scrape
audit
Write audit_events entry
analytics
Write analytics_events entry

HTTP routes enqueue jobs and return immediately. Workers process jobs in Railway background services. Failed jobs retry up to max_attempts with exponential backoff.
Standard error format
Every API error response:
{
  "error": {
    "code": "CONDUIT_NOT_FOUND",
    "message": "The requested Conduit does not exist or you do not have access.",
    "field": null
  }
}

Error codes are snake_case uppercase strings documented in the OpenAPI spec. The mobile app handles errors by code, never by parsing message.
OpenAPI spec
Fastify schema validation generates the OpenAPI 3.0 spec automatically. Every route defines its request schema, response schema, and error responses. Served at GET /v1/docs. Mobile development references this spec — endpoints are never guessed.
Rate limiting
Applied globally via @fastify/rate-limit:
Default: 100 requests per minute per IP
Auth endpoints: 10 requests per minute per IP
Payment endpoints: 20 requests per minute per user
Webhook endpoints: 200 requests per minute (Paystack IPs only)
Idempotency keys are required on POST /v1/payments/initialize and POST /v1/webhooks/paystack. Duplicate requests with the same key return the cached result.
Structured logging + monitoring
Every log line is structured JSON:
{
  "level": "info",
  "timestamp": "2026-06-27T10:00:00Z",
  "service": "api",
  "request_id": "req_abc123",
  "conduit_id": "CON-NG-000184",
  "user_id": "uuid",
  "message": "Invoice generated",
  "duration_ms": 45
}

Sentry captures every unhandled exception in the backend and the mobile app (via sentry-expo). OpenTelemetry traces every request from mobile through backend to database. Both are wired in during Milestone 1 — not added later.
Environment separation
Three environments from day one:
Environment
Purpose
local
Developer machines only — local Supabase instance
staging
All deployments land here first — separate Supabase project
production
Promoted from staging after CI passes

Each Railway service has three deployments. Environment variables are injected per environment via Railway environment groups. No secret ever appears in committed code.
CI/CD pipeline
GitHub Actions runs on every pull request and every merge to main:
Lint + type check
Unit tests
Integration tests against staging Supabase
Build verification (Expo build check, Fastify startup check)
Deploy to staging Railway
Run E2E smoke test against staging
Promote to production on manual approval
A failing pipeline blocks deployment. No manual overrides.
Migration rollback strategy
Every migration file in /backend/db/migrations/ has a corresponding rollback file. Schema changes that cannot be safely rolled back (dropping populated columns, changing column types) require a documented multi-step plan before execution:
Add new column (nullable)
Backfill data
Make column non-nullable
Drop old column in a separate migration
Backup + disaster recovery
Supabase daily automated backups enabled on production project
Point-in-time recovery enabled
Weekly backup restoration test documented in runbook
RTO target: 4 hours. RPO target: 24 hours.
File upload pipeline
Every file upload through POST /v1/uploads:
Size check — reject > 10MB
Type validation — images only for truck photos and evidence (JPEG, PNG, WebP)
Image optimization — resize to max 1200px, compress to < 500KB
Store in private Supabase Storage bucket (no public URLs)
Serve via signed URLs with 1-hour expiry

This section is built in five milestones. Each milestone delivers a usable experience across the full product surface. A user opening the app at any milestone sees the shape of the whole product — not one working corner.
Every milestone ends only when every test in that milestone passes. No untested work is carried forward.
Version map:
Version
What ships
v0.1
App skeleton — all screens exist, most with mock data or Coming Soon
v0.2
Conduit journey live — real payments, real activation
v0.3
Harvest journey live — real gate logging, real invoices
v0.4
Agreement journey live — real negotiations, disputes, Trust Score
v0.5–v1.0
Intelligence journey live — Spatial Engine, satellite, scraper, bots


MILESTONE 1 — APP SKELETON (v0.1)
Outcome: The app looks 80% complete. Every major screen exists. Most screens show mock data or Coming Soon states. The design system is established. All infrastructure is wired — monitoring, job queue, CI/CD, and environment separation are live before the first feature.
Project scaffolding
Initialise Expo project with TypeScript template and Expo Router
Folder structure:
/app                    — Expo Router screens
/components             — Reusable UI components
/components/coming-soon — Coming Soon placeholder components
/hooks                  — Custom React hooks
/lib                    — API client, helpers
/constants              — Colors, fonts, config
/backend                — Fastify API
/backend/routes/v1      — All routes under /v1 prefix
/backend/services       — Business logic
/backend/middleware     — Auth, RBAC, rate limiting, error handler
/backend/jobs           — BullMQ job definitions and workers
/backend/db             — Migration files (with rollbacks)
/backend/openapi        — Auto-generated spec served at /v1/docs
/scraper                — Scraping bot (separate deployable)
/satellite              — Satellite bot (separate deployable)

Install dependencies:
Mobile: expo-router, @supabase/supabase-js, expo-image-picker, expo-camera, expo-notifications, react-native-maps, expo-location, react-native-paystack, @sentry/react-native
Backend: fastify, @fastify/rate-limit, @fastify/swagger, bullmq, ioredis, @sentry/node, opentelemetry packages
Set up GitHub Actions CI/CD pipeline — lint, type check, unit tests, staging deploy, E2E smoke test, production promotion on manual approval
Set up three Railway environments: local config, staging, production
Run full schema migration on staging Supabase (including all new tables: permissions, audit_events, background_jobs, analytics_events, all indexes)
Seed Nigeria country_config row and all feature_flags rows on staging
Wire Sentry to both Fastify backend and Expo app — confirm exceptions surface in Sentry dashboard
Set up BullMQ workers for all queues (workers start empty — jobs will be enqueued in later milestones)
Deploy Fastify to Railway staging — health check at GET /v1/health returns { status: 'ok', version: '1.0.0', environment: 'staging' }
EAS project setup for iOS + Android builds
Navigation shell
All screens exist and are navigable. Screens not yet functional show their layout with mock data or a Coming Soon state. No dead ends.
Tab structure:
Dashboard (Home)
My Conduits
Notifications
Profile
Conduit detail screens (all created, some mocked):
Overview
Gate Records
Invoices
Agreements
Security Officers
Satellite (Coming Soon state until Milestone 5)
Spatial Map (shell only until Milestone 5)
Trust Score
Messages
Auth screens
Phone OTP entry screen
Email fallback screen
Profile setup screen (Profile ID assignment)
Three entry states wired up:
No session + no deep link → Auth screen
No session + agrolease://link/{code} → Security Officer onboarding
Active session → Dashboard
Dashboard — two states (mock data)
Unlinked user:
"Create New Conduit" — primary CTA
"My Conduits (0)" — subdued placeholder
"Discover Partners" — Coming Soon badge
Established user (mock Conduit cards):
Active Conduits list
Pending Invitations section
"Create New Conduit" — secondary button
"Discover Partners" — Coming Soon in secondary menu
Coming Soon component
Single reusable component used across all deferred features. Renders as a greyed-out card or button with an amber "Coming Soon" badge. Tapping opens a bottom sheet with:
Feature name
One-sentence description
"We're building this. You'll be notified when it's ready."
"Remind Me" button — saves notification preference to DB
Coming Soon states to render at Milestone 1:
Feature
Location
Discovery & Matchmaking
Dashboard secondary menu
Legal Readiness Export
Conduit detail screen
Hardware Weighbridge
Gate logging screen
AI Geospatial Matching
Spatial Engine screen
AI Crop Stress Analysis
Satellite screen
Historical Time-Lapse
Satellite screen
Farm Management Listings
Discovery section
Planet Labs Upgrade
Satellite screen

Design system
Establish all tokens before any feature screen is built:
Color palette (primary, surface, accent, error, warning, success)
Typography scale
Spacing system
Component primitives: Button, Card, Input, Badge, BottomSheet, Avatar, EmptyState
Coming Soon badge component (amber)
Loading skeleton component
Feature flag service
Backend route: GET /v1/feature-flags?country=NG Returns all flags for the given country. App calls this on launch and caches. UI reads from cache — never from hardcoded conditionals.
App configuration endpoint
Backend route: GET /v1/app-config Called on every app launch before any screen renders. Returns the full server-controlled configuration. The app caches this for the session — every value here takes precedence over anything bundled in the binary. Pricing, country activation, feature flags, maintenance mode, and legal URLs are all controlled here without an app store update.
{
  "minimum_supported_version": "1.0.0",
  "latest_version": "1.0.0",
  "maintenance_mode": false,
  "maintenance_message": null,
  "support_email": "support@agrolease.com",
  "privacy_policy_url": "https://agrolease.com/privacy",
  "terms_url": "https://agrolease.com/terms",
  "platform_pricing_usd": {
    "conduit": 250,
    "satellite": 100,
    "legal_readiness": 200
  },
  "announcement_banner": null,
  "active_countries": ["NG"],
  "feature_flags": {}
}

Milestone 1 tests
CI/CD pipeline runs and passes on a test pull request
Health endpoint live on Railway staging: GET /v1/health returns correct response
All DB tables created including permissions, audit_events, background_jobs, analytics_events
All indexes created
Nigeria seeded. Feature flags seeded. Permissions seeded.
Sentry receives a test exception from both backend and mobile app
BullMQ connects to Redis — workers start without error (queues empty is fine)
OpenAPI spec generated and accessible at /v1/docs
Rate limiting blocks requests exceeding threshold (test with 101 rapid requests)
App boots on simulator (iOS + Android)
All navigation tabs reachable
All Coming Soon states render and open correct bottom sheet
"Remind Me" fires an analytics event and saves preference to DB
Feature flags endpoint returns correct data for Nigeria
Staging and production environments are separate — seeding staging does not affect production

MILESTONE 2 — CONDUIT JOURNEY (v0.2)
Outcome: The first complete workflow. A Land Owner can create a Conduit, invite a Farm Operator, split the payment, and activate the relationship. Dashboard shows real data.
Auth + Profile ID (real)
Phone number OTP via Supabase Auth
Email fallback
On first sign-in: auto-generate Profile ID — user + 4 random digits, unique, retry on collision
Profile edit: alphanumeric + hyphens, 3–20 chars, uniqueness validated on blur
Security Officer onboarding: name + phone → security_officers record → gate logging screen
Conduit creation
Land Owner taps "Create New Conduit"
Land Label form: Land Name, Size (hectares), Location (state/region text)
Farm Boundary section — optional at creation, required for Satellite:
Option A: Drop a Pin
Option B: Enter GPS coordinates
Option C: Draw polygon on react-native-maps
Option D: Use current GPS location (expo-location)
Conduit ID generated: CON-NG- + DB sequence, 6 digits, zero-padded
Invitation expiry picker: 24h (default) / 7 days / 30 days / Never
Generated ID shown with copy + share button. Countdown timer on pending card.
Conduit invitation acceptance
Farm Operator enters Conduit ID or taps agrolease://conduit/{id}
Validate: exists, draft status, not expired
Link Farm Operator → conduit status: pending_payment
If expired: "Invitation expired. Ask your partner to regenerate." One-tap regeneration for Land Owner.
Paystack payment
Paystack supports bank transfer, USSD, and cards natively for Nigerian users.
Payment wall UI:
Total required: ₦[equivalent of $250 at today's rate]
Amount paid by Land Owner: ₦X
Amount paid by Farm Operator: ₦Y
Remaining: ₦Z
Exchange rate shown: "Converted at ₦[rate]/$1 on [date]"
Payment flow:
Either party taps "Pay My Share" → enters amount
Backend calls Paystack Initialize Transaction API (amount in kobo)
Paystack checkout via WebView
Paystack webhook fires to POST /webhooks/paystack
Backend verifies webhook signature (HMAC-SHA512 — see Constitution)
Updates amount_paid_by_owner or amount_paid_by_operator
When total ≥ $250 equivalent: status → active, activated_at set, expires_at = 12 months
Both partners notified: "Your Conduit CON-NG-000001 is now active."
Split payment link: After partial payment, system generates agrolease://conduit/{id}/pay?remaining={amount}. Other party opens it → directed to payment screen with remaining pre-filled.
Conduit renewal: 30 days before expires_at, both partners notified daily. Same payment flow for renewal.
Hourly cron on Railway: Mark expired draft Conduits, notify creator.
Backend routes — Milestone 2
GET    /v1/app-config                — server-controlled app configuration
GET    /v1/feature-flags             — feature flag state per country
POST   /auth/profile-setup
PUT    /auth/profile-id
GET    /feature-flags
POST   /conduits
GET    /conduits
GET    /conduits/:id
POST   /conduits/:id/regenerate-invitation
POST   /payments/initialize
POST   /webhooks/paystack
GET    /conduits/:id/payment-status
POST   /payments/split-link

Milestone 2 tests
OTP sign-in works. Profile ID auto-assigned.
Edit Profile ID — uniqueness validated.
Deep link agrolease://link/ABC123 on fresh install routes to officer flow.
Full invitation flow on two test accounts.
Expiry simulation — invitation marked expired by cron.
One-tap regeneration works — new ID issued, old recycled.
Pay partial from Land Owner via bank transfer (Paystack test mode). Webhook fires, balance updates.
Pay remaining from Farm Operator via USSD test mode. Conduit activates.
expires_at is 12 months out.
Dashboard shows real Conduit data after activation.

MILESTONE 3 — HARVEST JOURNEY (v0.3)
Outcome: The first end-to-end agricultural workflow. Security Officers log trucks. Harvest records appear in real-time on both dashboards. Invoices generate automatically.
Security Officer system
Link code generation:
Inside active Conduit → "Manage Gate Recorders"
"Generate Link Code" → 6-char alphanumeric code in link_codes
Expiry: 24h (default) / 7 days / 30 days / Never
Shared via copy/share as agrolease://link/ABC123
Officer linking (State 1 — no account):
Officer taps link or manually enters code
Code validated: exists, not expired, conduit active
Collect full name + phone — cannot skip
security_officers record created: status pending_approval
Device info stored
Three-stage approval:
Officer appears in both partners' lists as "Pending Approval"
Party that did NOT generate the code notified: "[Name] needs your approval to record at this gate."
Both must approve — approved_by_owner AND approved_by_operator → status active
Security list controls:
Lock: Either party, instant, no approval needed
Unlock: Requires both parties to confirm
Revoke: Requires both parties to confirm. Must re-link from scratch.
Gate logging (manual mode)
Gate screen (State 1 — no account):
Photo button (mandatory) → expo-camera → upload to Supabase Storage /conduit/{id}/records/{timestamp}.jpg
Gate Key field (validated against active operators on this Conduit)
Crop name field
Weight field (optional on entry, required on exit)
Submit disabled until photo is captured
Entry record on entry, exit record on exit
On seal: conduit_display_id and land_label denormalized onto record
Evidence rating:
Photo + manual weight → MEDIUM
Photo + hardware weighbridge → HIGH (Coming Soon button shown, greyed out)
Tamper-evident DB trigger (fires BEFORE UPDATE on harvest_records WHERE sealed_at IS NOT NULL):
Copy current values to original_values jsonb if not already set
Set is_tampered = true
Append {field, old_value, new_value, flagged_at} to audit_flags
Realtime: Both partner dashboards subscribe to harvest_records filtered by conduit_id. New records appear instantly.
Invoice auto-generation
On exit record creation, backend generates invoice draft automatically
Pull latest commodity_prices for Nigeria + crop name for today
Calculate: total_value_local, owner_share, operator_share
USD equivalent using today's exchange rate
land_label + conduit_display_id denormalized onto invoice
Negotiation:
Either party proposes price adjustment — new price per tonne + optional note
Saved to invoice_proposals, labelled by role
Invoice status → negotiating
Other party notified. Full proposal history visible to both.
Counter-propose or accept. Loop until accepted.
Approval + payment marking:
Both tap "Approve Invoice" → when both approved, status → approved
Land Owner taps "Mark Payment Received" when bank transfer arrives
Status → paid, payment_marked_at set
Currency display: All amounts in NGN with USD equivalent in smaller text. Toggle on invoice detail. Exchange rate shown with date.
Backend routes — Milestone 3
POST   /conduits/:id/link-codes
POST   /security/link
POST   /security/:id/approve
POST   /security/:id/lock
POST   /security/:id/unlock-request
POST   /security/:id/unlock-confirm
POST   /security/:id/revoke-request
POST   /security/:id/revoke-confirm
POST   /records
GET    /conduits/:id/records
GET    /records/:id
POST   /invoices
POST   /invoices/:id/propose
POST   /invoices/:id/approve
POST   /invoices/:id/mark-paid
GET    /conduits/:id/invoices
GET    /invoices/:id

Milestone 3 tests
Full three-device test: Land Owner, Farm Operator, Security Officer
Code expiry simulation works
Lock/unlock/revoke flow with both-party confirmation
Log entry without weight. Log exit with weight. MEDIUM rating confirmed.
Real-time update appears on partner device without refresh
Modify sealed record directly in Supabase — tamper flag fires
Attempt submit without photo — blocked at UI and API level
Exit record triggers invoice automatically
Proposal → counter-proposal → accept flow works
Both approve. Mark paid. Status transitions confirmed.

MILESTONE 4 — AGREEMENT JOURNEY (v0.4)
Outcome: Business relationship management is complete. Agreements, fixed-term contracts, disputes, notifications, and Trust Score are all live.
Agreement setup
Land Owner sets after Conduit activates: harvest percentage, payment deadline (days), late fee toggle + percentage + grace period, overwrite fee (minimum ₦100,000 from country_config.overwrite_fee_floor_local)
Farm Operator reviews and accepts
Agreement goes live only after Farm Operator accepts
Rule change flow:
Either party proposes → agreement_change_log entry with status proposed
Other party notified
Accept (logged as accepted, rule updates) or counter-propose (logged as counter_proposed)
Old rule stays active throughout — never updated until acceptance confirmed
Fixed-Term Lock + Overwrite
Either party proposes fixed-term: lock all rules until [date]
Both accept → fixed_term_active: true, fixed_term_end_date set
During fixed term: rule change proposal UI is disabled — replaced with "Rules are locked until [date]"
"Overwrite Contract" button visible — requires both partners to confirm
On both confirming: Paystack charge of overwrite_fee_local to initiating party
On payment confirmed: fixed_term_active: false, fixed_term_overwrites record created
DM always open regardless of lock status
Overwrite payment: Same Paystack pattern as Conduit activation. Amount = conduit.overwrite_fee_local in kobo.
Dispute workflow
"Raise Dispute" on any active invoice
Reason picker + description (required) + optional evidence photos
Invoice → frozen, dispute → open
Both notified: "Invoice frozen — dispute in progress."
Dispute screen shows: original record, evidence rating, guard identity, full proposal history, attached evidence
Messaging in dispute context via messages table
Resolution:
Both tap "Agree and Close" → resolved, invoice unfreezes
Either taps "Escalate to Unresolved" → unresolved, invoice stays frozen
General DM: Always open regardless of dispute or lock status. Separate from dispute context messages.
Trust Score
Supabase function triggered by events on relevant tables:
Event
Delta
Dispute raised
-5
Invoice not approved within 14 days
-3
Audit flag on record
-8
Payment overdue
-5
Payment marked received on time
+3
Clean invoice approval (no negotiation)
+2
Officer approval (both sides)
+1
30 consecutive dispute-free days
+5

Starting score: 50. Floor: 0. Ceiling: 100.
Both partners see identical score on Conduit detail.
Subtext shown: "Score reflects verified activity recorded inside this Conduit only."
Push notifications (all events)
Request push permission on first launch — store Expo Push Token on profile. Every backend route that triggers a relevant event calls the notification service before returning its response.
Full notification event list (fires for all events from Product Plan Section 12):
Event
Recipient
Harvest record created
Both — immediately
Invoice generated
Both — immediately
Invoice approved by one side
Other party
Payment marked as received
Both
Rule change proposed
Other party
Guard attached
Other party — approve/reject
Guard approved
Both
Guard locked
Both
Guard unlock requested
Other party
Guard revoke requested
Other party
Dispute raised
Both — invoice frozen
Dispute resolved
Both
Payment overdue — 7 days out
Both — daily
Payment deadline passed
Both — immediately, then daily
Contract expiring — 30 days out
Both
Conduit invitation expiring
Creator
Conduit invitation expired
Creator — regeneration prompt
Conduit payment link sent
Receiving party
Conduit fully paid + unlocked
Both
Overwrite initiated
Both
Satellite report ready
Land Owner (activated at Milestone 5)
Satellite anomaly detected
Land Owner (activated at Milestone 5)
Legal Readiness renewed
Both (activated when Legal Readiness ships)

Backend routes — Milestone 4
POST   /conduits/:id/agreement
POST   /conduits/:id/agreement/accept
POST   /conduits/:id/agreement/propose-change
POST   /conduits/:id/agreement/respond-change
POST   /conduits/:id/fixed-term
POST   /conduits/:id/fixed-term/accept
POST   /conduits/:id/overwrite/initiate
POST   /conduits/:id/overwrite/confirm
POST   /webhooks/paystack/overwrite
POST   /disputes
POST   /disputes/:id/resolve
POST   /disputes/:id/escalate
GET    /conduits/:id/disputes
GET    /disputes/:id
POST   /messages
GET    /conduits/:id/messages

Milestone 4 tests
Set agreement, operator accepts. Active immediately.
Propose percentage change — old rule stays active during negotiation. Accept — new rule applies.
Set fixed term. Attempt rule change — blocked.
Initiate overwrite, both confirm, pay fee, lock breaks. Log entry confirmed.
Raise dispute, invoice freezes. Message exchange. Resolve — invoice unfreezes.
Raise second dispute, escalate. General DM works independently.
Complete full harvest cycle — confirm every notification fires to correct recipient.
Deep links open correct screen.
Trust Score changes confirmed after triggering events. Both partners see identical value.

MILESTONE 5 — INTELLIGENCE JOURNEY (v0.5 → v1.0)
Outcome: AgroLease's unique value proposition comes online. Spatial Engine, satellite, scraping bot, and admin panel are all live. Ready for App Store submission.
Spatial Engine — Phase 1 (v0.5)
First version: draw boundary, save polygon, show hectares, show utilization. Locked parcels, rotation, and encroachment detection added in Phase 2.
Farm Boundary (already collected in Milestone 2, now powered):
If polygon exists from Conduit creation: Spatial Engine has a canvas
If not set: prompt Land Owner to set Farm Boundary before proceeding
Parcel assignment — Phase 1:
Land Owner opens Conduit → "Define Farm Parcel"
"Entire Property" or "Part of Property"
If Part of Property:
Enter locked hectares (locked once entered)
Tap anchor point on map
Drag to indicate direction
Backend previews polygon of exactly {N} hectares
Both partners confirm
Saved to conduit_sub_parcels
Property Utilization % displayed on dashboard
Geometry backend service (Turf.js):
turf.circle, turf.transformRotate, turf.intersect, turf.area
All coordinates stored as GeoJSON in jsonb fields
Phase 2 (v0.6 — same sprint window):
Move and Rotate spatial adjustment (resize blocked permanently)
Encroachment detection: turf.intersect against all existing active parcels on new parcel creation
Historical Lease Map: timeline of past and active sub_parcels, colour-coded
Crop Rotation Record: list of crop names per parcel per season
Coming Soon on Spatial screen:
"AI Boundary Suggestion" — Coming Soon badge
"GPS Metadata from Photos" — Coming Soon badge
Scraping bot
Separate Node.js service on Railway. Runs every day at 02:00 UTC (3AM WAT).
On failure: retry at 05:00 UTC, then 08:00 UTC. Log each attempt with result.
Nigeria sources:
FMARD — primary
Crops: Maize, Cassava, Rice, Sorghum, Yam, Groundnut, Soybean, Millet
Parse with Cheerio
Bot logic per run:
Fetch FMARD page HTML
Parse price table
Compare against last commodity_prices entry for same crop + country + today
If identical: skip, log "no change"
If new: insert with entered_by: scraper
Fetch NGN/USD rate from Open Exchange Rates → upsert to exchange_rates
Calculate price_usd for all new entries
WFP VAM connector (written now, not activated):
Write connector for https://api.vam.wfp.org/
Test against Kenya data
Mark as inactive in country_config
Activated in Section 2
/scraper
  /sources
    fmard.js
    wfp-vam.js      (written, inactive)
    open-exchange.js
  scheduler.js
  index.js

Admin price panel
Simple React web app on Railway. Fallback when scraper fails.
Admin login (Supabase Auth, admin role)
Price entry: country + crop + price in NGN + data date
System auto-calculates USD equivalent on save
Price history table per crop
Exchange rate display (from exchange_rates, not manually entered)
Active Conduit monitor: all active Conduits, payment status, expiry dates
Scraper status: last run, last success, any failures
Admin-entered prices: entered_by: admin. Invoice generation always uses most recent price for correct date regardless of source.
Satellite bot
Separate Railway service. Runs every Saturday night at 23:00 UTC.
Activation flow:
Active Conduit with Farm Boundary set → "Activate Satellite View"
Satellite add-on costs ₦[equivalent of $100/year] — same Paystack flow
On payment confirmed: satellite_active: true
"Satellite monitoring is now active. Your first report will arrive this Sunday."
Bot logic per Conduit where satellite_active: true:
Query Copernicus Sentinel-2 API for latest scene covering Farm Boundary — cloud cover < 30%, last 8 days
If scene found:
Download NDVI band composite (Band 8 NIR, Band 4 Red)
Calculate NDVI: (NIR - Red) / (NIR + Red)
Generate colour-coded PNG (red=low, yellow=medium, green=high)
Upload to Supabase Storage: /satellite/{conduit_id}/{date}.png
If no scene: image_available: false, hold previous reading, notify both partners
Fetch rainfall from Open-Meteo API (free, no key required): https://archive-api.open-meteo.com/v1/archive
Save satellite_reports record
Anomaly detection:
Compare current NDVI against 4-week rolling average
NDVI drops > configurable threshold (default 20%): anomaly_type: crop_decline
Water coverage detected (NDVI < 0): anomaly_type: flooding
No vegetation change for 30+ days: anomaly_type: field_abandonment
If anomaly: immediate push notification to Land Owner
Sunday morning delivery (8AM WAT = 7AM UTC): Push notification to Land Owner: "Your weekly crop health report for [Land Name] is ready."
Satellite dashboard (in-app):
Latest NDVI map full-width
Colour scale legend
Rainfall chart: last 4 weeks daily as bar chart
Last updated timestamp
"Cloud Cover Warning" banner when image_available: false
Anomaly alert card if active
Permanent disclaimer on satellite screen: "Satellite imagery is supplementary evidence and may be affected by cloud cover, revisit frequency, or image resolution. When cloud obstruction prevents a clear image, the previous confirmed reading is shown. Satellite data is not guaranteed legal proof — it is one layer of objective evidence within your Conduit's audit trail."
Coming Soon on satellite screen:
AI Crop Stress Analysis
Historical Time-Lapse
Planet Labs High-Resolution Upgrade
Backend routes — Milestone 5
POST   /conduits/:id/parcels
POST   /conduits/:id/parcels/preview
GET    /conduits/:id/parcels
GET    /conduits/:id/utilization
PUT    /conduits/:id/parcels/:parcelId
POST   /conduits/:id/parcels/encroachment-check
POST   /satellite/process-conduit
GET    /conduits/:id/satellite/reports
GET    /conduits/:id/satellite/latest
GET    /admin/conduits
POST   /admin/prices
GET    /admin/prices/:country/:crop
GET    /admin/scraper-status

Milestone 5 tests
Draw full property boundary. Assign 50ha parcel — preview generates.
Move and rotate — resize blocked.
Assign second parcel overlapping first — encroachment blocked.
Utilization % updates correctly.
Run scraper manually. Prices populate for all 8 crops. Exchange rate updated.
Simulate FMARD unavailable — retry logic confirmed.
Confirm invoice generation uses scraped prices.
Enter admin price — invoice picks it up. Scraper entry overrides with newer timestamp.
Activate satellite on test Conduit with Farm Boundary. Run bot manually.
satellite_reports record created. NDVI image in Supabase Storage.
Sunday notification fires.
Simulate NDVI drop > 20% — anomaly notification fires immediately, not on Sunday.

END-TO-END TEST (v1.0 candidate)
Run complete scenario on three test accounts in production environment (not simulator).
Account A (Land Owner): Create Conduit, draw farm boundary polygon, set land label
Account B (Farm Operator): Accept invitation within 24h window
Both: Split payment via bank transfer (Paystack test mode)
Account A: Generate security link code
Account C (Security Officer, no account): Link via code, enter name and phone
Account B: Approve officer
Account A: Approve officer — officer now active
Account A: Activate satellite layer (Paystack test mode)
Run satellite bot manually — confirm NDVI report generated
Account C: Log truck entry with photo + Gate Key
Account C: Log truck exit with weight
Both A and B: Confirm record appears in real-time
Invoice auto-generated — confirm land label + Conduit ID on invoice
Account B: Propose price adjustment
Account A: Accept adjustment
Both: Approve invoice
Account A: Mark payment received
Account A: Assign 50ha sub-parcel to Account B on Spatial Engine
Account A: Set fixed-term agreement (1 year)
Account B: Attempt to change harvest percentage — confirm blocked
Account A: Initiate overwrite — Account B confirms — fee charged
Lock broken — rule change now possible
Account B: Raise dispute on invoice 2
Both: Exchange messages, resolve dispute
Check Trust Score has changed throughout
Verify all Coming Soon states render on both devices
Document every step result. Fix every failure. Do not proceed to App Store submission until all 26 steps pass.

APP STORE + PLAY STORE SUBMISSION (v1.0)
Prepare
eas build --platform all --profile production
App icons: 1024×1024 PNG (App Store) + adaptive icon (Play Store)
Splash screen: AgroLease logo centred on dark green (#1C3A1F) background
Privacy policy: hosted on Railway
Support email: support@agrolease.com
App Store (iOS)
Bundle ID: com.agrolease.app
Version: 1.0.0 Build 1
Category: Business
Age rating: 4+
Screenshots: 6.5" and 5.5" simulators — Conduit dashboard, gate logging, NDVI map, Spatial Engine, invoice screen
Submit via EAS Submit
Play Store (Android)
Package: com.agrolease.app
Version: 1.0.0, Version code: 1
Category: Business > Agriculture
Screenshots: phone + 7-inch tablet
Release to Internal Testing track first → Production after manual review
Submit via EAS Submit

SECTION 1 COMPLETION STATE
When Section 1 finishes, the following exists permanently. Section 2 reads this before writing a single line of code and never rebuilds any of it.
Mobile
Production React Native application — Expo Router — TypeScript
Authentication (Phone OTP + email fallback)
Push notifications (Expo Push Tokens stored per profile)
Deep linking (agrolease:// scheme fully wired)
Sentry error monitoring active
App Store configuration complete
Play Store configuration complete
Backend
Production Fastify API on Railway — all routes under /v1/
RBAC middleware on every route — no inline role checks in handlers
Authentication middleware
Rate limiting on all endpoints — idempotency keys on payment and webhook routes
Standard error format on all responses
OpenAPI 3.0 spec auto-generated and served at /v1/docs
BullMQ job queues: notifications, invoices, trust_score, satellite, scraper, audit, analytics
Paystack payment integration (Conduit activation + overwrite fees)
Notification service (every event enqueues a job before route returns)
Audit engine (tamper-evident DB trigger on sealed records + audit_events for all actions)
Agreement engine (rule change log, fixed-term lock, overwrite)
Invoice engine (auto-generation, negotiation, approval, payment marking)
Trust Score engine (event-driven, via job queue)
Spatial Engine (Turf.js, sub-parcel assignment, encroachment detection, utilization)
Satellite endpoint (receives bot reports, serves signed image URLs)
Feature flags endpoint
Admin panel (prices, scraper status, Conduit monitor — three admin role levels)
Structured logging (JSON) + Sentry + OpenTelemetry
Infrastructure
Three environments: local, staging, production — fully separated Supabase projects and Railway deployments
CI/CD pipeline: GitHub Actions — lint, type check, unit tests, integration tests, staging deploy, E2E smoke, manual production promotion
Production Supabase — PostgreSQL + Auth + Storage + Realtime — daily backups + point-in-time recovery
Redis (Railway addon) — BullMQ job queues
All database indexes specified and created at migration time
Migration rollback files for every migration
File upload pipeline: size check, type validation, image optimization, private storage, signed URLs
Environment variables injected per environment — no secrets in code
Bots
Commodity Scraper Bot — live, running nightly, populating commodity_prices via job queue
Satellite Processing Bot — live, running Saturday nights, storing NDVI + rainfall
Exchange Rate Service — live, updating exchange_rates daily
WFP VAM connector — written, tested, inactive (activated in Section 2)
Database
Full schema live and tested including: permissions, audit_events, background_jobs, analytics_events
All indexes created
Nigeria country_config row: active
All other countries: rows exist, active: false
Feature flags: all Section 1 features correctly seeded
Permissions: all roles seeded — land_owner, farm_operator, security_officer, support_admin, finance_admin, super_admin
Countries
Nigeria: fully activated
All other countries: exist in country_config, inactive, zero application logic references them by name
Architecture rules in effect
No country-specific logic in application code
No hardcoded local currency for platform fees — USD master price, local conversion calculated daily
No mobile app calls to external services — everything through Fastify
Feature state always read from feature_flags — never from hardcoded conditionals
Every sealed record tamper-evident — trigger live and tested
Conduit ID and Land Label denormalized onto every record, invoice, dispute, and export at write time
All async work (notifications, invoice gen, scoring, satellite, scraping) processed through job queues — never inside HTTP requests
Every important system action written to audit_events — append-only, permanent
Soft deletes on all user data — deleted_at column, no hard deletes
Analytics events firing for all defined user actions

AgroLease Build Specification — Section 1 — June 2026 Read AGROLEASE_ENGINEERING_CONSTITUTION.md before this document. The Constitution is permanent. This section is not.


