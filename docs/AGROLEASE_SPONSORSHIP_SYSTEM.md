AGROLEASE — SPONSORSHIP & ENTITLEMENT SYSTEM
Platform Overlay Document — Read Alongside the Engineering Constitution and Relevant Build Section

This document defines a platform-level capability that spans all three build sections. It is not a feature of any single section. When implementing anything related to billing, Conduit activation, or feature access, the agent must check whether this system affects the flow being built.
This system is designed around the concept of a Sponsor — never around any specific named organisation. No sponsor name, no real-world organisation name, and no country-specific association name ever appears in application code.

PURPOSE
The Sponsorship & Entitlement System allows any approved organisation to cover AgroLease platform access for a defined group of users, for a defined period, without changing normal platform behaviour.
The sponsorship layer only affects billing and feature entitlement. It never affects identity, permissions, ownership, Trust Score, Conduits, or the relationship between platform users.
Everything is configuration-driven. Adding a new sponsor, defining a new entitlement, onboarding a new group of members, or introducing a new access model requires zero application code changes.

THE ENTITLEMENT ENGINE
The Entitlement Engine is a core platform service — not a feature of the sponsorship system alone. Every premium feature in AgroLease asks one question before rendering a payment wall or activating access:
"Does this profile currently have access to this feature?"
The engine evaluates all possible access sources in priority order and returns a single structured decision. No feature implements its own access logic. All access decisions route through this engine.
Decision responses
Decision
Meaning
ALLOW
Access granted. Feature is active via a confirmed payment.
SPONSORED
Access granted. An active entitlement covers this feature. No payment required.
ENTERPRISE
Access granted. An active enterprise licence covers this feature.
PROMOTIONAL
Access granted. A system-level promotional grant is active.
GRACE_PERIOD
Access temporarily extended. Prior entitlement or payment has expired. Grace period is active.
EXPIRED
Access was previously granted. It has now fully lapsed. Payment or new entitlement required.
PAYMENT_REQUIRED
No prior access exists. Standard payment wall applies.
DENY
Access explicitly blocked. Reserved for admin action.

Evaluation order
The engine evaluates in this exact sequence and returns on the first match:
1. DENY check         — is this profile explicitly blocked for this feature?
2. SPONSORED check    — active sponsor_members row + active entitlement covering feature?
3. ENTERPRISE check   — active enterprise_conduit_access + enterprise plan covering feature?
4. PROMOTIONAL check  — active system-level promotional grant?
5. ALLOW check        — confirmed payment in payment_transactions for this feature + Conduit?
6. GRACE_PERIOD check — any of the above recently expired and still within grace window?
7. EXPIRED check      — any of the above previously existed but grace period also ended?
8. PAYMENT_REQUIRED   — default. No access source found.

Engine interface
// /backend/services/entitlement-engine/index.js

async function checkAccess({ profileId, feature, conduitId = null, countryCode }) {
  // Returns:
  // {
  //   decision: 'ALLOW' | 'SPONSORED' | 'ENTERPRISE' | 'PROMOTIONAL' |
  //             'GRACE_PERIOD' | 'EXPIRED' | 'PAYMENT_REQUIRED' | 'DENY',
  //   source: 'payment' | 'sponsorship' | 'enterprise' | 'promotional' | null,
  //   entitlementId: uuid | null,
  //   expiresAt: timestamptz | null,
  //   graceEndsAt: timestamptz | null,
  //   reason: string   — human-readable explanation for logging and admin display
  // }
}

Where the engine is called
Every route or UI flow that gates a premium feature calls the engine before any other logic:
Conduit payment wall render
Satellite activation flow
Legal Readiness activation flow
Planet Labs activation flow (Section 3)
Enterprise dashboard access (Section 3)
Any future premium feature
The engine result determines what the user sees:
ALLOW, SPONSORED, ENTERPRISE, PROMOTIONAL → feature active, no wall shown
GRACE_PERIOD → feature active, persistent banner shown with days remaining
EXPIRED → feature locked, specific expired-access screen shown
PAYMENT_REQUIRED → standard payment wall for the user's country and provider
DENY → access blocked screen
Engine is the single source of truth
No feature in any build section implements its own access decision logic. If a future feature requires a new access model (free trial, marketplace bundle, government mandate), a new evaluation step is added to the engine — not to the feature's route handler.

