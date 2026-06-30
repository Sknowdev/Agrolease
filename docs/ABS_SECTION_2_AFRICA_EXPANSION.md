AGROLEASE BUILD SPECIFICATION
SECTION 2 — Africa Expansion + Delaware Parent Company

Before reading this document, the agent must have read AGROLEASE_ENGINEERING_CONSTITUTION.md in full. All permanent rules defined there apply to every line of code written in this section.
Section 1 is assumed complete, tested, and running in production. Nothing from Section 1 is rebuilt, duplicated, or refactored unless explicitly stated here. This section extends the existing production system.

WHAT ALREADY EXISTS
The following is live in production from Section 1. Do not touch it.
Mobile: Production React Native app on App Store and Play Store. Auth, Conduits, gate logging, invoices, disputes, agreements, Trust Score, Spatial Engine, Satellite layer, push notifications, deep linking, Coming Soon states, Sentry monitoring.
Backend: Production Fastify API on Railway. All routes under /v1/. RBAC middleware, rate limiting, idempotency keys, OpenAPI spec at /v1/docs, BullMQ job queues (notifications, invoices, trust_score, satellite, scraper, audit, analytics), structured logging, Sentry, OpenTelemetry.
Infrastructure: Three environments (local, staging, production). CI/CD pipeline (GitHub Actions → Railway). Production Supabase with daily backups. Redis for BullMQ. File upload pipeline.
Bots: Commodity Scraper (nightly, Nigeria FMARD), Satellite Bot (Saturday nights, Sentinel-2), Exchange Rate Service (daily). WFP VAM connector already written and tested — currently inactive.
Database: Full Section 1 schema live. Nigeria is the only active row in country_config. All other countries have inactive rows already inserted. feature_flags, permissions, audit_events, background_jobs, analytics_events all live.
Architecture rules in effect: All Constitution rules apply. No country-specific logic in code. USD master pricing. All async work through job queues. Soft deletes everywhere. Append-only audit log.

WHAT SECTION 2 BUILDS
Section 2 extends the existing platform in four directions:
Activate 16 African countries — country config, payment providers, commodity sources, scraper scheduler grouping
Discovery & Matchmaking Network — Land Listings, Farm Operator Listings, Farm Management Listings, five-stage funnel from listing to Conduit
Legal Readiness — annually maintained record package, structured export for court and auditors
Delaware parent company — AgroLease Inc. incorporation, US banking, Stripe Atlas, tax structure, operational compliance
One codebase. One backend. One schema. No country-specific application code.

NEW SCHEMA ADDITIONS
Add these tables and columns to the existing schema. No existing table is dropped or restructured.
payment_transactions
id (uuid), conduit_id (FK conduits, nullable),
transaction_type (conduit_activation | satellite_activation |
  legal_readiness | overwrite_fee | conduit_renewal),
payer_id (FK profiles),
amount_local (decimal), currency_code,
amount_usd (decimal), exchange_rate (decimal),
provider (paystack | flutterwave | mpesa | chapa | paymob | fawry),
provider_ref (text),
status (pending | completed | failed | refunded),
idempotency_key (text, unique),
metadata (jsonb),
created_at, updated_at

Provider-agnostic payment record. Replaces all scattered paystack_ref fields on conduits. From Section 2 forward, all payment tracking happens here — one source of truth regardless of which provider processed the transaction.
Migration note: Backfill existing conduits.paystack_payment_ref_owner and paystack_payment_ref_operator into payment_transactions rows before marking those columns as deprecated. Do not drop the original columns until Section 3.
listings
id (uuid), listing_id (text — e.g. LST-NG-000001),
profile_id (FK profiles),
listing_type (land | farm_operator | farm_management),
country_code (FK country_config),
title (text), description (text),
land_size_hectares (decimal, nullable),
location_text (text),
location_coords (jsonb, nullable — point or polygon),
soil_type (text, nullable),
available_crops (jsonb array, nullable),
asking_terms (text, nullable),
status (draft | active | paused | expired | converted),
converted_to_conduit_id (FK conduits, nullable),
mapped_location_badge (boolean, default false),
identity_verified_badge (boolean, default false),
view_count (int, default 0),
deleted_at (timestamptz, nullable),
created_at, updated_at

listing_contacts
id (uuid), listing_id (FK listings),
initiator_id (FK profiles), listing_owner_id (FK profiles),
status (active | agreed | abandoned | converted),
converted_to_conduit_id (FK conduits, nullable),
created_at, updated_at

One row per contact request between two parties on a listing. The negotiation DM thread belongs to this contact, not the listing itself.
listing_messages
id (uuid), listing_contact_id (FK listing_contacts),
sender_id (FK profiles),
body (text),
read_by_recipient (boolean, default false),
created_at

