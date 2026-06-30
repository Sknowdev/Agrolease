AGROLEASE BUILD SPECIFICATION
SECTION 3 — Global Scale

Before reading this document, the agent must have read AGROLEASE_ENGINEERING_CONSTITUTION.md in full. All permanent rules defined there apply to every line of code written in this section.
Section 1 and Section 2 are assumed complete, tested, and running in production. Nothing from either section is rebuilt, duplicated, or refactored unless explicitly stated here. This section extends the existing production system.

WHAT ALREADY EXISTS
The following is live in production from Sections 1 and 2. Do not touch it.
Active countries (18): Nigeria, Ghana, Kenya, South Africa, Ethiopia, Tanzania, Uganda, Rwanda, Zambia, Cameroon, Ivory Coast, Senegal, Mozambique, Zimbabwe, Egypt, Mali, Burkina Faso, United Kingdom (compliance exports only).
Mobile: Production React Native app. Auth, Conduits, gate logging, invoices, disputes, agreements, Trust Score, Spatial Engine, Satellite layer (Sentinel-2), push notifications, deep linking, Coming Soon states, Discovery & Matchmaking, Legal Readiness, localization (en, fr, sw, am, ar, pt), offline-first write queue, GET /v1/app-config driving all runtime configuration.
Backend: Production Fastify API. All routes under /v1/. RBAC, rate limiting, idempotency keys, OpenAPI spec. BullMQ + Redis job queues (notifications, invoices, trust_score, satellite, scraper, audit, analytics, legal_export). Provider-agnostic payment service (Paystack, Flutterwave, M-Pesa regional, Chapa, Paymob, Paynow). Structured logging, Sentry, OpenTelemetry, metrics.
Infrastructure: Three environments. CI/CD pipeline. Production Supabase with daily backups and point-in-time recovery. All secrets rotatable without downtime. BullMQ backed by Railway Redis. File upload pipeline. Quarterly backup restoration tested.
Bots: Commodity Scraper (18 countries, grouped by UTC hour), Satellite Bot (Sentinel-2, Saturday nights), Exchange Rate Service (daily), WFP VAM connector (13 countries), DEFRA scraper (UK, monthly).
Database: Full schema including payment_transactions, listings, listing_contacts, listing_messages, legal_readiness_subscriptions, legal_readiness_exports, localization_strings, audit_events, analytics_events, background_jobs, permissions, feature_flags. All indexes live.
Legal entity: AgroLease Inc. incorporated in Delaware. EIN issued. Mercury US bank account. Stripe account KYC complete. Registered agent in place.
Architecture rules in effect: All Constitution rules apply. No country-specific logic in code. USD master pricing. All async work through BullMQ. Soft deletes everywhere. Append-only audit log. Multi-tenancy isolation on every request. Every secret rotatable. GET /v1/app-config is the runtime source of truth for the mobile app.

WHAT SECTION 3 BUILDS
Section 3 scales the platform globally across five directions:
Global country activation — India (28 APMC state rules), Brazil, Indonesia, US (full), UK (full), plus Australia and Gulf states
Enterprise layer — multi-Conduit dashboards, Stripe global billing, Apple Pay and Google Pay, enterprise support tiers
AI features — AI Geospatial boundary detection, AI Crop Stress Analysis, Planet Labs high-resolution satellite, Historical Time-Lapse
Platform intelligence — advanced analytics, yield prediction, carbon credit tracking, agricultural insurance integration
Infrastructure scaling — multi-region deployment, CDN for satellite imagery, database read replicas, load testing protocols
One codebase. One backend. One schema. No country-specific application code.

NEW SCHEMA ADDITIONS
Add these tables and columns to the existing schema. No existing table is dropped or restructured.
state_config
id, country_code (FK country_config),
state_code (text), state_name (text),
regulatory_framework (text, nullable),
overwrite_fee_floor_override_local (decimal, nullable),
commodity_market_rules (jsonb, nullable),
active (boolean, default true),
created_at, updated_at

Mandatory for India (28 APMC state laws). Optional for all other countries. When a state_config row exists for a Conduit's country and state, its rules override the country_config defaults where specified.
Seed India: 28 rows — one per state — each with the relevant APMC rule set encoded in commodity_market_rulesjsonb. States where APMC has been reformed (e.g. Bihar — no APMC) are flagged in regulatory_framework.
enterprise_accounts
id (uuid), account_id (text — e.g. ENT-000001),
display_name (text), country_code (FK country_config),
billing_email (text), stripe_customer_id (text, nullable),
plan (standard | premium | custom),
max_conduits (int, nullable — null = unlimited),
sla_response_hours (int, default 48),
dedicated_support (boolean, default false),
created_at, updated_at

enterprise_members
id, enterprise_account_id (FK enterprise_accounts),
profile_id (FK profiles),
role (owner | admin | viewer),
invited_at (timestamptz), accepted_at (timestamptz, nullable),
created_at

enterprise_conduit_access
id, enterprise_account_id (FK enterprise_accounts),
conduit_id (FK conduits),
granted_at (timestamptz), granted_by (FK profiles),
created_at

Allows enterprise accounts to view and manage multiple Conduits under one dashboard.
planet_labs_reports
id (uuid), conduit_id (FK conduits),
report_date (date),
high_res_image_url (text),
resolution_cm (int),
cloud_cover_percentage (decimal),
image_available (boolean),
ndvi_enhanced_url (text, nullable),
scene_id (text),
subscription_tier (text),
created_at