CORE CONCEPTS
Sponsor
A Sponsor is any organisation approved by AgroLease to administer an entitlement programme for a group of users.
A Sponsor administers. A Sponsor does not necessarily fund. These are separate concepts (see Funding Source below).
The platform contains no logic specific to any sponsor type. The following are equal in the system — differing only in configuration:
Farmer associations and cooperatives
NGOs and development agencies
Commodity boards and trading companies
Government bodies and ministries
Foundations and international development organisations
Commercial buyers covering their contract growers
Universities and research institutions
AgroLease itself (for promotional access)
Funding Source
The Funding Source is the entity that bears the commercial cost of an entitlement. This is separate from the Sponsor that administers it.
Examples:
A government body sponsors access. A donor agency funds it.
An NGO administers the programme. An agribusiness pays.
AgroLease grants promotional access. AgroLease itself is the funding source.
A sponsor and its funder are the same entity — the most common case.
Funding Source is recorded on every entitlement row for internal accounting and reporting. It never affects user-facing behaviour.
Entitlement
An Entitlement is the specific access grant created by a Sponsor. It defines which features are covered, for whom, for how long, and under what conditions.
One Sponsor may have many Entitlements — for example, a pilot programme entitlement and a full-access entitlement for a different cohort, both under the same Sponsor record.

DATABASE SCHEMA
sponsors
id (uuid), sponsor_id (text — e.g. SPO-000001),
display_name (text),
sponsor_type (text — association | cooperative | ngo | government |
  enterprise | foundation | university | promotional | other),
country_code (FK country_config, nullable — null = global sponsor),
contact_name (text), contact_email (text), contact_phone (text, nullable),
status (active | paused | expired | terminated),
agreement_start (date), agreement_end (date, nullable),
notes (text, nullable),
created_by (FK profiles),
created_at, updated_at

entitlements
id (uuid), entitlement_id (text — e.g. ENT-000001),
sponsor_id (FK sponsors),

-- Billing responsibility
funding_source_name (text, nullable),
funding_source_type (text, nullable — sponsor | donor | agrolease | government | other),
funding_source_contact (text, nullable),
funding_notes (text, nullable),

-- What is covered
covered_features (jsonb array — conduit | satellite | legal_readiness |
  planet_labs | enterprise | all),

-- Scope (all nullable — null means no restriction on that dimension)
scope (jsonb, nullable),
-- scope shape:
-- {
--   "countries": ["NG", "GH"],       -- null = all countries
--   "regions": ["Kaduna", "Kano"],   -- null = all regions
--   "crops": ["maize", "cassava"],   -- null = all crops
--   "user_roles": ["land_owner"]     -- null = all roles
-- }

-- Priority and conflict resolution
priority (int, default 0),
-- Higher number wins. Tie-breaking: longest remaining duration, then newest entitlement.

-- Duration
duration_months (int, nullable — null = use fixed_end_date),
fixed_end_date (date, nullable),
grace_period_days (int, default 30),
renewal_behaviour (expire | notify_and_expire | auto_renew),

-- Limits
max_members (int, nullable — null = unlimited),

-- Verification
verification_providers (jsonb array — see Verification Providers section),

-- Status
status (active | paused | expired),
version (int, default 1),
notes (text, nullable),
created_at, updated_at

entitlement_revisions
id (uuid), entitlement_id (FK entitlements),
version (int),
snapshot (jsonb — full copy of entitlement row at this version),
changed_by (FK profiles),
change_reason (text, nullable),
created_at