legal_readiness_subscriptions
id (uuid), conduit_id (FK conduits, unique),
active (boolean, default false),
activated_at (timestamptz, nullable),
expires_at (timestamptz, nullable),
amount_paid_usd (decimal),
payment_transaction_id (FK payment_transactions, nullable),
created_at, updated_at

legal_readiness_exports
id (uuid), conduit_id (FK conduits),
requested_by (FK profiles),
date_range_start (date), date_range_end (date),
components_included (jsonb array),
export_url (text, signed URL — expires after 72 hours),
file_size_bytes (int, nullable),
generated_at (timestamptz, nullable),
status (queued | processing | completed | failed),
error (text, nullable),
created_at

localization_strings
id, locale (text — e.g. en, fr, sw, ar, am, pt),
key (text), value (text),
created_at, updated_at

Platform UI strings stored in DB for over-the-air updates without app store releases. App fetches strings on launch and caches per locale.
New indexes
CREATE INDEX idx_listings_profile ON listings(profile_id);
CREATE INDEX idx_listings_country_type ON listings(country_code, listing_type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listing_contacts_initiator ON listing_contacts(initiator_id);
CREATE INDEX idx_listing_contacts_owner ON listing_contacts(listing_owner_id);
CREATE INDEX idx_listing_messages_contact ON listing_messages(listing_contact_id);
CREATE INDEX idx_legal_readiness_conduit ON legal_readiness_subscriptions(conduit_id);
CREATE INDEX idx_legal_exports_conduit ON legal_readiness_exports(conduit_id);
CREATE INDEX idx_payment_transactions_conduit ON payment_transactions(conduit_id);
CREATE INDEX idx_payment_transactions_payer ON payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_idempotency ON payment_transactions(idempotency_key);

feature_flags additions
-- New rows to seed
INSERT INTO feature_flags (feature_key, country_code, enabled, coming_soon) VALUES
('discovery', NULL, true, false),           -- enabled globally
('legal_readiness', NULL, true, false),     -- enabled globally
('farm_management_listings', NULL, true, false),
('ai_geospatial', NULL, false, true),       -- still coming soon
('ai_crop_stress', NULL, false, true),
('satellite_timelapse', NULL, false, true),
('planet_labs', NULL, false, true);


COUNTRY ACTIVATION
The 16 countries to activate
Section 1 inserted all countries as inactive rows in country_config. Section 2 activates the following by setting active: true and populating all config fields.
Country
Code
Currency
Symbol
UTC Offset
Scrape UTC
Payment Provider
Commodity Source
Ghana
GH
GHS
₵
+0
03:00
Paystack
GCX Website + WFP VAM
Kenya
KE
KES
KSh
+3
00:00
Flutterwave + M-Pesa
KilimoSTAT API + WFP VAM
South Africa
ZA
ZAR
R
+2
01:00
Flutterwave
DAFF / data.gov.za
Ethiopia
ET
ETB
Br
+3
00:00
Chapa
WFP VAM
Tanzania
TZ
TZS
TSh
+3
00:00
Flutterwave + M-Pesa TZ
WFP VAM
Uganda
UG
UGX
USh
+3
00:00
Flutterwave + MTN MoMo
WFP VAM
Rwanda
RW
RWF
Fr
+2
01:00
Flutterwave + MTN MoMo
WFP VAM
Zambia
ZM
ZMW
ZK
+2
01:00
Flutterwave
WFP VAM
Cameroon
CM
XAF
Fr
+1
02:00
Flutterwave + Orange Money
WFP VAM
Ivory Coast
CI
XOF
Fr
+0
03:00
Flutterwave + Orange Money
WFP VAM
Senegal
SN
XOF
Fr
+0
03:00
Flutterwave + Orange Money
WFP VAM
Mozambique
MZ
MZN
MT
+2
01:00
Flutterwave + M-Pesa MZ
WFP VAM
Zimbabwe
ZW
USD
$
+2
01:00
Paynow + Flutterwave
WFP VAM
Egypt
EG
EGP
£
+2
01:00
Paymob
WFP VAM
Mali
ML
XOF
Fr
+0
03:00
Flutterwave + Orange Money
WFP VAM
Burkina Faso
BF
XOF
Fr
+0
03:00
Flutterwave + Orange Money
WFP VAM

Notes:
Zimbabwe uses USD as its functional currency. currency_code: USD, display identical to platform pricing. No conversion needed.
XOF (West African CFA franc) is shared across Ivory Coast, Senegal, Mali, Burkina Faso. One exchange rate entry covers all four.
XAF (Central African CFA franc) is used by Cameroon. Separate from XOF despite similar name.
Kenya, Tanzania, Uganda, and Mozambique all use M-Pesa but through different Safaricom/Vodacom regional APIs — separate payment provider modules per country.
Overwrite fee floors per country
Set overwrite_fee_floor_local on each country_config row. The application reads this automatically — no code change required.
Country
Floor
Equivalent
Ghana
GHS 1,500
~$100
Kenya
KES 15,000
~$100
South Africa
ZAR 2,000
~$100
Ethiopia
ETB 6,000
~$100
Tanzania
TZS 260,000
~$100
Uganda
UGX 380,000
~$100
Rwanda
RWF 140,000
~$100
Zambia
ZMW 2,800
~$100
Cameroon
XAF 65,000
~$100
Ivory Coast
XOF 65,000
~$100
Senegal
XOF 65,000
~$100
Mozambique
MZN 6,500
~$100
Zimbabwe
USD 100
$100
Egypt
EGP 5,000
~$100
Mali
XOF 65,000
~$100
Burkina Faso
XOF 65,000
~$100


PAYMENT PROVIDER LAYER
Section 1 has one provider: Paystack. Section 2 adds Flutterwave, M-Pesa (regional variants), Chapa, Paymob, and Paynow. The payment layer must be provider-agnostic — the application calls one internal payment service, which dispatches to the correct provider based on country_config.payment_provider.
Payment service interface
The internal payment service exposes one consistent interface regardless of provider:
// /backend/services/payment/index.js
// All providers implement this interface

async initializeTransaction({ conduitId, payerId, amountUsd, countryCode, idempotencyKey, transactionType })
// Returns: { providerRef, checkoutUrl, expiresAt }

async verifyWebhook({ provider, headers, rawBody })
// Returns: { verified: boolean, ref: string, status: string }

async getTransactionStatus({ provider, providerRef })
// Returns: { status: 'pending' | 'completed' | 'failed', amountLocal, currency }

Provider modules: /backend/services/payment/providers/paystack.js, flutterwave.js, mpesa-ke.js, mpesa-tz.js, mpesa-mz.js, chapa.js, paymob.js, paynow.js
Webhook routing
Each provider sends webhooks to a distinct endpoint:
POST /v1/webhooks/paystack
POST /v1/webhooks/flutterwave
POST /v1/webhooks/mpesa
POST /v1/webhooks/chapa
POST /v1/webhooks/paymob
POST /v1/webhooks/paynow
All webhooks verify signature before any processing. All confirmed transactions enqueue a payment_confirmed job which writes to payment_transactions and triggers the relevant Conduit status update. The HTTP handler returns 200immediately — processing is async.
Provider coverage by country
The country_config table stores payment_provider as a comma-separated list where multiple providers are available. The mobile app payment screen shows all available methods — users choose based on preference.
Nigeria:        paystack
Ghana:          paystack
Kenya:          flutterwave,mpesa-ke
South Africa:   flutterwave
Ethiopia:       chapa
Tanzania:       flutterwave,mpesa-tz
Uganda:         flutterwave
Rwanda:         flutterwave
Zambia:         flutterwave
Cameroon:       flutterwave
Ivory Coast:    flutterwave
Senegal:        flutterwave
Mozambique:     flutterwave,mpesa-mz
Zimbabwe:       paynow,flutterwave
Egypt:          paymob
Mali:           flutterwave
Burkina Faso:   flutterwave


COMMODITY SCRAPER — SECTION 2 EXPANSION
The scraper scheduler in Section 1 already groups jobs by UTC hour. Section 2 adds source modules for each new country and registers them with the scheduler. No scheduler rewrite required.
New source modules
/scraper/sources/
  fmard.js          (Nigeria — live from Section 1)
  gcx.js            (Ghana — GCX website)
  kilimo-stat.js    (Kenya — KilimoSTAT API)
  daff.js           (South Africa — DAFF/data.gov.za — weekly)
  wfp-vam.js        (13 countries — WFP VAM API — already written, now activated)
  open-exchange.js  (exchange rates — already live)

The WFP VAM connector written in Section 1 handles: Ethiopia, Tanzania, Uganda, Rwanda, Zambia, Cameroon, Ivory Coast, Senegal, Mozambique, Zimbabwe, Egypt, Mali, Burkina Faso. One module, 13 countries, one API key. Register each as a separate job in the scheduler pointing to the same module with a different country_code parameter.
Scraper UTC grouping
UTC Hour
Countries
Why
00:00
Kenya, Tanzania, Uganda, Ethiopia, Rwanda
UTC+3 — 3AM local
01:00
South Africa, Zambia, Zimbabwe, Mozambique, Egypt, Rwanda
UTC+2 — 3AM local
02:00
Nigeria, Cameroon
UTC+1 — 3AM local
03:00
Ghana, Ivory Coast, Senegal, Mali, Burkina Faso
UTC+0 — 3AM local

The scheduler reads country_config.scrape_utc_hour and dispatches jobs in batches. One cron per UTC hour, not one cron per country.
South Africa cadence
South Africa updates weekly (DAFF). The daff.js module runs every Saturday at 01:00 UTC. The scheduler checks update_frequency on the country_config row before dispatching.

LOCALIZATION
Approach
react-i18next on mobile for string interpolation
Translation JSON files per locale bundled with the app for offline use
localization_strings table for over-the-air string updates without app releases
On launch: app fetches latest strings for detected locale and merges with bundled fallback
Locale detection: device locale first, then user profile preferred_locale setting
Section 2 locales
Locale
Language
Countries
en
English
Nigeria, Ghana, Kenya, South Africa, Uganda, Rwanda, Zambia, Zimbabwe, Egypt
fr
French
Cameroon, Ivory Coast, Senegal, Mali, Burkina Faso, Rwanda
sw
Swahili
Kenya, Tanzania, Uganda
am
Amharic
Ethiopia
ar
Arabic
Egypt
pt
Portuguese
Mozambique

Legal and financial documents are always produced in English regardless of the user's display locale. This is a fixed rule — not configurable per user.
Profile addition
Add preferred_locale (text, default 'en') to the profiles table. Settable in profile screen.
String keys
All UI strings use dot-notation keys: conduit.create.title, invoice.status.approved, coming_soon.discovery.message. Never hardcode English strings directly in components — always reference a key.

BUILD APPROACH — SECTION 2 MILESTONES
Section 2 is built in five milestones. Each milestone extends the existing production system. The app version continues from where Section 1 ended.
Version map:
Version
What ships
v1.1
Country activation + payment provider layer + scraper expansion
v1.2
Localization + multi-currency display across all 16 countries
v1.3
Discovery & Matchmaking Network
v1.4
Legal Readiness
v1.5
Delaware incorporation + US/UK compliance infrastructure


MILESTONE 1 — COUNTRY ACTIVATION (v1.1)
Outcome: All 16 African countries are live in country_config. The payment provider layer is provider-agnostic. The scraper runs for all countries on their correct UTC schedule. No mobile app code changes required.
country_config activation
Update all 16 country rows: active: true, populate all config fields (currency, overwrite floor, payment providers, scrape UTC hour, price feed source)
Seed Nigeria country_config scrape_utc_hour: already 02 — confirm correct
Confirm all exchange rate pairs exist in exchange_rates for all 16 new currencies
Payment provider abstraction
Create /backend/services/payment/index.js — provider-agnostic interface
Implement provider modules: flutterwave.js, mpesa-ke.js, mpesa-tz.js, mpesa-mz.js, chapa.js, paymob.js, paynow.js
Add webhook routes for each provider
Add signature verification to all new webhook handlers
Create payment_transactions table migration — backfill existing Paystack refs
Update Conduit payment routes to use payment service interface instead of calling Paystack directly
Payment wall UI: show available methods based on country_config.payment_provider for the Conduit's country
Scraper expansion
Activate wfp-vam.js connector — register 13 country jobs
Write and register gcx.js (Ghana), kilimo-stat.js (Kenya), daff.js (South Africa weekly)
Update scheduler: group by scrape_utc_hour from country_config, not hardcoded per country
Update Exchange Rate Service to fetch all new currency pairs daily
Backend routes — Milestone 1
No new routes. Updates to existing routes:
PUT    /v1/payments/initialize       — now dispatches to correct provider
POST   /v1/webhooks/flutterwave      — new
POST   /v1/webhooks/mpesa            — new (handles all M-Pesa regional variants)
POST   /v1/webhooks/chapa            — new
POST   /v1/webhooks/paymob           — new
POST   /v1/webhooks/paynow           — new
GET    /v1/payments/:conduitId/methods — returns available payment methods for country

Milestone 1 tests
All 16 country_config rows: active: true, all fields populated
Exchange rates exist for all 17 currencies (16 new + NGN already live)
Initialize payment in Ghana via Paystack test mode — payment_transactions row created
Initialize payment in Kenya via Flutterwave test mode — correct provider dispatched
Webhook signature verification rejects invalid signatures on all new providers
Scraper runs at correct UTC hour for each country group — confirm via scheduler logs
WFP VAM connector returns prices for at least 3 test countries
GCX scraper populates commodity_prices for Ghana
KilimoSTAT API returns Kenya prices
DAFF returns South Africa prices (weekly cadence confirmed in scheduler)
payment_transactions backfill: all existing Paystack refs have rows

MILESTONE 2 — LOCALIZATION (v1.2)
Outcome: The app displays correctly in English, French, Swahili, Amharic, Arabic, and Portuguese. Legal and financial documents remain in English. Users in all 16 countries see local currency with USD equivalent.
Implementation
Add preferred_locale to profiles table migration
Install react-i18next and i18next in mobile app
Create /app/locales/ directory with JSON files per locale: en.json, fr.json, sw.json, am.json, ar.json, pt.json
Seed localization_strings table with all translation strings
Backend endpoint: GET /v1/localization/:locale — returns all strings for locale (used to override bundled strings over the air)
Locale detection on app launch: device locale → profile preference → en fallback
Profile screen: locale picker — saves to profiles.preferred_locale
Arabic: RTL layout support via React Native's built-in RTL utilities
All monetary amounts: native currency primary, USD secondary in smaller text (already established in Section 1 for NGN — extend to all currencies)
Currency display conventions
Country
Display example
Nigeria
₦398,000 ($250)
Ghana
₵3,100 ($250)
Kenya
KSh 33,000 ($250)
South Africa
R4,700 ($250)
Ethiopia
Br 14,000 ($250)
Zimbabwe
$250 (USD display only — no conversion)
Egypt
£7,800 ($250)

All conversions use today's rate from exchange_rates. Rate and date shown on payment screen.
Backend routes — Milestone 2
GET    /v1/localization/:locale      — returns translation strings
PUT    /v1/profiles/locale           — update preferred locale

Milestone 2 tests
App displays in French when device locale is fr and user is in Cameroon
App displays in Swahili when locale is sw and user is in Kenya
Arabic locale triggers RTL layout correctly
An invoice generated in Ethiopia shows ETB primary, USD secondary
Changing locale in profile screen updates all UI strings without restart
Over-the-air string update: update a value in localization_strings, restart app — new string shown without app store update
Legal documents (invoices, dispute logs) always in English regardless of user locale

MILESTONE 3 — DISCOVERY & MATCHMAKING (v1.3)
Outcome: Land Owners can list available land. Farm Operators can post sourcing mandates. Farm Management teams can list operational capacity. All listings funnel into Conduit creation.
The three listing types
Land Listing — A Land Owner posts available acreage for lease. Required fields: listing type, title, location (text), land size (hectares), available crops, asking terms (optional), mapping (any of the four options).
Farm Operator Listing — A corporation or institutional buyer posts a sourcing mandate. Required fields: listing type, title, location preference, crop type sought, acreage required, terms (optional).
Farm Management Listing — A professional farmer, agronomist, or project manager posts operational capacity. Required fields: listing type, title, location, capacity (hectares manageable), crop expertise, terms (optional).
Mapping options (same four as Conduit Farm Boundary)
Option A: Drop a Pin
Option B: Enter GPS coordinates
Option C: Draw polygon
Option D: Use current GPS location
When a listing converts to a Conduit, the mapping data flows automatically into the Conduit's farm_boundary_coordsfield. Zero redundant data entry.
Discovery navigation
The app's Coming Soon state for Discovery is replaced with the live feature. Feature flag discovery is set to enabled: true during this milestone's deployment.
Discovery tab structure:
Search + filter bar: country, listing type, crop, acreage range
Listing cards: title, location, acreage, listing type badge, Mapped Location badge, Identity Verified badge
My Listings (sub-tab): drafts, active, paused, expired, converted
Trust signals and disclaimer
Mapped Location Badge — fires when user completes any mapping option. Identity Verified Badge — fires when KYC is complete (KYC implementation below).
Mandatory disclaimer — displayed permanently below every mapped listing, unskippable: "Mapped using location data supplied by the listing owner. AgroLease verifies that the submitted map data is associated with this listing but does not verify ownership, title, or legal rights over the land. Independent legal due diligence remains the responsibility of all parties."
KYC (Identity Verification)
Integrate Smile Identity (Africa-first KYC provider, supports 30+ African countries)
ID verification on listing creation — required to receive the Identity Verified badge, not to browse
On completion: identity_verified_badge: true on listing, kyc_verified: true on profile
Failed or pending KYC: user can still create listings, badge not shown
Five-stage funnel — Discovery to Conduit
Stage 1 — Post Listing Land Owner (or Farm Operator) creates listing. Mapping is collected. Listing goes live.
Stage 2 — Discover Any user filters Discovery tab. Views listing detail. Sees location, terms, badges, disclaimer. Taps "Contact Owner."
Stage 3 — Negotiate A listing_contact row is created. A dedicated in-app messaging thread opens via listing_messages. Both parties discuss terms directly in AgroLease. Communication stays on-platform.
Stage 4 — Initialize Either party taps "Create Conduit." The app pre-fills both Profile IDs and imports listing data (location text, acreage, crop type, farm boundary coords) into a new draft Conduit. The Conduit ID is generated immediately.
Stage 5 — Activate Both parties are routed to the $250 payment wall. On activation, listings.converted_to_conduit_id is set and listings.status → converted. listing_contacts.status → converted.
Listing expiry
Listings expire after 90 days of inactivity (no views, no contacts). Creator is notified 7 days before expiry. One-tap renewal extends for another 90 days.
Backend routes — Milestone 3
POST   /v1/listings                        — create listing
GET    /v1/listings                        — search/filter (paginated)
GET    /v1/listings/:id                    — listing detail
PUT    /v1/listings/:id                    — update listing
DELETE /v1/listings/:id                    — soft delete
POST   /v1/listings/:id/contact            — initiate contact (creates listing_contact)
GET    /v1/listings/:id/contacts           — my contact threads on this listing
GET    /v1/listing-contacts/:id            — contact thread detail
POST   /v1/listing-contacts/:id/messages   — send message
GET    /v1/listing-contacts/:id/messages   — message thread
POST   /v1/listing-contacts/:id/create-conduit — Stage 4: initialize Conduit from listing
GET    /v1/my/listings                     — my listings (all statuses)
GET    /v1/my/contacts                     — my contact threads (all listings)
POST   /v1/kyc/initialize                  — start Smile Identity KYC flow
POST   /v1/kyc/webhook                     — Smile Identity result webhook

Milestone 3 tests
Create a Land Listing with polygon mapping. Confirm Mapped Location Badge appears.
Complete KYC flow. Confirm Identity Verified Badge appears.
Search Discovery tab by country and crop — correct listings returned.
Contact a listing — listing_contact created, message thread opens.
Exchange 5 messages. Both parties see messages in real-time.
Stage 4: tap "Create Conduit" — Conduit pre-filled with listing data, Farm Boundary imported.
Complete payment. Confirm listing status → converted, converted_to_conduit_id set.
Listing 90-day expiry: manually set created_at back 90 days, run expiry cron — listing expires, notification fires.
Disclaimer is visible and unskippable on every listing with a map.
Feature flag discovery → enabled: true shows Discovery tab. Setting to false returns Coming Soon state.

MILESTONE 4 — LEGAL READINESS (v1.4)
Outcome: Any Conduit can activate Legal Readiness for $200/year. When a court, arbitrator, or auditor asks for documentation, the export is generated immediately. Everything is already structured, labelled with Conduit ID and Land Label, and ready.
Activation
Inside any active Conduit → "Activate Legal Readiness"
Cost: local equivalent of $200/year — same payment service interface as Conduit activation
On payment confirmed: legal_readiness_subscriptions row created, active: true, expires_at = 12 months
Both partners notified: "Legal Readiness is now active for CON-NG-000184."
Renewal: 30 days before expires_at, both partners notified daily. Same payment flow.
What the export contains
The Legal Readiness export is a structured package — not a single PDF. It is generated as a ZIP containing:
Component
Format
Description
Harvest Records
PDF table
Every truck entry/exit — weight, date, time, crop, Gate Key, evidence rating
Truck Photos
JPEG folder
All mandatory photos, filename = {record_id}_{timestamp}.jpg
Audit Trail
PDF
Every tamper flag, modification log, system event — sorted by timestamp
Guard Identities
PDF table
Full name, phone, device, approval dates, full logging history per guard
Invoice History
PDF table
Every invoice — generated, negotiated, approved, paid — with all proposal rounds
Negotiation History
PDF
Every price proposal with party label, timestamp, and acceptance or rejection
Disputes
PDF
Full dispute log — raised, evidence attached, DM transcript, resolution
Satellite Imagery
PNG folder
NDVI maps with dates (if Satellite layer active on this Conduit)
Weather History
PDF chart
Rainfall records for farm boundary by date range
Commodity Prices
PDF table
AgroLease reference prices at time of each harvest
Conduit Summary
PDF
Conduit ID, Land Label, both Profile IDs, agreement terms, full timeline
Timeline Reconstruction
PDF
Chronological event sequence for the requested date range

Every PDF carries: Conduit ID, Land Label, date range, export timestamp, AgroLease watermark. Every page is numbered. Generated with pdfkit (Node.js).
Export flow
Either party taps "Generate Export" inside an active Legal Readiness Conduit
Date range picker (default: all time)
Component selector — all selected by default, individual components can be deselected
"Generate" enqueues a legal_readiness_export job
Route returns immediately: { exportId, status: 'queued' }
Worker processes job: fetches all records for date range, generates PDFs, fetches satellite imagery signed URLs, compiles ZIP
ZIP uploaded to Supabase Storage: /legal-exports/{conduit_id}/{export_id}.zip
legal_readiness_exports row updated: status: 'completed', export_url set (signed URL, 72-hour expiry)
Push notification to requesting party: "Your Legal Readiness export for CON-NG-000184 is ready."
Tap → download ZIP
Coming Soon → Live
Remove Legal Readiness from Coming Soon states in the app. Feature flag legal_readiness → enabled: true on deployment.
Backend routes — Milestone 4
POST   /v1/conduits/:id/legal-readiness/activate
GET    /v1/conduits/:id/legal-readiness/status
POST   /v1/conduits/:id/legal-readiness/export
GET    /v1/conduits/:id/legal-readiness/exports
GET    /v1/legal-exports/:exportId/status
GET    /v1/legal-exports/:exportId/download   — returns signed URL (72h expiry)

Milestone 4 tests
Activate Legal Readiness via Flutterwave test mode (Kenya test account). Subscription created.
Generate export for a Conduit with at least: 3 harvest records, 2 invoices (1 with proposal history), 1 dispute (resolved), active satellite layer.
Confirm export job enqueues immediately, route returns queued status.
Worker completes — ZIP in Supabase Storage, signed URL accessible.
Open ZIP: all 12 components present. All PDFs carry Conduit ID and Land Label on every page.
Photos in ZIP match harvest_records.truck_photo_url references.
Signed URL expires after 72 hours (confirm with manual time test).
Notification fires to requesting party with deep link to download screen.
Renewal flow: set expires_at to 2 days out — daily notification fires, renewal payment accepted.
Feature flag legal_readiness toggling works — Coming Soon ↔ Live.

MILESTONE 5 — DELAWARE PARENT COMPANY (v1.5)
Outcome: AgroLease Inc. is incorporated in Delaware. The US legal and financial infrastructure is in place. UK compliance exports are live. The platform is positioned for US investors, YC, and global institutional partners.
Delaware incorporation
Incorporate AgroLease Inc. via Stripe Atlas (handles Delaware C-Corp formation, EIN, registered agent)
Open Mercury business bank account (US banking, supports international wires)
Set up Stripe account under AgroLease Inc. for future US market payment processing (Section 3)
Structure: AgroLease Inc. (Delaware) is the parent. All regional operations are subsidiaries or branches.
Document corporate hierarchy in legal records — Nigeria, Ghana, Kenya, South Africa as subsidiary markets
Engage US tax advisor for transfer pricing structure between parent and regional operations
US operational infrastructure
US business address (Stripe Atlas registered agent address is sufficient initially)
EIN issued by IRS (via Stripe Atlas)
US bank account (Mercury) for receiving USD payments from enterprise clients and investors
Stripe account (KYC complete) for future US-facing payment processing
US privacy policy updated to include Delaware entity name and address
Terms of Service updated: governing law → Delaware, USA
UK compliance exports
UK is in Section 1's country_config (Phase 8, currently inactive). Section 2 activates it for compliance export generation — UK enterprise tenants generating DEFRA-aligned documentation.
Activate UK country_config row — active: true, currency_code: GBP, price_feed_source: DEFRA, update_frequency: monthly
Write defra.js scraper module — DEFRA gov.uk open data, monthly cadence
UK Legal Readiness export: same export package as Section 4, but compliance PDF header adapted to UK format (DEFRA reference, company registration number field, VAT field)
Add compliance_template field to legal_readiness_exports — values: standard, uk_compliance, us_compliance
UK users selecting Legal Readiness export see: "Generate DEFRA-aligned Compliance Package"
US compliance exports (architecture — not yet active)
Write the US compliance export template (USDA/AMS aligned) for Section 3 activation. US country_config row exists but remains inactive. The compliance template is ready.
Admin panel additions
Delaware entity details visible in super_admin panel
US bank account balance display (Mercury API, read-only)
Cross-country revenue report: USD equivalent revenue per country per month
Legal entity selector on admin invoice/receipt generation
Backend routes — Milestone 5
GET    /v1/admin/revenue-by-country         — super_admin only
GET    /v1/admin/entity-overview            — Delaware entity summary
POST   /v1/conduits/:id/legal-readiness/export?template=uk_compliance

Milestone 5 tests
Delaware incorporation confirmed: C-Corp, EIN, registered agent, Mercury account open
Stripe Atlas account KYC complete
UK country_config active, DEFRA scraper runs monthly (simulate manually)
UK compliance export generated — PDF header contains DEFRA reference fields
Cross-country revenue report returns correct USD totals per country
Terms of Service updated with Delaware entity
Super_admin can view entity overview in admin panel

END-TO-END TEST — SECTION 2
Run complete cross-country scenario using test accounts across three countries.
Payment provider coverage (all tested in this sequence):
Account A (Ghana Land Owner): Create Conduit, pay via Paystack Ghana test mode
Account B (Kenya Farm Operator): Accept invitation, pay remaining via Flutterwave test mode
Account C (Ethiopia Land Owner): Create Conduit, pay via Chapa test mode
Account D (Egypt Farm Operator): Accept, pay via Paymob test mode
Discovery funnel: 5. Account A: Post Land Listing for Ghana farm, complete polygon mapping, complete KYC 6. Account E (Operator, any country): Discover listing, initiate contact 7. Account A and E: Exchange 5 messages 8. Account E: Tap "Create Conduit" — confirm listing data pre-fills correctly 9. Both complete payment — confirm listing status → converted
Legal Readiness: 10. Account A (Ghana Conduit, from step 1): Activate Legal Readiness, generate full export 11. Confirm ZIP: all 12 components present, Conduit ID + Land Label on every PDF page 12. Account A: Download via signed URL. Confirm expiry after 72 hours.
Localization: 13. Account F (Cameroon, French locale): Confirm app displays in French 14. Confirm invoice generated in XAF with USD equivalent 15. Confirm legal documents for Account F's Conduit are in English
Trust Score and notifications: 16. Trigger late payment on Account A's Conduit — Trust Score drops 17. Confirm notification fires to both parties in their respective locales
UK compliance: 18. Activate UK country config. Run DEFRA scraper manually. 19. Generate UK compliance export for a test Conduit — confirm DEFRA fields in PDF header.
Document every step result. Fix every failure. Do not proceed to Section 3 until all steps pass.

SECTION 2 COMPLETION STATE
When Section 2 finishes, the following exists permanently. Section 3 reads this before writing a single line of code and never rebuilds any of it.
Active Countries
Nigeria, Ghana, Kenya, South Africa, Ethiopia, Tanzania, Uganda, Rwanda, Zambia, Cameroon, Ivory Coast, Senegal, Mozambique, Zimbabwe, Egypt, Mali, Burkina Faso, United Kingdom — 18 countries active
US: country_config row exists, active: false — activated in Section 3
Mobile
All Section 1 mobile features still live and unchanged
Localization: 6 locales (en, fr, sw, am, ar, pt) — over-the-air string updates via localization_strings
RTL layout support (Arabic)
Discovery tab live — three listing types, full five-stage funnel
Legal Readiness activation + export download flow
Multi-provider payment screens (Paystack, Flutterwave, M-Pesa, Chapa, Paymob, Paynow)
KYC flow via Smile Identity
Backend
All Section 1 backend features still live and unchanged
GET /v1/app-config returns correct active_countries list for all 18 countries, correct platform_pricing_usd, correct feature flags
Provider-agnostic payment service — 6 provider modules
Webhook handlers for all providers — all signature-verified
payment_transactions table — all payments tracked regardless of provider
Discovery routes — listings, contacts, messages, Conduit initialization from listing
Legal Readiness routes — activation, export generation, download
Legal export worker — ZIP generation, PDF generation (pdfkit), 12 components, signed URL delivery
UK compliance export template live
US compliance export template written, inactive
Cross-country revenue reporting in admin panel
Smile Identity KYC webhook handler
Infrastructure
All Section 1 infrastructure unchanged
Scraper running for all 18 active countries — grouped by UTC hour
WFP VAM connector active (13 countries)
DEFRA scraper active (UK, monthly)
All Section 2 database migrations applied and tested with rollback files
All Section 2 indexes live
Database
payment_transactions table live — backfill of Nigeria Paystack refs complete
listings, listing_contacts, listing_messages tables live
legal_readiness_subscriptions, legal_readiness_exports tables live
localization_strings seeded for all 6 locales
feature_flags updated: discovery, legal_readiness, farm_management_listings — all enabled: true
All 18 country country_config rows active with correct payment providers, overwrite floors, scrape hours
Legal Entity
AgroLease Inc. incorporated in Delaware (C-Corp)
EIN issued
Mercury US bank account open
Stripe account KYC complete (ready for US market in Section 3)
Registered agent in place
US Terms of Service and Privacy Policy updated with Delaware entity
Architecture rules in effect (all Section 1 rules plus)
Payment processing is provider-agnostic — payment_transactions is the single source of truth
Legal documents always generated in English regardless of user locale
Localization strings managed in DB for over-the-air updates — no hardcoded UI strings in components
Discovery listings always carry the land disclaimer — cannot be disabled per listing
Legal Readiness exports always carry Conduit ID and Land Label on every page
KYC completion required for Identity Verified badge — not for platform access

AgroLease Build Specification — Section 2 — June 2026 Read AGROLEASE_ENGINEERING_CONSTITUTION.md and confirm Section 1 Completion State before starting. Do not rebuild what already exists.