ai_boundary_suggestions
id (uuid), conduit_id (FK conduits, nullable),
listing_id (FK listings, nullable),
suggested_coords (jsonb — GeoJSON polygon),
confidence_score (decimal 0-1),
method (photo_metadata | satellite_terrain | manual_correction),
accepted (boolean, nullable),
accepted_by (FK profiles, nullable),
accepted_at (timestamptz, nullable),
created_at

yield_predictions
id (uuid), conduit_id (FK conduits),
crop_name (text), prediction_date (date),
predicted_yield_tonnes (decimal),
confidence_interval_low (decimal),
confidence_interval_high (decimal),
model_version (text),
inputs_summary (jsonb),
created_at

carbon_credits
id (uuid), conduit_id (FK conduits),
credit_type (text),
tonnes_co2_equivalent (decimal),
verification_standard (text, nullable),
verification_status (unverified | pending | verified),
registry_id (text, nullable),
issued_at (timestamptz, nullable),
retired_at (timestamptz, nullable),
created_at, updated_at

insurance_policies
id (uuid), conduit_id (FK conduits),
provider_name (text), policy_number (text),
policy_type (crop | weather | revenue),
coverage_start (date), coverage_end (date),
coverage_amount_usd (decimal),
premium_usd (decimal),
status (active | expired | claimed),
claim_filed_at (timestamptz, nullable),
claim_amount_usd (decimal, nullable),
created_at, updated_at

support_tickets
id (uuid), ticket_id (text — e.g. TKT-000001),
profile_id (FK profiles),
enterprise_account_id (FK enterprise_accounts, nullable),
conduit_id (FK conduits, nullable),
subject (text), body (text),
priority (low | normal | high | critical),
status (open | in_progress | resolved | closed),
assigned_to (text, nullable),
sla_deadline (timestamptz, nullable),
resolved_at (timestamptz, nullable),
created_at, updated_at