Immutable. Every time an entitlement is modified, the current state is written here before the update is applied. When a sponsored user activated a feature, the engine records which entitlement_id and which version was active at that moment in sponsor_activations. Historical queries reconstruct exactly what the user was entitled to at any past point.
sponsor_members
id (uuid), sponsor_id (FK sponsors),
entitlement_id (FK entitlements),
entitlement_version_at_enrollment (int),
profile_id (FK profiles, nullable),
verification_provider (text),
verified_identifier (text),
status (pending | active | grace_period | expired | converted | removed),
activated_at (timestamptz, nullable),
expires_at (timestamptz, nullable),
grace_period_ends_at (timestamptz, nullable),
converted_to_paid_at (timestamptz, nullable),
created_at, updated_at

sponsor_activations
id (uuid), sponsor_id (FK sponsors),
entitlement_id (FK entitlements),
entitlement_version (int),
member_id (FK sponsor_members),
profile_id (FK profiles),
conduit_id (FK conduits, nullable),
feature_activated (text),
original_price_usd (decimal),
covered_amount_usd (decimal),
currency_code (text),
original_price_local (decimal),
funding_source_name (text, denormalized from entitlement at activation time),
activation_date (timestamptz),
expiry_date (timestamptz),
engine_decision (text — SPONSORED | PROMOTIONAL | ENTERPRISE),
created_at

Append-only. Never deleted. Never soft-deleted. One row per feature activation per sponsored user. Records the entitlement version active at the time so historical reconstruction is always possible.
entitlement_access_denials
id (uuid), profile_id (FK profiles),
feature (text), conduit_id (FK conduits, nullable),
reason (text), denied_by (FK profiles),
active (boolean, default true),
created_at, updated_at

Explicit blocks set by admin. Checked first by the Entitlement Engine (DENY decision). Used for abuse cases, fraud, or compliance holds.
sponsor_invite_codes
id (uuid), sponsor_id (FK sponsors),
entitlement_id (FK entitlements),
code (text, unique),
max_uses (int, nullable),
uses_count (int, default 0),
expires_at (timestamptz, nullable),
active (boolean, default true),
created_by (FK profiles),
created_at

sponsor_phone_whitelist
id, sponsor_id (FK sponsors), entitlement_id (FK entitlements),
phone (text), claimed (boolean, default false),
claimed_by (FK profiles, nullable), claimed_at (timestamptz, nullable),
created_at

sponsor_email_domains
id, sponsor_id (FK sponsors), entitlement_id (FK entitlements),
domain (text), active (boolean, default true), created_at

Indexes
CREATE INDEX idx_sponsor_members_profile ON sponsor_members(profile_id);
CREATE INDEX idx_sponsor_members_entitlement ON sponsor_members(entitlement_id);
CREATE INDEX idx_sponsor_members_status ON sponsor_members(status);
CREATE INDEX idx_sponsor_activations_profile ON sponsor_activations(profile_id);
CREATE INDEX idx_sponsor_activations_conduit ON sponsor_activations(conduit_id);
CREATE INDEX idx_sponsor_activations_entitlement ON sponsor_activations(entitlement_id);
CREATE INDEX idx_entitlement_revisions_entitlement ON entitlement_revisions(entitlement_id, version DESC);
CREATE INDEX idx_sponsor_invite_codes_code ON sponsor_invite_codes(code);
CREATE INDEX idx_sponsor_phone_whitelist_phone ON sponsor_phone_whitelist(phone);
CREATE INDEX idx_entitlement_access_denials_profile ON entitlement_access_denials(profile_id);


ENTITLEMENT PRIORITY
A user may have active entitlements from multiple sponsors simultaneously. The Entitlement Engine selects the winning entitlement for each feature using this tie-breaking sequence:
priority value — higher integer wins. Sponsors granting a higher priority entitlement take precedence. Default is 0.
Longest remaining duration — if priority is equal, the entitlement with the furthest expires_at wins.
Newest entitlement — if duration is also equal, the most recently created entitlement wins.
The engine applies the winning entitlement per feature independently. A user could receive Conduit access from Entitlement A (priority 5) and Satellite access from Entitlement B (priority 3) if Entitlement A does not cover Satellite.
Entitlements combine in favour of the user — they never restrict each other.

SPONSORSHIP SCOPE
Each entitlement carries an optional scope object. When scope fields are present, the Entitlement Engine only grants the SPONSORED decision if the activation request falls within scope.
{
  "countries": ["NG", "GH"],
  "regions": ["Kaduna State", "Kano State"],
  "crops": ["maize", "cassava", "sorghum"],
  "user_roles": ["land_owner"]
}

Null on any field means no restriction on that dimension. An empty scope object or a null scope means the entitlement applies globally across all dimensions.
Scope is evaluated by the engine at access check time — not at member enrollment time. A user enrolled in an entitlement that is scoped to Nigeria cannot use it to activate a Conduit in Ghana even if they have an account in both countries.
Adding new scope dimensions in the future (commodity exchange, farm size bracket, certification status) requires adding a new key to the scope jsonb and updating the engine evaluation logic — not a schema change.

VERIFICATION PROVIDERS
The platform supports a defined set of verification providers. This list is explicitly extensible — new providers are added as platform capabilities, not as one-off implementations.
Current providers
Provider key
Description
invite_code
Sponsor distributes a code. User redeems via POST /v1/sponsorship/redeem.
csv_import
Admin uploads CSV of phone numbers or emails. Matched on sign-in.
phone_whitelist
Admin adds phones one at a time. Matched on sign-in.
email_domain
Any sign-up matching the domain is auto-enrolled.
admin_assignment
Super_admin directly links a profile_id to the entitlement.
api
Sponsor's system calls POST /v1/sponsors/members/provision with a sponsor API key.

Future providers (architecture ready, not yet implemented)
Provider key
Description
government_registry
Match against an external government farmer registry API.
qr_voucher
Physical QR code distributed at events — single-use redemption.
nfc_card
NFC tap redemption at field terminals.
biometric
Match against a biometric identity provider.

Adding a new provider requires: a new provider module in /backend/services/sponsorship/verification/, a new case in the verification dispatch service, and a new key in the verification_providers jsonb on the entitlement row. No schema change required.
The entitlements.verification_providers field is a jsonb array of objects:
[
  { "provider": "invite_code", "config": { "code_prefix": "PILOT" } },
  { "provider": "phone_whitelist", "config": {} }
]

One entitlement may use multiple verification providers simultaneously.

BILLING BEHAVIOUR
When the Entitlement Engine returns SPONSORED, ENTERPRISE, or PROMOTIONAL:
The normal payment wall is not shown
OR a zero-cost confirmation screen is shown with the message: "Your access to [Feature] is covered. No payment required."
A sponsor_activations row is written immediately
The feature activates
The engine decision and source are recorded
When the engine returns PAYMENT_REQUIRED:
The standard regional payment wall is shown
The user pays via their country's configured payment provider
On payment confirmation: payment_transactions row created, feature activated
The user never sees both a payment wall and a sponsorship notice. The engine decides before any UI renders.

FUNDING SOURCE & INTERNAL ACCOUNTING
Every entitlement row records who bears the commercial cost:
funding_source_name:    "Global Agriculture Foundation"
funding_source_type:    "donor"
funding_source_contact: "grants@globalagfoundation.org"
funding_notes:          "Grant ref GAF-2026-NG-001. Covers 500 Conduit activations."

Every sponsor_activations row denormalizes the funding_source_name at activation time so historical reports correctly attribute cost to the funder who was responsible at that moment — even if the entitlement's funding source is later updated.
The platform does not invoice sponsors or funding sources. Commercial billing is an external arrangement. The platform provides the accounting data for that arrangement — not the transaction itself.

ENTITLEMENT REVISION HISTORY
Every modification to an entitlement is preceded by writing the current state to entitlement_revisions:
BEFORE UPDATE on entitlements:
  1. Write current row snapshot to entitlement_revisions with current version number
  2. Increment entitlements.version
  3. Apply the update

This is enforced by a database trigger — not by application code. No update path can bypass it.
The sponsor_activations table records entitlement_version at the time of each activation. A historical query can always reconstruct exactly what a user was entitled to when they activated a feature:
SELECT er.snapshot
FROM sponsor_activations sa
JOIN entitlement_revisions er
  ON er.entitlement_id = sa.entitlement_id
  AND er.version = sa.entitlement_version