New indexes
CREATE INDEX idx_state_config_country ON state_config(country_code);
CREATE INDEX idx_enterprise_members_profile ON enterprise_members(profile_id);
CREATE INDEX idx_enterprise_members_account ON enterprise_members(enterprise_account_id);
CREATE INDEX idx_enterprise_conduit_access_account ON enterprise_conduit_access(enterprise_account_id);
CREATE INDEX idx_enterprise_conduit_access_conduit ON enterprise_conduit_access(conduit_id);
CREATE INDEX idx_planet_labs_conduit_date ON planet_labs_reports(conduit_id, report_date DESC);
CREATE INDEX idx_ai_boundary_conduit ON ai_boundary_suggestions(conduit_id);
CREATE INDEX idx_yield_predictions_conduit ON yield_predictions(conduit_id, prediction_date DESC);
CREATE INDEX idx_carbon_credits_conduit ON carbon_credits(conduit_id);
CREATE INDEX idx_insurance_policies_conduit ON insurance_policies(conduit_id);
CREATE INDEX idx_support_tickets_profile ON support_tickets(profile_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

feature_flags additions
INSERT INTO feature_flags (feature_key, country_code, enabled, coming_soon) VALUES
('ai_geospatial', NULL, true, false),
('ai_crop_stress', NULL, true, false),
('satellite_timelapse', NULL, true, false),
('planet_labs', NULL, true, false),
('yield_prediction', NULL, true, false),
('carbon_credits', NULL, false, true),
('insurance_integration', NULL, false, true),
('enterprise_dashboard', NULL, true, false);


GLOBAL COUNTRY ACTIVATION
Phase 5–9 countries (from V10 product plan)
Country
Code
Currency
Symbol
UTC Offset
Scrape UTC
Payment Provider
Commodity Source
India
IN
INR
₹
+5:30
21:30 (prev day)
Razorpay
Agmarknet / data.gov.in
Brazil
BR
BRL
R$
−3
06:00
Stripe + Pix
CONAB Govt Portal
Indonesia
ID
IDR
Rp
+7
20:00 (prev day)
Midtrans
BPS Statistics API
United Kingdom
GB
GBP
£
0/+1 BST
03:00
Stripe
DEFRA gov.uk (already active)
United States
US
USD
$
−5 to −8
08:00
Stripe
USDA NASS + AMS

Additional global markets
Country
Code
Currency
Symbol
UTC Offset
Scrape UTC
Payment Provider
Commodity Source
Australia
AU
AUD
A$
+10/+11
17:00 (prev day)
Stripe
ABARES
United Arab Emirates
AE
AED
د.إ
+4
23:00 (prev day)
Stripe + PayTabs
FAO / WFP VAM
Saudi Arabia
SA
SAR
ر.س
+3
00:00
Stripe + PayTabs
FAO / WFP VAM

India — special handling
India requires more configuration than any other country. The state_config table (new in Section 3) is mandatory for Indian Conduits.
APMC state rules: During Indian Conduit creation, after the country field is set to India, the app presents a mandatory state picker. The selected state determines:
Which commodity markets are regulated
Whether the platform price engine references state APMC mandi prices or national Agmarknet averages
The applicable overwrite_fee_floor_override_local if the state sets a different floor
State field in Conduit creation: For India only, the Land Label form gains a fourth mandatory field: State. This field is hidden for all other countries. Enforced in both the UI (state picker only shown when country = India) and the API (validation rejects Indian Conduits without a valid state code).
Agmarknet API: Free, official, open government API from data.gov.in. Returns daily mandi prices per commodity per state. The scraper module calls the API with state_code and commodity parameters. One scrape job per active Indian state (up to 28), all grouped at 21:30 UTC.
US — full activation
Stripe is already set up under AgroLease Inc. (Delaware) from Section 2. Section 3 activates the US country_config row and enables full Conduit creation, payment, and operations for US users.
US compliance export template (written in Section 2, inactive until now) is activated. US users with Legal Readiness can generate USDA/AMS-aligned compliance packages.
USDA NASS + AMS: official federal API, free, returns daily commodity prices. Scraper module queries per crop. US scrape runs at 08:00 UTC (3AM ET / midnight PT — catches both coasts in off-hours).
UK — full activation
UK was activated for compliance exports in Section 2 (DEFRA scraper live, monthly). Section 3 enables full Conduit creation and operations for UK users — not just compliance. The existing DEFRA scraper continues as-is.
Payment additions
Stripe (India — Razorpay, Section 3 uses Razorpay): Razorpay is India's dominant payment processor. Supports UPI, NEFT, IMPS, cards. Write razorpay.js provider module following the existing payment service interface.
Stripe (US, UK, Australia): Stripe account (AgroLease Inc., Delaware) already KYC complete. Write stripe.jsprovider module. Supports cards, bank transfers, and in Section 3: Apple Pay and Google Pay.
Pix (Brazil): Brazil's instant payment system. Stripe supports Pix — handled through the Stripe module with payment_method_types: ['pix'].
Midtrans (Indonesia): Indonesia's leading payment gateway. Supports GoPay, OVO, bank transfer, virtual account. Write midtrans.js provider module.
PayTabs (UAE, Saudi Arabia): Regional payment processor covering Gulf states. Supports credit cards, mada (Saudi), and local bank transfers. Write paytabs.js provider module.
Apple Pay + Google Pay: Enabled through Stripe on mobile via @stripe/stripe-react-native. Available in all countries where Stripe is the payment provider. Apple Pay requires Apple Pay merchant registration under AgroLease Inc. Google Pay requires Google Pay merchant registration. Both show as options alongside standard Stripe card payment when the device supports them.
Scraper UTC grouping additions
UTC Hour
Countries
17:00 (prev day)
Australia
20:00 (prev day)
Indonesia
21:00 (prev day)
India (states with UTC+5:30 = runs at 02:30 local — close enough to 3AM)
23:00 (prev day)
UAE, Saudi Arabia
06:00
Brazil
08:00
United States

UK and most of Africa already handled in Section 2 scheduler groups.

LOCALIZATION ADDITIONS
Section 2 covered: en, fr, sw, am, ar, pt
Section 3 adds:
Locale
Language
Countries
hi
Hindi
India
pt-BR
Brazilian Portuguese
Brazil (distinct from pt used in Mozambique)
id
Indonesian
Indonesia
ar-AE
Gulf Arabic
UAE, Saudi Arabia

Note on pt vs pt-BR: Mozambique Portuguese (pt) and Brazilian Portuguese (pt-BR) are distinct in vocabulary and formality. Both locales are maintained separately in localization_strings. The app detects the user's country from their country_code on the profile and selects the correct Portuguese variant.
Hindi (hi): Right-to-left is not required. Standard LTR layout applies.
Indonesian (id): Standard LTR layout. No special handling required.

BUILD APPROACH — SECTION 3 MILESTONES
Section 3 is built in five milestones. The app version continues from where Section 2 ended.
Version map:
Version
What ships
v2.0
Global country activation — India, Brazil, Indonesia, US, UK full, Australia, Gulf
v2.1
Enterprise layer — multi-Conduit dashboard, Stripe global, Apple Pay, Google Pay
v2.2
AI features — geospatial detection, crop stress analysis, Planet Labs, time-lapse
v2.3
Platform intelligence — analytics dashboard, yield prediction, carbon credits, insurance
v2.4
Infrastructure scaling — multi-region, CDN, read replicas, load testing


MILESTONE 1 — GLOBAL COUNTRY ACTIVATION (v2.0)
Outcome: India, Brazil, Indonesia, US, UK (full), Australia, UAE, and Saudi Arabia are live. All new payment providers are operational. All new scraper sources are running. India's 28-state APMC rules are correctly applied.
Country config activation
Activate all 8 new country country_config rows with full field population
Seed state_config table with all 28 Indian states — APMC rule sets in commodity_market_rules jsonb
Add preferred_locale support for hi, pt-BR, id, ar-AE
Seed localization_strings for 4 new locales
Update GET /v1/app-config to include new countries in active_countries
India Conduit creation
Country picker on Conduit creation — selecting India shows State picker (mandatory)
State picker populated from state_config WHERE country_code = 'IN' AND active = true
conduits table: add state_code (text, nullable) column — required when country_code = 'IN', optional elsewhere
Overwrite fee floor: check state_config.overwrite_fee_floor_override_local first, fall back to country_config.overwrite_fee_floor_local
Invoice price engine for India: pull from commodity_prices filtered by country_code = 'IN' and state_codewhere applicable
New payment provider modules
razorpay.js — India: UPI, NEFT, IMPS, cards. Webhook: POST /v1/webhooks/razorpay
stripe.js — US, UK, Australia, Brazil (Pix via Stripe). Webhook: POST /v1/webhooks/stripe
midtrans.js — Indonesia: GoPay, OVO, bank transfer. Webhook: POST /v1/webhooks/midtrans
paytabs.js — UAE, Saudi Arabia. Webhook: POST /v1/webhooks/paytabs
All new webhooks: signature verified before processing, job enqueued, 200 returned immediately
Apple Pay + Google Pay: enabled through stripe.js via @stripe/stripe-react-native — device capability check before showing option
New scraper modules
agmarknet.js — India: official API, per-state, per-commodity. 28 jobs registered in scheduler at 21:00 UTC
conab.js — Brazil: CONAB Govt Portal scrape via Cheerio. 06:00 UTC
bps.js — Indonesia: BPS Statistics API, free. 20:00 UTC
usda.js — US: USDA NASS + AMS official API, free federal data. 08:00 UTC
abares.js — Australia: ABARES data. 17:00 UTC
WFP VAM connector already handles UAE and Saudi Arabia — register both country jobs
DEFRA already active for UK — no change
Backend routes — Milestone 1
GET    /v1/countries/IN/states       — list Indian states from state_config
GET    /v1/app-config                — updated: new countries in active_countries
POST   /v1/webhooks/razorpay
POST   /v1/webhooks/stripe
POST   /v1/webhooks/midtrans
POST   /v1/webhooks/paytabs

Milestone 1 tests
India Conduit creation: state picker appears, state is saved on conduit row
India overwrite floor: select a state with an override — confirm override applies
Razorpay test payment — payment_transactions row created, Conduit activates
Stripe test payment (US account) — card, then Apple Pay on device, then Google Pay on device
Brazil Pix test — Stripe Pix test mode — Conduit activates
Midtrans GoPay test — Indonesia Conduit activates
All 28 Agmarknet state scraper jobs run — commodity_prices populated for 3 test states
CONAB scraper populates Brazil prices
BPS scraper populates Indonesia prices
USDA scraper populates US prices for all tracked crops
GET /v1/app-config returns 26 active countries
Hindi locale renders correctly in app
Brazilian Portuguese renders correctly and differs from Mozambique Portuguese
Indonesian locale renders correctly

MILESTONE 2 — ENTERPRISE LAYER (v2.1)
Outcome: Enterprise customers (Dangote, Nestlé, large agribusiness operators) can manage all their Conduits under one dashboard. Stripe handles all subscription billing for global enterprise accounts. Support tickets have SLA enforcement.
Enterprise account creation
Enterprise accounts are created by super_admin in the admin panel — not self-serve. Each enterprise account is linked to one or more profiles (the humans who work there) via enterprise_members.
Admin panel: "Create Enterprise Account" — display name, billing email, plan, max Conduits, SLA hours
Invite enterprise members: sends email with deep link to accept membership
Enterprise owner links their Conduits to the enterprise account via enterprise_conduit_access
Enterprise dashboard (in-app)
Enterprise members with viewer or admin role see an Enterprise tab in addition to their personal dashboard.
Enterprise overview:
All linked Conduits across all countries — filterable by country, status, operator name
Aggregate metrics: total active Conduits, total harvest records this season, total invoice value pending, total Trust Score average across all Conduits
Map view: all linked farm boundaries on a single map (if Farm Boundary set)
Quick jump to any individual Conduit
Enterprise does not change how Conduits work. Individual Conduit operations (gate logging, invoice approval, dispute) remain between the Land Owner and Farm Operator of that Conduit. The enterprise dashboard is a read layer on top — not a control layer.
Stripe enterprise billing
Enterprise accounts are billed via Stripe Billing (subscription model) rather than per-Conduit payment wall. Stripe customer ID stored on enterprise_accounts.stripe_customer_id.
Three enterprise plans:
Plan
Conduit limit
Annual price
What's included
Standard
Up to 10
$2,000/year
All features, 48h support SLA
Premium
Up to 50
$8,000/year
All features, 24h SLA, dedicated support contact
Custom
Unlimited
Negotiated
All features, custom SLA, white-glove onboarding

Billing logic:
Enterprise plan covers the Conduit activation fee for all Conduits under the account (up to the plan limit)
Satellite ($100/Conduit) and Legal Readiness ($200/Conduit) remain per-Conduit add-ons billed via Stripe
Individual (non-enterprise) users continue using the existing per-Conduit payment wall with regional providers
Apple Pay + Google Pay (global rollout confirmation)
Confirmed live through stripe.js in Milestone 1. Milestone 2 adds:
Apple Pay merchant validation for all active Stripe countries
Google Pay merchant registration complete
Both methods shown on all Stripe payment screens when device supports them
Payment screen renders method options dynamically based on device capability + country Stripe support
Support tickets
"Contact Support" in profile screen — creates support_tickets row
Enterprise accounts: SLA deadline calculated from enterprise_accounts.sla_response_hours at ticket creation time
Non-enterprise: priority: normal, no SLA deadline, standard email response
Admin panel: support ticket queue filtered by priority and SLA deadline
super_admin and support_admin can assign, respond, and resolve tickets
Resolving a ticket sends push notification to submitting user
Backend routes — Milestone 2
POST   /v1/admin/enterprise-accounts
GET    /v1/admin/enterprise-accounts
GET    /v1/admin/enterprise-accounts/:id
POST   /v1/enterprise/:id/members/invite
POST   /v1/enterprise/accept-invitation
POST   /v1/enterprise/:id/conduits/:conduitId/link
GET    /v1/enterprise/:id/conduits
GET    /v1/enterprise/:id/overview
POST   /v1/support/tickets
GET    /v1/support/tickets/:id
GET    /v1/admin/support/tickets
PUT    /v1/admin/support/tickets/:id
POST   /v1/webhooks/stripe/billing          — Stripe subscription events

Milestone 2 tests
Create enterprise account in admin panel (Standard plan, limit 10 Conduits)
Invite 2 members — both accept, appear in enterprise_members
Link 3 Conduits to enterprise — all appear in Enterprise dashboard
Enterprise overview: aggregate metrics correct, map shows all 3 farm boundaries
Attempt to link 11th Conduit to Standard plan — blocked with plan limit error
Stripe subscription webhook fires — enterprise_accounts.stripe_customer_id updated
Submit support ticket — SLA deadline set correctly for enterprise vs non-enterprise
Apple Pay payment on iOS device (US account) — payment completes, Conduit activates
Google Pay payment on Android device — payment completes

MILESTONE 3 — AI FEATURES (v2.2)
Outcome: The Coming Soon states for AI Geospatial Matching, AI Crop Stress Analysis, Historical Time-Lapse, and Planet Labs are replaced with live features. Farm boundaries can be suggested from photos. Crop stress is detected automatically. High-resolution imagery is available as an upgrade.
AI Geospatial boundary detection
Removes Coming Soon from Spatial Engine screen. Feature flag ai_geospatial → enabled: true.
How it works:
User uploads 3–10 ground-level photos of their farm boundary markers, fences, or landmarks
Photos uploaded to Supabase Storage: /ai-boundary/{conduit_id}/inputs/
Backend enqueues ai_boundary_suggest job
Worker sends photos to a vision model (Claude claude-sonnet-4-6 via Anthropic API) with a structured prompt requesting GPS metadata extraction from EXIF data and terrain feature identification
If EXIF GPS metadata exists in photos: extract coordinates, form a suggested polygon from the coordinate sequence
If no EXIF: use terrain feature identification to generate a textual description — no auto-polygon, present description to user with instruction to draw manually
Suggested polygon written to ai_boundary_suggestions with confidence_score
User presented with suggestion on map — can accept, reject, or manually adjust
On accept: ai_boundary_suggestions.accepted: true, coords written to conduits.farm_boundary_coords
Disclaimer shown on AI Geospatial screen: "AI-suggested boundaries are generated from uploaded photos and GPS metadata. They are suggestions only and must be reviewed and accepted by the user before being saved. AgroLease does not guarantee the accuracy of AI-generated boundaries."
AI Crop Stress Analysis
Removes Coming Soon from Satellite screen. Feature flag ai_crop_stress → enabled: true.
How it works:
After each Sentinel-2 NDVI report is generated by the Saturday bot, the satellite processing job also sends the NDVI map and 4-week rolling NDVI data to the Anthropic API
Structured prompt: given this NDVI map and historical trend, identify any visible stress zones, probable cause (drought, flooding, pest, disease, nutrient deficiency), and recommended action
Response stored as satellite_reports.anomaly_description (existing field, now AI-generated rather than rule-based)
Displayed on satellite dashboard as a "Crop Intelligence" card below the NDVI map
If stress zones identified: push notification to Land Owner — "AI detected possible crop stress in the northwest quadrant of Kaduna Block A. View your satellite report."
Important: All AI analysis is labelled "AI Analysis" in the UI with a disclaimer: "This analysis is generated by AI from satellite imagery. It is advisory only and does not replace agronomist assessment."
Planet Labs high-resolution satellite
Removes Coming Soon from Satellite screen. Activatable per Conduit as an upgrade on top of the existing Sentinel-2 layer.
Pricing: Planet Labs upgrade costs an additional $150/year per Conduit (on top of the base $100 Sentinel-2 layer). Total satellite cost with Planet Labs: $250/year per Conduit. Update GET /v1/app-config platform_pricing_usd to include planet_labs_upgrade: 150.
Resolution: Planet Labs PlanetScope: 3-metre resolution vs Sentinel-2's 10-metre. Significant improvement for smaller parcels.
Integration:
Planet Labs API (subscription required — register account and acquire API key before Milestone 3)
planet_labs_reports table stores high-res imagery separately from satellite_reports
Saturday bot: for Conduits with Planet Labs active, query Planet Labs /data/v1/quick-search API for latest PlanetScope scenes over Farm Boundary
Download analytic SR asset, generate enhanced NDVI PNG, upload to Supabase Storage: /satellite/planet/{conduit_id}/{date}.png
Satellite dashboard: tab switcher — "Standard (10m)" vs "High-Resolution (3m)"
Activation flow:
Satellite dashboard → "Upgrade to High-Resolution"
Paystack/Stripe/regional payment for $150/year equivalent
On confirmation: Planet Labs API activated for this Conduit's Farm Boundary
Historical Time-Lapse
Removes Coming Soon from Satellite screen. Feature flag satellite_timelapse → enabled: true.
Available for any Conduit that has accumulated 8+ weekly satellite reports (approximately 2 months of data).
How it works:
User taps "View Time-Lapse" on satellite dashboard
Backend enqueues generate_timelapse job
Worker fetches all satellite_reports NDVI PNG URLs for this Conduit sorted by report_date
Generates an animated GIF or MP4 (using ffmpeg on Railway worker) from the sequence of NDVI maps
Uploaded to Supabase Storage: /satellite/timelapse/{conduit_id}/{generated_at}.gif
Displayed in-app as a looping animation
Time-Lapse is regenerated on demand — not stored permanently (regenerated from source PNGs each time to save storage)
Backend routes — Milestone 3
POST   /v1/conduits/:id/ai-boundary/suggest
GET    /v1/conduits/:id/ai-boundary/suggestions
POST   /v1/ai-boundary-suggestions/:id/accept
POST   /v1/ai-boundary-suggestions/:id/reject
POST   /v1/conduits/:id/planet-labs/activate
GET    /v1/conduits/:id/planet-labs/reports
GET    /v1/conduits/:id/satellite/timelapse
POST   /v1/conduits/:id/satellite/timelapse/generate

Milestone 3 tests
Upload 5 photos with EXIF GPS data — suggested polygon generated on map, confidence_score returned
Upload 5 photos without EXIF — textual description returned, no auto-polygon
Accept AI boundary suggestion — conduits.farm_boundary_coords updated
Satellite dashboard shows "Crop Intelligence" card on Conduit with 4+ weeks of data
AI stress analysis fires notification when stress zones detected
AI disclaimer visible on both AI Geospatial and Crop Intelligence cards
Activate Planet Labs on test Conduit — planet_labs_reports row created after Saturday bot run
Satellite dashboard: tab switcher shows Standard vs High-Resolution views
Time-Lapse generates for Conduit with 8+ reports — GIF plays in app
Feature flag ai_geospatial: false → AI boundary option hidden, Coming Soon shown

MILESTONE 4 — PLATFORM INTELLIGENCE (v2.3)
Outcome: AgroLease becomes a data platform, not just a record system. Land Owners see predictive yield data. Carbon credit tracking is introduced. Agricultural insurance can be linked to Conduits. The analytics dashboard gives product teams decision-making data.
Yield prediction
Feature flag yield_prediction → enabled: true.
How it works:
After 2+ complete harvest seasons are recorded in a Conduit, the backend can generate a yield prediction for the upcoming season
Inputs: historical harvest weights, crop type, satellite NDVI trend for current season, rainfall data from satellite layer, commodity price trend from commodity_prices
Prediction generated via Anthropic API — structured prompt with all inputs, response constrained to JSON: { predicted_yield_tonnes, confidence_interval_low, confidence_interval_high, key_factors }
Stored in yield_predictions
Displayed on Conduit dashboard as "Projected Harvest" card: "Based on current conditions and historical data, we project X–Y tonnes this season."
Disclaimer: "Yield predictions are AI-generated estimates based on available data. They are not guarantees and should not be used as the sole basis for financial decisions."
Trigger: Yield prediction job runs every Sunday alongside the satellite report — only for Conduits with 2+ complete harvest cycles in harvest_records.
Carbon credit tracking
Feature flag carbon_credits → enabled: false, coming_soon: true initially. Activated mid-Milestone 4 once schema and basic tracking are confirmed working.
Phase 1 (Milestone 4): Tracking only. No marketplace, no selling.
Land Owner can manually log carbon credit information on a Conduit: credit type, CO2 equivalent tonnes, verification standard (Verra VCS, Gold Standard, etc.), registry ID
Stored in carbon_credits
Displayed on Conduit detail screen as "Carbon Credits" card
Status: unverified → pending → verified (manual update by Land Owner)
Phase 2 (Post-Section 3 / future): Integration with carbon credit registries and marketplaces. Marked as roadmap item in admin panel.
Insurance integration
Feature flag insurance_integration → enabled: false, coming_soon: true initially. Activated mid-Milestone 4.
Phase 1 (Milestone 4): Policy tracking only. AgroLease does not sell insurance.
Either party can link an existing insurance policy to a Conduit: provider name, policy number, type, coverage dates, coverage amount, premium
Stored in insurance_policies
Displayed on Conduit detail screen
When a dispute is raised: insurance policy details shown alongside dispute evidence (relevant if the dispute involves a weather event covered by the policy)
Claim filing: user can mark claim_filed_at and claim_amount_usd — this is a record, not a filing mechanism
Advanced analytics dashboard (admin)
The admin panel gains a full analytics section powered by analytics_events and platform data. Accessible to super_admin only.
Metrics surfaces:
Dashboard
What it shows
Growth
New Conduits per week/month by country, active vs churned Conduits
Revenue
USD revenue by country, by feature (base/satellite/legal), by enterprise vs individual
Engagement
DAU/WAU/MAU, most-used features, Coming Soon tap counts (roadmap signal)
Operations
Scraper success rates, satellite bot coverage, payment success rates by provider
Trust
Average Trust Score distribution, dispute rate by country, resolution rate
Discovery
Listing creation rate, contact rate, listing-to-Conduit conversion rate
Satellite
Active satellite Conduits, anomaly detection rate, Planet Labs vs Standard split
AI
AI boundary acceptance rate, crop stress alert rate, yield prediction accuracy (vs actual harvest)

All charts use existing analytics_events data — no new tracking required. Queries against analytics_events are read-only, indexed by event_name and created_at.
Backend routes — Milestone 4
GET    /v1/conduits/:id/yield-prediction
GET    /v1/conduits/:id/carbon-credits
POST   /v1/conduits/:id/carbon-credits
PUT    /v1/conduits/:id/carbon-credits/:creditId
GET    /v1/conduits/:id/insurance
POST   /v1/conduits/:id/insurance
PUT    /v1/conduits/:id/insurance/:policyId
GET    /v1/admin/analytics/growth
GET    /v1/admin/analytics/revenue
GET    /v1/admin/analytics/engagement
GET    /v1/admin/analytics/operations
GET    /v1/admin/analytics/trust
GET    /v1/admin/analytics/discovery
GET    /v1/admin/analytics/satellite
GET    /v1/admin/analytics/ai

Milestone 4 tests
Conduit with 2+ complete harvest seasons: yield prediction job runs Sunday, prediction stored, displayed on dashboard
Yield prediction disclaimer visible and unskippable
Create carbon credit record — appears on Conduit detail, status update confirmed
Link insurance policy to Conduit — policy shown on dispute screen when dispute raised
Admin analytics dashboard: growth chart shows correct new Conduit count for last 30 days
Revenue chart: Uganda Conduits show UGX converted to USD correctly
Engagement: Coming Soon tap counts match analytics_events data
AI yield accuracy: for Conduits with historical predictions + actual harvests, comparison visible in admin AI analytics panel

MILESTONE 5 — INFRASTRUCTURE SCALING (v2.4)
Outcome: AgroLease infrastructure is production-hardened for tens of thousands of concurrent users across 26+ countries. Multi-region deployment reduces latency for Africa and Asia. CDN serves satellite imagery globally. Load testing confirms capacity before each major market launch.
Multi-region deployment
Current state (end of Section 2): Single Railway region (US East or EU West). Single Supabase project (one region). Acceptable for Nigeria and Africa. Unacceptable latency for India, Indonesia, and Australia.
Section 3 approach:
Supabase read replicas:
Enable Supabase read replica in Singapore region (covers India, Indonesia, Australia with ~50ms latency vs ~300ms from US)
Read replicas handle: GET requests for harvest records, invoices, notifications, satellite reports, commodity prices
All writes continue to primary US/EU Supabase instance
Connection routing: Fastify service determines read vs write operation and routes to replica or primary accordingly
Railway multi-region:
Deploy a second Fastify API instance to Railway Singapore region
GET /v1/app-config and all read-heavy endpoints served from nearest region
Write endpoints always route to primary region
DNS-based routing (Cloudflare Load Balancer or Railway's built-in routing) directs users to nearest API instance
Bot services remain single-region: Scraper and satellite bots do not need multi-region — they write to primary Supabase. No change required.
CDN for satellite imagery
Satellite NDVI maps and Planet Labs images are currently served via Supabase Storage signed URLs (generated per request, 1-hour expiry). At scale, this generates excessive Supabase Storage egress costs and adds latency for users far from the Supabase region.
Section 3 approach:
Configure Cloudflare CDN in front of Supabase Storage
Satellite images are publicly cacheable (they never change after creation) — cache at Cloudflare edge with 30-day TTL
Signed URLs replaced with Cloudflare-proxied URLs for satellite imagery only (not for truck photos or legal export ZIPs — those remain private signed URLs)
Image serving latency: from ~500ms (Supabase direct) to ~30ms (Cloudflare edge cache hit)
Redis cluster (BullMQ at scale)
Current: single Railway Redis instance. Acceptable to ~10,000 active jobs/day.
At Section 3 scale (26+ countries, satellite bot processing hundreds of Conduits, scraper running 26 country jobs nightly): upgrade to Redis Cluster or Railway's managed Redis with persistence enabled.
BullMQ worker concurrency tuned per queue: notifications (concurrency 50), satellite (concurrency 10 — rate-limited by Sentinel-2 API), scraper (concurrency 5 per country group)
Dead letter queue: jobs that exceed max_attempts move to a dead letter queue visible in admin panel
Queue depth alerting: alert fires when any queue exceeds 500 pending jobs (already required by Constitution metrics rules)
Load testing protocol
Before activating any new country with an expected user base > 10,000, run the following load test sequence against staging:
Baseline test: 100 concurrent users, standard Conduit operations (create, log harvest, approve invoice) — confirm p99 < 500ms
Scraper concurrency test: all 26 country scraper jobs running simultaneously — confirm no DB connection exhaustion
Satellite bot test: 500 Conduits with satellite active, Saturday bot run simulated — confirm all jobs complete within 4-hour window
Payment spike test: 200 concurrent Paystack/Stripe payment initializations — confirm idempotency keys prevent duplicates, p99 < 2s
Legal export concurrency test: 50 simultaneous export generation jobs — confirm queue handles load, no memory exhaustion on worker
Document test results. Fix any failure before activating the market. Load test results stored in operational runbook.
Database maintenance procedures
With audit_events and analytics_events growing into tens of millions of rows, establish archival and partitioning:
Table partitioning: Partition audit_events, analytics_events, and notifications by month using PostgreSQL declarative partitioning (PARTITION BY RANGE (created_at)). New partition created automatically each month via cron.
Cold archival: Partitions older than 24 months moved to Supabase cold storage (or AWS S3 via pg_dump per partition). Accessible for legal/compliance retrieval but not live queries.
Commodity prices archival: commodity_prices rows older than 5 years archived. Recent 5 years always queryable live.
Notification cleanup: notifications WHERE read = true AND created_at < NOW() - INTERVAL '90 days'soft-deleted in weekly batch job.
Backend routes — Milestone 5
No new user-facing routes. Infrastructure only. Admin additions:
GET    /v1/admin/infrastructure/queue-depths    — all BullMQ queue depths
GET    /v1/admin/infrastructure/dead-letter     — failed jobs awaiting review
POST   /v1/admin/infrastructure/dead-letter/:id/retry
GET    /v1/admin/infrastructure/load-test-results

Milestone 5 tests
Singapore API instance: request from Sydney Australia → response served from Singapore < 150ms
Singapore read replica: GET /v1/conduits/:id/records routes to replica (confirm via query log)
Satellite image served via Cloudflare CDN — cache hit on second request, latency < 50ms
Redis cluster: 1,000 notification jobs enqueued simultaneously — all processed within 60 seconds, no job loss
Dead letter queue: manually fail a satellite job 3 times — appears in dead letter queue in admin panel
Retry from dead letter queue — job processes successfully
audit_events monthly partitioning: insert rows with dates spanning 3 months — confirm data in correct partitions
Load test (baseline): 100 concurrent users, p99 < 500ms confirmed
Load test (scraper): 26 country jobs simultaneous — all complete, no connection exhaustion

END-TO-END TEST — SECTION 3
Run complete global scenario across 5 countries using production accounts.
Global payment coverage:
Account A (India, Maharashtra state): Create Conduit, confirm state APMC rules applied, pay via Razorpay UPI
Account B (Brazil): Accept invitation, pay via Stripe Pix
Account C (Indonesia): Create Conduit, pay via Midtrans GoPay
Account D (US): Create Conduit, pay via Stripe Apple Pay
Account E (UAE): Create Conduit, pay via PayTabs
Enterprise flow: 6. Admin: Create enterprise account (Premium plan), invite Account D and E as members 7. Link both Conduits to enterprise account — confirm Enterprise dashboard shows both 8. Enterprise overview: aggregate metrics correct, map shows both US and UAE farm boundaries
AI features: 9. Account A (India): Upload 5 photos with EXIF GPS data — AI boundary suggestion generated 10. Accept suggestion — farm boundary updated 11. Account A: Satellite active, Sunday bot run — AI Crop Stress card appears on satellite dashboard 12. Account D (US): Activate Planet Labs — high-resolution report generated after bot run 13. Account A: 8+ satellite reports exist — generate Time-Lapse — GIF plays in app
Platform intelligence: 14. Account A (2+ complete harvests): Yield prediction appears on dashboard Sunday 15. Account A: Add carbon credit record — appears on Conduit detail 16. Account A: Link insurance policy — policy shown on dispute screen
Infrastructure: 17. Request from Singapore IP address — confirm Singapore API instance serves response 18. Load satellite NDVI image — confirm Cloudflare CDN cache hit on second request
Localization: 19. Account A: switch to Hindi locale — app displays correctly in Hindi 20. Account B: switch to pt-BR — confirms different from Mozambique pt locale
Document every step result. Fix every failure before marking Section 3 complete.

SECTION 3 COMPLETION STATE
This is the final completion state. AgroLease is a global production platform. Any future work extends from this state using the same Constitution rules.
Active countries (26+)
Nigeria, Ghana, Kenya, South Africa, Ethiopia, Tanzania, Uganda, Rwanda, Zambia, Cameroon, Ivory Coast, Senegal, Mozambique, Zimbabwe, Egypt, Mali, Burkina Faso, United Kingdom, India, Brazil, Indonesia, United States, Australia, UAE, Saudi Arabia — and any additional markets activated via country_config without code changes.
Mobile
Production React Native app — all features live
Localization: en, fr, sw, am, ar, pt, pt-BR, hi, id, ar-AE
Offline-first write queue — all countries
AI Geospatial boundary detection — live
AI Crop Stress Analysis — live
Planet Labs high-resolution satellite — live
Historical Time-Lapse — live
Yield prediction card — live
Carbon credit tracking — live
Insurance policy linking — live
Enterprise dashboard tab — live for enterprise members
Apple Pay + Google Pay via Stripe — live in all Stripe countries
GET /v1/app-config as runtime source of truth — 26+ active countries returned
Backend
All Sections 1 and 2 backend features live and unchanged
India APMC state rules applied at Conduit creation and invoice generation
Provider-agnostic payment service: 9 provider modules (Paystack, Flutterwave, M-Pesa ×3, Chapa, Paymob, Paynow, Razorpay, Stripe, Midtrans, PayTabs)
Stripe Billing for enterprise subscriptions
Anthropic API integrated for AI boundary suggestion and AI Crop Stress Analysis
Planet Labs API integrated for high-resolution satellite
BullMQ queues: all Section 1+2 queues plus ai_boundary_suggest, generate_timelapse, yield_prediction, legal_export
Advanced analytics endpoints live in admin panel
Support ticket system with SLA enforcement
Infrastructure
Multi-region Railway deployment (US/EU primary + Singapore)
Supabase Singapore read replica for Asia-Pacific traffic
Cloudflare CDN serving satellite imagery globally
Redis Cluster for BullMQ at scale
audit_events and analytics_events partitioned by month
Cold archival pipeline for partitions older than 24 months
Load testing completed for all major markets
All load test results documented in operational runbook
Quarterly backup restoration tested and confirmed
Bots
Commodity Scraper: 26 countries, all grouped by UTC hour, 9 source modules
Satellite Bot: Sentinel-2 (all countries) + Planet Labs (activated Conduits)
AI Crop Stress Analysis: runs after each satellite report
Yield Prediction: runs every Sunday for eligible Conduits
Time-Lapse Generator: on-demand per user request
Exchange Rate Service: all 26+ currency pairs updated daily
Monthly partition creation: cron creates next month's audit_events, analytics_events, notifications partitions
Database
All Sections 1, 2, and 3 schema live
state_config: 28 Indian states seeded with APMC rules
enterprise_accounts, enterprise_members, enterprise_conduit_access: live
planet_labs_reports, ai_boundary_suggestions, yield_predictions: live
carbon_credits, insurance_policies, support_tickets: live
All indexes live including Section 3 additions
Table partitioning active on audit_events, analytics_events, notifications
Legal entity
AgroLease Inc. (Delaware C-Corp) — active
Mercury US bank account — active
Stripe account — KYC complete, processing US, UK, Australia, Brazil, India, Indonesia, UAE, Saudi Arabia
Registered agent in place
US, UK, and Australia tax obligations documented
Architecture rules in effect (all previous rules plus)
India Conduit creation always requires state selection — enforced at UI and API
Enterprise dashboard is read-only — no enterprise-level control over individual Conduit operations
AI-generated content (boundary suggestions, crop stress analysis, yield predictions) is always labelled as AI and carries a disclaimer — this cannot be disabled
AI boundary suggestions require user acceptance before being saved — never auto-applied
Planet Labs activation requires Sentinel-2 base layer to already be active — cannot be standalone
Satellite imagery served via Cloudflare CDN — Supabase Storage direct URLs not used for NDVI images
Table partitioning managed by cron — never by application logic
Load testing required before any new country with expected user base > 10,000 is activated

AgroLease Build Specification — Section 3 — June 2026 Read AGROLEASE_ENGINEERING_CONSTITUTION.md and confirm Section 1 and Section 2 Completion States before starting. Do not rebuild what already exists. Extend only.