WHERE sa.profile_id = :profileId
  AND sa.feature_activated = 'conduit'
ORDER BY sa.activation_date DESC
LIMIT 1;


EXPIRY BEHAVIOUR
Notification schedule (configurable per entitlement, these are defaults)
Timing
Action
30 days before expiry
First reminder — push + email
14 days before expiry
Second reminder
7 days before expiry
Daily reminder begins
1 day before expiry
Final warning
Day of expiry
Grace period begins — sponsor_members.status → grace_period
Grace period ends
Feature locked — sponsor_members.status → expired

During the grace period, the feature remains active. A persistent in-app banner shows: "Your sponsored access expires in [N] days. Add a payment method to continue without interruption."
After the grace period ends, the Entitlement Engine returns EXPIRED for this user and feature. The feature locks. The user sees an expired-access screen with a clear path to pay.
Renewal behaviour
Setting
Behaviour
expire
No action at expiry. User must initiate payment after grace period.
notify_and_expire
Admin is notified 30 days before expiry. Manual renewal possible.
auto_renew
Entitlement extends by duration_months if sponsor agreement_end is still in the future.


CONVERSION TO PAID
A sponsored user may convert to paid access at any time — before, during, or after grace period. Conversion is initiated from the app: "Continue with your own subscription."
On conversion:
sponsor_members.status → converted
sponsor_members.converted_to_paid_at → now
Entitlement Engine returns PAYMENT_REQUIRED for the feature going forward
Standard payment wall presented
On payment: feature continues uninterrupted
Everything is preserved across conversion:
Profile and Profile ID
All Conduits and their statuses
All harvest records, invoices, disputes, messages
Agreements and change logs
Trust Score and all contributing events
Satellite history and NDVI reports
Legal Readiness subscription and export history
Full audit event log
sponsor_activations history — the record of prior sponsorship is permanent
Only the billing source changes. The Entitlement Engine now evaluates the payment path instead of the sponsorship path.

ISOLATION GUARANTEE
Sponsorship is invisible to everyone except the sponsored user and AgroLease administrators.
Never affected by sponsorship:
Profile ID and display name
Role and RBAC permissions
Conduit ownership and partner relationship
What the Farm Operator sees on their dashboard
Trust Score calculation and history
Audit event behaviour
Evidence rating on harvest records
Never exposed to any non-admin user:
Whether a Conduit or feature is sponsored
Which sponsor covered the access
The duration, terms, or funding source of the sponsorship
The entitlement version or priority
A Farm Operator entering a Conduit with a sponsored Land Owner sees an experience identical to any other Conduit. This is not configurable — it is a permanent isolation rule enforced in the Entitlement Engine response: the source field is never exposed to client applications, only to admin-facing services.

AUDIT
Every sponsorship event is written to the existing audit_events table.
Event Type
Trigger
sponsor_created
New sponsor record created
entitlement_created
New entitlement added
entitlement_updated
Entitlement modified (revision written first)
member_enrolled
User linked to entitlement
sponsored_feature_activated
Entitlement Engine returned SPONSORED, feature activated
entitlement_expiry_reminder_sent
Reminder notification dispatched
entitlement_grace_period_started
Grace period begun
entitlement_expired
Grace period ended, feature locked
entitlement_renewed
Entitlement extended
member_converted
Sponsored user converted to paid
member_removed
Member removed from entitlement
sponsor_paused
Sponsor status set to paused
sponsor_terminated
Sponsor terminated, grace periods initiated
access_denied
Engine returned DENY
entitlement_access_denial_set
Admin placed explicit block on a profile

All events include: actor_id, sponsor_id, entitlement_id, profile_id of affected user where applicable, engine decision where relevant.

BACKGROUND JOBS
The following jobs are added to the BullMQ sponsorship queue. All run on schedule via Railway cron. All are async — no sponsorship state change runs synchronously inside an HTTP request.
Job
Schedule
What it does
sponsorship_expiry_reminders
Daily 06:00 UTC
Finds all sponsor_members expiring within reminder windows. Enqueues notifications for each.
sponsorship_grace_period_transition
Daily 07:00 UTC
Finds all sponsor_members where expires_at < now and status = active. Sets status: grace_period, sets grace_period_ends_at. Enqueues day-of notification.
sponsorship_expiry_enforcement
Daily 08:00 UTC
Finds all sponsor_members where grace_period_ends_at < nowand status = grace_period. Sets status: expired. Enqueues final notification. Writes audit_events.
sponsorship_auto_renew
Daily 09:00 UTC
Finds entitlements with renewal_behaviour: auto_renewexpiring in 7 days. Checks sponsor agreement_end. Extends if valid. Writes revision. Notifies admin.
sponsor_agreement_expiry_check
Daily 10:00 UTC
Finds sponsors where agreement_end < now + 30 days. Notifies admin. Finds sponsors where agreement_end < now. Sets sponsor status: expired. Pauses all active entitlements.
sponsorship_usage_stats
Weekly Sunday 02:00 UTC
Aggregates sponsor_activations per sponsor per entitlement. Writes summary to analytics_events for admin reporting.
orphaned_member_cleanup
Weekly Sunday 03:00 UTC
Finds sponsor_members with status: pending older than 90 days where no profile_id has been linked. Soft-marks as abandoned. Notifies admin.


ADMIN PANEL — SPONSOR MANAGEMENT
Accessible to super_admin only.
Sponsor directory
List all sponsors with status, country, active entitlement count, active member count
Create new sponsor — type, country, agreement dates, contact, notes
Edit sponsor details
Pause sponsor — all active entitlements paused, grace periods not triggered
Terminate sponsor — grace periods begin for all active members immediately
Entitlement management (per sponsor)
List all entitlements with version, priority, member count, activation count, expiry schedule
Create entitlement — feature picker, scope config, priority, duration, grace period, renewal, funding source, max members, verification providers
Edit entitlement — revision written automatically before save
View revision history — full version timeline with diff between versions
Pause or expire entitlement independently of sponsor status
Generate invite codes — set max uses and expiry
Upload member CSV
Manage phone whitelist and email domains
Issue API key for programmatic provisioning
View entitlement_access_denials — set and remove explicit blocks per profile
Entitlement Engine inspector
Admin tool for debugging access decisions. Input: profileId + feature + optional conduitId. Output: full engine evaluation trace — which step matched, which entitlement won, why, what the decision was. Used by support staff to diagnose access issues without guessing.
Reporting
Report
Description
Active sponsored users
All profiles with a currently active entitlement
Sponsored Conduits
All Conduits activated under sponsorship
Feature usage by sponsor
Conduit, Satellite, Legal Readiness activations per sponsor
Funding source breakdown
Cost attribution per funding source
Activation history
Full timeline per sponsor or entitlement
Expiry schedule
All entitlements expiring in next 30, 60, 90 days
Conversion rate
Sponsored users who converted to paid, per entitlement
Adoption metrics
Invite code redemption rate, time-to-activation, verification method distribution
Engine decision log
All Entitlement Engine decisions for a given profile or sponsor over a date range

All reports exportable as CSV.

BACKEND ROUTES
-- Entitlement Engine (internal service — not a public route)
-- Called by all feature activation flows, not by clients directly

-- Sponsor management (super_admin only)
POST   /v1/admin/sponsors
GET    /v1/admin/sponsors
GET    /v1/admin/sponsors/:id
PUT    /v1/admin/sponsors/:id
POST   /v1/admin/sponsors/:id/pause
POST   /v1/admin/sponsors/:id/terminate

-- Entitlement management (super_admin only)
POST   /v1/admin/sponsors/:id/entitlements
GET    /v1/admin/sponsors/:id/entitlements
GET    /v1/admin/entitlements/:id
PUT    /v1/admin/entitlements/:id              — triggers revision write before update
GET    /v1/admin/entitlements/:id/revisions    — full version history
POST   /v1/admin/entitlements/:id/pause

-- Member management (super_admin only)
POST   /v1/admin/entitlements/:id/members/assign
POST   /v1/admin/entitlements/:id/members/csv-import
POST   /v1/admin/entitlements/:id/members/remove
GET    /v1/admin/entitlements/:id/members

-- Access denials (super_admin only)
POST   /v1/admin/access-denials
DELETE /v1/admin/access-denials/:id

-- Invite codes (super_admin only)
POST   /v1/admin/entitlements/:id/invite-codes
GET    /v1/admin/entitlements/:id/invite-codes
DELETE /v1/admin/invite-codes/:codeId

-- Engine inspector (super_admin only)
GET    /v1/admin/entitlement-engine/check      — debug access decision for any profile+feature

-- API provisioning (sponsor API key auth)
POST   /v1/sponsors/members/provision
DELETE /v1/sponsors/members/:profileId/deprovision

-- User-facing (authenticated user)
POST   /v1/sponsorship/redeem                  — user enters invite code
GET    /v1/sponsorship/status                  — user's active entitlements (no sponsor names exposed)
POST   /v1/sponsorship/convert                 — user initiates conversion to paid

-- Reporting (super_admin only)
GET    /v1/admin/reports/sponsored-users
GET    /v1/admin/reports/sponsored-conduits
GET    /v1/admin/reports/sponsor-usage/:sponsorId
GET    /v1/admin/reports/funding-source-breakdown
GET    /v1/admin/reports/expiry-schedule
GET    /v1/admin/reports/conversion-rate
GET    /v1/admin/reports/engine-decisions


IMPLEMENTATION PLACEMENT
Section 1
Full schema migration (all tables above)
Entitlement Engine service — core evaluation logic, all decision types
entitlement_revisions DB trigger
sponsored_feature_activated billing intercept in payment flow
Invite code verification provider
Admin assignment verification provider
Admin panel: sponsor directory, entitlement management, engine inspector
GET /v1/sponsorship/status, POST /v1/sponsorship/redeem
BullMQ sponsorship queue — all 7 scheduled jobs registered (run in staging, activated in production when first sponsor is onboarded)
Section 2
CSV import verification provider
Phone whitelist verification provider
Email domain verification provider
Bulk member management in admin panel
Funding source reporting
Section 3
API provisioning verification provider
POST /v1/sponsors/members/provision endpoint
Sponsor API key issuance in admin panel
ENTERPRISE decision path fully wired as enterprise accounts go live
PROMOTIONAL decision path wired for future AgroLease-issued promotional grants
The feature flag sponsorship is enabled: true from Section 1. It is never Coming Soon.

PERMANENT RULES
These rules apply for the lifetime of the platform and cannot be overridden by any build section or any agent instruction.
All feature access decisions route through the Entitlement Engine. No feature implements its own access logic. No route handler contains an inline access check. One engine, one decision, one source of truth.
Sponsorship changes billing only. It never changes role, permissions, ownership, Trust Score, audit behaviour, or what partners see.
No sponsor name, real-world organisation name, or country-specific association name ever appears in application code. Sponsors are records. The system handles all of them identically.
The isolation guarantee is non-negotiable. The source field from the engine decision is never exposed to client applications. Other users cannot determine whether a Conduit or feature is sponsored.
sponsor_activations is append-only and permanent. Never deleted. Never soft-deleted. Every sponsored activation is recorded forever.
Every entitlement modification triggers a revision write before the update is applied. The DB trigger enforces this. No update path bypasses it.
The entitlement_version is recorded on every sponsor_activations row. Historical reconstruction of what any user was entitled to at any past moment is always possible.
Adding a new sponsor, entitlement, verification provider, or access model requires zero application code changes — only configuration and provider modules.
Historical data is never deleted on entitlement expiry or sponsor termination. The platform retains all records. Only access changes.
All sponsorship lifecycle transitions run through background jobs — never synchronously inside HTTP requests. This is consistent with the Constitution's rule on async processing.

AgroLease Sponsorship & Entitlement System — June 2026 Attach this document to any build session where payment flows, Conduit activation, feature access, or the Entitlement Engine are being implemented or modified.

