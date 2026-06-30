AGROLEASE
Agricultural Land Management & Harvest Settlement Platform
PRODUCT PLAN  —  VERSION 10.0


Phase 1
Nigeria
Launch Market
Phase 2–4
Ghana · Kenya · South Africa
Africa Expansion
Phase 5–9
India · Brazil · Indonesia · UK · US
Global Scale


This document reflects all decisions made as of Version 9.0. It supersedes V9.0 entirely.

01
PURPOSE — Why AgroLease Exists


AgroLease is a relationship management platform for agricultural partnerships. Whether the relationship is a lease, farm management agreement, contract farming arrangement, or another operational partnership, every collaboration is formalized and managed through a Conduit. Without a system, Farm Operators can misreport harvests, delay payments, and change agreed terms without notice. This platform closes those gaps entirely.

The goal is to bring the land owner's operational stress to near zero. Everything that can be automated will be, while keeping humans in control of the decisions that matter: price negotiation, rule agreements, and payment approvals.

Target Users
Land Owners — individuals or entities who own large parcels of land and lease them to agricultural companies, earning a percentage of each harvest's market value.
Tenants — agricultural corporations (e.g. Dangote, Nestlé subsidiaries, large-scale farming companies, cooperatives, and contract farming teams) that operate agricultural land and export produce.

The Core Problem
Land disputes are endemic across every target market. In Nigeria alone, land disputes account for over 30% of all cases in courts annually. Communities have staged public protests against major corporations over unpaid land entitlements. In India, the same problem manifests as corporate side-selling, underreported harvest weights, and mid-season price manipulation — with disputes taking years or decades in civil courts. AgroLease provides a structured evidence and record system that helps prevent disputes before they reach arbitration or court.

02
THE CONDUIT — Core Unit of AgroLease


A Conduit is the fundamental unit of AgroLease. Every feature in the platform exists inside or around a Conduit. Every Conduit receives a permanent system-generated ID at creation that never changes, even if the land reference is renamed later.

What a Conduit Is
One land owner + one farm operator + one piece of land = one Conduit.
Every Conduit receives a permanent ID at creation. Example: CON-NG-000184. Every export, invoice, dispute, and support request references this ID alongside the land label.
A land owner with 3 different tenants on 3 different parcels has 3 Conduits. Each is a completely isolated environment.
Nothing bleeds between Conduits. Records, agreements, security staff, invoices, and disputes all belong to their specific Conduit.
One Conduit costs $250/year. A land owner buys as many Conduits as they have active lease relationships.


Identity Layer vs. Relationship Layer
The platform maintains a strict architectural separation between who an entity is and the specific operational leases they manage.

Profile ID — Every account receives a unique, customizable Profile ID. For businesses: dangote, nestle-agri, johnfarms. For smallholder farmers without a domain, the platform assigns a baseline handle (e.g. user1234) which can be edited anytime. This is their permanent address on the network.
Conduit ID — A Conduit ID never represents a business. It exclusively identifies one specific land owner-farm operator relationship tied to one piece of land. CON-NG-000184 is not Dangote's ID. It is the ID of the relationship between Dangote and a specific land owner on a specific parcel.

Conduit Land Label
During Conduit setup the land owner fills in fields that physically identify the land. The Land Label is human-readable and appears on every document. The Farm Boundary is technical data used by the Satellite layer — kept separate to preserve clean architecture.

Field
Example
Land Name / Reference
Kaduna North Block A
Size
50,000 hectares
Location
Kaduna State, Nigeria


Farm Boundary is a separate field used exclusively by the Satellite & Weather layer. Options: drop a pin, enter GPS coordinates, or draw a polygon boundary. Required only when the Satellite add-on is activated.

The Land Label and Conduit ID appear automatically on every harvest record, invoice, dispute log, and compliance export generated inside this Conduit.

What Lives Inside a Conduit
Element
Description
Conduit ID
Permanent system-generated identifier — e.g. CON-NG-000184. Never changes.
Land Label
Name, hectares, and location — set at creation, appears on all records
Farm Boundary
GPS coordinates or polygon — used by Satellite layer only, optional otherwise
Agreement
Percentage, payment deadlines, late fee rules, overwrite fee — all at Conduit level
Harvest Records
Every truck in and out, with full tamper-evident audit trail
Invoices
Generated per harvest, negotiated and approved inside the Conduit
Security Officers
Assigned per Conduit — a guard at Farm A never logs for Farm B
Dispute Panel
Formal dispute workflow tied to specific records within the Conduit
Trust Score
Live behavioural rating updated by verified platform events
Notifications
All alerts scoped to the Conduit they belong to


Example — One Land Owner, Two Conduits


Conduit A
Conduit B
Conduit ID
CON-NG-000184
CON-NG-000185
Land Label
Kaduna North Block A — 50,000 ha
Oyo South Block C — 12,000 ha
Farm Operator
Dangote Farms
Nestlé Agri
Agreement
25% harvest share
30% harvest share
Security Team
Musa, John, Aliu
Emeka, Tunde
Annual Cost
$250 base
$250 base


03
PLATFORM PRICING


AgroLease has one base product and two optional add-on layers. No tiers, no hidden fees, no feature gates inside the base Conduit.

Layer Overview
Layer
Purpose
Cost
Conduit
Lease management — records, invoices, disputes, agreements, security
$250/year
Satellite & Weather
Farm visibility — crop health maps, rainfall records, anomaly alerts
$100/year
Legal Readiness
Court & audit preparedness — record maintenance and structured export
$200/year


The Conduit — $250 / Year
One Conduit = one land owner-farm operator lease relationship, fully unlocked for 12 months
Buy as many Conduits as you have active lease relationships — no cap
Minimum commitment: 6 months. Billed monthly at ~$20.83/month
A land owner needing only 6 months pays $125. A full year pays $250
AgroLease prices the software, not the harvest value. A 20-hectare land owner pays the same as a 50,000-hectare operation

Both Sides Pay — Split Billing
Both parties receive value from the Conduit. Both can contribute to the cost. The platform only cares that $250 is collected.

Either party initiates the Conduit and pays any portion — as little as $1 or the full $250.
The app generates a payment link for the remaining balance and sends it to the other party.
Once the full $250 is collected, the Conduit unlocks completely for both sides.
Until fully paid, both parties can see each other's profile but nothing else.

Satellite & Weather — $100 / Year per Conduit
Optional. The fee covers satellite imagery processing, crop health analysis, weather data integration, alert generation, and weekly report delivery. The raw imagery source (Sentinel-2, ESA Copernicus) is free. What AgroLease charges for is everything done with it. See Section 15 for full detail.

Legal Readiness — $200 / Year per Conduit
Optional. Covers continuous record maintenance and structured export capability. When a court, arbitrator, or auditor asks for documentation, you export immediately. See Section 16 for full detail.

Full Annual Cost Example — Dangote, 5 Conduits
Layer
Per Conduit
× 5 Conduits
What It Covers
Conduit
$250
$1,250
Full lease management
Satellite & Weather
$100
$500
Farm visibility & alerts
Legal Readiness
$200
$1,000
Court & audit export
Total
$550
$2,750/year
All three layers active


$2,750/year to protect a multi-million dollar agricultural operation across 5 farms. Each layer is optional.

Overwrite Fee — User Configured
Minimum floor: Overwrite_Fee_Floor — pulled from country config stack automatically
In Nigeria the floor is ₦100,000. In Ghana it pulls the Cedi equivalent. In India, Rupees. No code change needed per country.
Both parties can set the fee higher than the floor. The initiating party pays. The other party pays nothing.

Why AgroLease Does Not Touch Settlement Money
Holding third-party funds requires financial services licensing in every country. Expensive, slow, legal liability.
Corporates like Dangote or Nestlé will never pre-fund a wallet with a new startup. Removing escrow removes the single biggest corporate adoption blocker.
The value AgroLease provides is the verified record and the invoice, not payment processing. The audit trail is what protects both parties.


04
APP ARCHITECTURE — ONE APP, THREE STATES


AgroLease is a single mobile app on iOS and Android. Mobile first — always. A land owner in Lagos with a Tecno phone gets the same full access as anyone on a desktop. The browser version shows a wider layout of the same dashboard, not a separate product.

State 1 — No Account, Linked as Security Officer
Truck photo — mandatory, cannot be skipped
Gate Key entry
Weight input — manual or from connected weighbridge
Submit — fires record instantly to both parties' dashboards
No financial data, no agreement terms, no invoice amounts visible. Nothing else exists in this state.

State 2 — Logged In
Who
What They See
Land Owner
All Conduits, Conduit IDs, land labels, harvest records, invoices, agreements, security management, dispute panel, Trust Score, notifications, satellite dashboard (if activated), compliance reports
Farm Operator
All Conduits, Conduit IDs, land labels, harvest records, invoices, agreements, security management, dispute panel, Trust Score, compliance report export (if activated)


State 3 — Logged In and Linking
Link Security Officers — generate a Conduit link code and share with guards. Guards enter it without creating an account.
Create New Conduit — generates a draft Conduit ID immediately. Either party shares the ID with their prospective partner to initialize the relationship.

Full Surface Map
Who
Entry Method
What They Access
Security Officer
No account — linked via Conduit code
Gate logging only
Land Owner
Logged in
Full land owner dashboard across all Conduits
Farm Operator
Logged in
Full farm operator dashboard across all Conduits
Anyone
Browser — no login
agrolease.com/prices — public commodity prices


Conduit Dashboard Structure
The dashboard adapts based on whether the user has active relationships. This prevents discovery clutter from interfering with day-to-day operations for established users.

View
What the User Sees
Unlinked User
Create New Conduit (primary), Discover Listings, My Conduits (0 — subdued placeholder)
Established User
My Conduits (primary), Pending Invitations with expiry countdown, Active Conduits list, Create New Conduit (secondary button), Discover Listings (secondary menu)


05
SECURITY OFFICER SYSTEM


Security officers log every truck movement. The three-stage approval system ensures both parties have cleared every guard before they can create a single record — preventing either side from planting an unapproved person to manipulate harvest logs.

Stage 1 — Link
Either party generates a single link code inside the Conduit. Unlimited guards can link using the same code.
Linked guards cannot log anything yet. They are identities waiting for approval.

Link Code Expiry — User Controlled
Expiry Setting
Behaviour
24 hours (default)
Code deactivates after 24 hours. Existing linked guards unaffected.
7 days
Code stays active for 7 days. Warning shown.
30 days
Code stays active for 30 days. Warning shown.
Never
Code never expires. Strong warning shown — anyone with this code can link themselves.


Stage 2 — Attach to Conduit
The side that linked the guard attaches them to the Conduit. A guard links once and gets attached to whichever Conduits they should operate on. No re-linking needed per Conduit.

Stage 3 — Other Side Approves
Land Owner attaches Musa — farm operator gets notified: 'Musa Adewale has been assigned as security on this Conduit. Approve or Reject.'
Farm Operator approves — Musa can now log. Farm Operator rejects — Musa cannot log until approved.
The same approval is required whether land owner or farm operator attaches the guard. The other side always has the final say.

Security List — Controls After Approval
Guard
Device
Status
Available Controls
Musa Adewale
Tecno KC8
🟢 Active
Lock / Revoke
John Emeka
Samsung A12
🟢 Active
Lock / Revoke
Aliu Bello
Infinix Hot 10
🔒 Locked
Unlock / Revoke


Action
Who Can Do It
Requires Other Side
Lock a guard
Either party
No — emergency action, instant
Unlock a guard
Either party
Yes — both must agree
Revoke a guard
Either party
Yes — both must agree


Lock — temporary suspension. Guard sees 'Your access has been suspended.' Reversible only with both sides agreeing.
Revoke — permanent removal. Requires both parties to confirm. Must re-link from scratch if reinstated.

Linked Security Identity
When a guard links for the first time, the app asks for their full name and phone number. This cannot be skipped. Every record they create is permanently stamped with their identity and the Conduit ID.

Example Record Stamp
CON-NG-000184 — Truck IN — 06:14 — Kaduna North Block A — logged by Musa Adewale (+234 801 234 5678)
CON-NG-000184 — Truck OUT — 14:32 — Kaduna North Block A — logged by John Emeka (+234 802 345 6789)


06
GATE & HARVEST RECORDING


Every truck that enters or exits the farm is logged through the AgroLease app. In hardware mode, a connected camera and weighbridge feed data directly. In manual mode, the security officer's phone handles everything. In both modes, the photo step is mandatory and cannot be skipped under any circumstances.

Truck Entry Flow

1
Truck Arrives
Camera auto-snaps the truck and timestamps entry. In manual mode the guard photographs the truck in the app. The flow does not advance without a photo — no exceptions.


2
Gate Key Verification
Driver presents the Gate Key (Business ID). Guard enters it. Correct ID — access granted. Wrong or unrecognised ID — gate stays closed, no exceptions.


3
Weight Recorded
Weighbridge pushes tonnage via RS232/USB directly into the record. In manual mode the guard enters the weight from the physical scale readout.


4
Record Sealed
Full record created: Conduit ID, guard identity, land label, truck photo, plate number, Gate Key, farm operator, crop, weight, date, time. Tamper-evident from this point — any modification raises a permanent audit flag.


5
Truck Exit Logged
Same process on exit. Full in-out cycle is now a closed, verified record.


Evidence Rating
Rating
How Captured and What It Means
MEDIUM
Manual weight entry + mandatory photo. Defensible in most disputes.
HIGH
Connected weighbridge (RS232/USB) + mandatory photo. Hardware-verified weight. Strongest possible legal record.


There is no BASIC rating. A photo is mandatory on every record without exception. The minimum defensible record is always MEDIUM.

Tamper-Evident Design
If any sealed record is modified after creation, the original value is preserved and a permanent red audit flag is raised on that record.
AgroLease records are defensible in court not because they cannot be changed, but because any change leaves a visible, permanent trail.


07
PRICE ENGINE & PUBLIC PRICE PAGE


AgroLease maintains its own commodity price database updated automatically every morning at 3AM local time per country. This powers both in-app settlement calculations and the public price page at agrolease.com/prices.

How It Works
At 3AM local time, a country-specific scraper or API call runs against the relevant government data source.
The bot compares new data against what is already in the database. If no change is detected, the update is skipped and logged as 'no change.'
If new data exists, the database updates. Both the app and the public price page point to the same database — one update, both surfaces reflect it instantly.
If a scrape fails at 3AM, the bot retries at 6AM then 9AM before alerting the team. Users always see the last confirmed price with a 'last updated' timestamp.

Data Sources — All 9 Countries
Country
Source
Method
Frequency
Currency
Legal Status
Nigeria
FMARD Govt Data
Scrape
Daily
NGN (₦)
Low risk — public govt
Ghana
GCX Website
Scrape
Daily
GHS (₵)
Low risk — govt-backed
Kenya
KilimoSTAT API
Official Free API
Daily
KES (Ksh)
Fully legal — open API
South Africa
DAFF / data.gov.za
Scrape
Weekly
ZAR (R)
Fully legal — open licence
India
Agmarknet / data.gov.in
Official Free API
Daily
INR (₹)
Fully legal — open API
Brazil
CONAB Govt Portal
Scrape
Daily
BRL (R$)
Low risk — public govt
Indonesia
BPS Statistics API
Official Free API
Daily
IDR (Rp)
Fully legal — open API
UK
DEFRA gov.uk
Open Govt Data
Monthly
GBP (£)
Fully legal — open licence
US
USDA NASS + AMS
Official Free API
Daily
USD ($)
Fully legal — federal


Source Attribution Policy
No exchange name, government body, or data source is ever displayed in the app or on the public price page.
Prices are presented as AgroLease market reference prices — accurate, verified, attributed to AgroLease.
AHDB (UK) data is explicitly excluded — commercial use prohibited without written permission. DEFRA is used instead.
South Africa updates weekly. UK updates monthly. All other countries update daily. Last updated timestamp always visible.


The Public Price Page — agrolease.com/prices
Anyone can visit without logging in. The page detects the visitor's country from their network and shows that day's local commodity prices. Free, public, no paywall. Page carries one banner: 'Stop tracking these numbers across spreadsheets. Automate your next harvest settlement with AgroLease.'

08
GLOBAL-READY ARCHITECTURE


AgroLease is one universal platform. Geography is a configurable setting, not hardcoded logic. Expanding to a new country means switching on a configuration — not rewriting code.

Configuration Stack
Config Layer
What It Controls
Country
Top-level region identifier
State / Region
Sub-national rules (mandatory for India's 28 APMC state laws)
Currency
Display currency and all monetary calculations
Overwrite_Fee_Floor
Minimum overwrite fee in local currency — auto-applied per country
Price Feed
Which scraper or API to call at 3AM local time
Compliance Template
Which export report format maps to local regulations


Key Rules
Never hardcode Naira, AFEX, or any country-specific value. Everything is pulled from the country config.
The State field under Country is mandatory for India — 28 different APMC rule sets across states.
Weighbridge integration uses RS232/USB — an international industrial standard. Hardware does not change per country.
Tamper-evident audit flags are universal across all regions.
Conduit ID, Land Label, and Farm Boundary fields are mandatory at Conduit creation in every country.

09
PAYMENT & SETTLEMENT


AgroLease does not touch settlement money. It generates a verified, negotiated invoice and tracks whether payment has been confirmed. Money moves directly between Land Owner and Farm Operator through their existing banking relationship.

Settlement Flow
Harvest record created and sealed. Conduit ID and land label appear on the record automatically.
AgroLease generates an invoice with verified market price, tonnage, agreed percentage, and total due. Conduit ID and land label appear on the invoice automatically.
Negotiation window opens. Either party proposes a price adjustment labelled 'Proposed by Land Owner' or 'Proposed by Farm Operator.' No change takes effect until the other accepts.
Both sides approve the invoice inside the app.
Payment moves directly — farm operator to land owner — through their own banking channels. AgroLease is not in this transaction.
Land Owner marks payment as received. Record archived with full approval timestamps, Conduit ID, and land label.

Late Payment Rules
Both parties configure late fee preferences during Conduit setup. If activated, they agree on percentage and grace period. Daily notifications begin 7 days before the deadline if payment has not been confirmed. Late fee begins accruing if deadline passes without confirmation — but only if both parties agreed to this rule at setup.

10
DISPUTE WORKFLOW


Negotiation and disputes are separate systems. Negotiation is two parties agreeing on price before a transaction settles. A dispute is one party formally rejecting a sealed record.

How a Dispute Is Filed
Either party opens a sealed record and selects 'Raise Dispute.' Reason: Weight Discrepancy, Crop Misclassification, Unauthorised Entry, or Other.
The invoice is immediately frozen. No payment confirmation can be marked until the dispute resolves.
The disputing party attaches evidence. The record's evidence rating, guard identity, Conduit ID, and land label are visible to both parties throughout.
Both parties present their case through the in-app DM. All communication stays on-platform.
Resolution: both parties agree in-app, or either escalates to 'Unresolved' — flagging the record for external legal or arbitration use with the full AgroLease audit trail as evidence.

What AgroLease Does and Does Not Do
AgroLease provides a tamper-evident record, evidence rating, guard identity stamp, Conduit ID, land label, and formal dispute log.
AgroLease does not adjudicate disputes. It is an objective evidence system, not a judge.
Every document carries the Conduit ID and land label on every page. The specific relationship and physical land are unambiguous from the first page.
The DM channel inside a Conduit is never closed — not during a dispute, not during a fixed-term lock, not ever.


11
RULES & AGREEMENT SYSTEM


Every agreement rule inside a Conduit is logged. Neither party can change a rule without the other party's explicit acceptance.

How Rule Changes Work
Party
Action
Land Owner proposes
Change percentage from 25% to 30%
System logs
Rule change proposed by Land Owner — pending farm operator approval. Old rule remains active.
Farm Operator counter-proposes
Current agreement is 25%. Counter-proposal: 27%.
System logs
Counter-proposal by Farm Operator — pending land owner acceptance. Old rule still active.
Land Owner accepts
27% agreed.
System updates
New rule: 27% active from this date. Both parties notified. Full log saved.


Fixed-Term Lock & Overwrite
If both parties agree to a fixed deal, edit controls are disabled at the system level for the agreed duration. To change anything, a party initiates the Overwrite Contract function. Both must confirm. The initiating party pays the overwrite fee agreed at Conduit setup. Full log created under the Conduit ID. DM always open.

12
NOTIFICATIONS


Notifications are a core retention mechanism. Every critical event inside a Conduit triggers a notification. Push notification on mobile with email fallback. Every notification links directly to the relevant record inside the app.

Event
Who Gets Notified
Harvest record created
Both parties — immediately
Invoice generated
Both parties — immediately
Invoice approved by one side
The other party — awaiting their approval
Payment marked as received
Both parties — immediately
Rule change proposed
The other party — immediately
Guard attached to Conduit
Other party — approve or reject prompt
Guard approved
Both parties — guard can now log
Guard locked
Both parties — immediately
Guard unlock requested
Other party — approve or reject
Guard revoke requested
Other party — approve or reject
Dispute raised
Both parties — immediately, invoice frozen
Dispute resolved
Both parties — immediately
Payment overdue — 7 days out
Both parties — daily
Payment deadline passed
Both parties — immediately, then daily
Contract expiring — 30 days out
Both parties
Conduit invitation expiring soon
Creator — warning before expiry
Conduit invitation expired
Creator — one-tap regeneration prompt
Conduit payment link sent
Receiving party — pay to unlock
Conduit fully paid and unlocked
Both parties — immediately
Overwrite initiated
Both parties — immediately
Satellite report ready
Land Owner — weekly (if activated)
Satellite anomaly detected
Land Owner — immediately (if activated)
Legal Readiness renewed
Both parties — annually (if activated)


13
ROLLOUT PHASES


Each phase activates the correct regional commodity price feed, currency, Overwrite_Fee_Floor, and compliance logic. The platform codebase does not change between phases — only the country config switches on.

Phase
Country
Currency
Price Source
Method
Key Note
1
Nigeria
NGN (₦)
FMARD Govt Data
Scrape
Launch market. Manual mode from day one.
2
Ghana
GHS (₵)
GCX Website
Scrape
Closest cultural jump from Nigeria.
3
Kenya
KES (Ksh)
KilimoSTAT API
Official API
Fully legal open govt API.
4
South Africa
ZAR (R)
DAFF / data.gov.za
Scrape
Weekly price updates. Open licence.
5
India
INR (₹)
Agmarknet API
Official API
State field mandatory. 28 APMC rule sets.
6
Brazil
BRL (R$)
CONAB Govt Portal
Scrape
Largest ag market in Latin America.
7
Indonesia
IDR (Rp)
BPS Statistics API
Official API
Fully legal. Free API key registration.
8
United Kingdom
GBP (£)
DEFRA gov.uk
Open Govt Data
Monthly updates. Strong compliance market.
9
United States
USD ($)
USDA NASS + AMS
Official API
Highest-value compliance reporting.


Compliance Reports — Enterprise Tenants
Farm Operator companies in the UK or US can generate audit-ready supporting documentation PDFs directly from their Conduit. AgroLease does not file anything with regulators — it generates the evidence document. Every compliance export carries the Conduit ID and land label.

14
HISTORICAL DATA ACCESS


Active Conduits
Active paying customers can access their full record history at any time — no fees, no friction. This is not a premium feature. It is the baseline expectation of any platform that stores your data.

Archive Retrieval
A retrieval fee only applies when a Conduit has been cancelled, has lapsed into cold storage after extended inactivity, or when records from a cancelled Conduit need to be restored. Active customers are never charged to view their own data.

15
SATELLITE & WEATHER INTELLIGENCE LAYER


Optional add-on — $100/year per Conduit. The fee covers satellite imagery processing, crop health analysis, weather data integration, alert generation, and weekly report delivery. The raw imagery (Sentinel-2, ESA Copernicus) is free government-backed data. What AgroLease charges for is everything done with it.

What the Land Owner Sees
NDVI Crop Health Maps — satellite view colour-coded green to red showing crop density and health across the entire farm. If a farm operator claims the crop failed but the dashboard shows healthy green signatures, the land owner has objective evidence to challenge that claim.
Hyper-Local Rainfall Records — exact rainfall tracking over the Conduit's Farm Boundary, not generic regional data. If a farm operator claims flooding or drought prevented harvest, the dashboard shows the verified rainfall timeline for that exact farm.

What the System Detects
Signal
What It Means
Abnormal crop decline
Vegetation health dropping faster than seasonal norms
Unexpected vegetation loss
Sudden clearing or die-off outside harvest windows
Flooding
Water coverage detected over farm boundary
Drought
Sustained low vegetation moisture across the parcel
Harvesting activity
Rapid large-scale NDVI drop consistent with active harvest
Field abandonment
Extended inactivity with no growth progression
Seasonal growth comparison
Current cycle versus same period last year


Crop Health Alerts
When the system detects a significant change against historical vegetation patterns and configurable alert thresholds, the land owner receives an immediate push notification. The land owner taps the alert and sees exactly where on the farm the decline is occurring, how it compares to the previous week, and the rainfall history for the same period.

Technology
Detail
Value
Provider
Sentinel-2 — ESA Copernicus open satellite programme
Cost to AgroLease
Free API — government-backed, no commercial licensing fees
Resolution
10 metres — sufficient for farm-scale crop health monitoring
Coverage
All 9 target countries covered
Update cadence
Weekly reports. Alerts fire immediately when thresholds are breached
Future upgrade
Planet Labs higher-resolution alternative evaluated if user demand requires finer detail


Satellite Disclaimer
Satellite imagery is supplementary evidence and may be affected by cloud cover, revisit frequency, or imagery resolution. When cloud obstruction prevents a clear image, the previous confirmed reading is held and both parties are notified. Satellite data is not guaranteed legal proof — it is one layer of objective evidence within the Conduit's full audit trail.

Report Delivery
Every Saturday night, AgroLease queries the Sentinel-2 API for updated imagery across all active satellite-enabled Conduits. The land owner receives a push notification Sunday morning. One tap opens the NDVI map and rainfall summary inside the Conduit.

16
LEGAL READINESS


Optional add-on — $200/year per Conduit. Covers continuous record maintenance and structured export capability. When a court, arbitrator, or auditor asks for documentation, you export immediately. Everything is already structured, labelled with the Conduit ID and land label, and ready.

What Gets Exported
Component
Description
Harvest Records
Every truck entry and exit — weight, date, time, crop, Gate Key
Photos
All mandatory truck photos, timestamped and linked to their records
Audit Trail
Every tamper flag, modification log, and system event
Guard Identities
Full name, phone number, and complete logging history per guard
Invoice History
Every invoice — generated, negotiated, approved, and settled
Negotiation History
Every price proposal with party label and timestamp
Disputes
Full dispute log — raised, evidence, DM history, resolution
Satellite Imagery
NDVI maps and rainfall records (if Satellite layer active)
Commodity Prices
AgroLease market reference prices at time of each harvest
Conduit ID & Land Label
Permanent identifier and land description on every page
Timeline Reconstruction
Full chronological event sequence for any date range requested


AgroLease does not file anything with regulators. It produces the evidence document. What the party does with it is their business.

17
TRUST SCORE


Every Conduit has a continuously updated Trust Score — a live rating reflecting how both parties have behaved inside this specific relationship over time. Calculated exclusively from verified platform events. No opinions, no ratings, no reviews.

What Generates the Score
Signal
Direction
Disputes raised
Down
Late payments
Down
Rejected invoices
Down
Guard approvals rejected
Down
Audit flags on records
Down
Overwritten contracts
Down
Payment speed
Up
Clean invoice approvals
Up
Consistent guard approvals
Up
No disputes over rolling period
Up


How It Works
Score updates automatically as events occur inside the Conduit.
Both parties see the same score — no hidden version.
Score is specific to this Conduit relationship. A farm operator with a poor score on one Conduit does not inherit it on another.
No manual input, no appeals process. The score reflects the verified record of events inside this Conduit only.
The Trust Score is private to the Conduit. It is never shared externally or used across Conduits without both parties' explicit consent.

18
SPATIAL CONDUIT ENGINE — POST-MVP


When both parties finalize negotiations and create a Conduit, the platform initializes a visual mapping workflow that ties the physical acreage boundary directly to the legal contract. Every lease becomes a distinct, unalterable geometric layer on the land owner's land.

The Just-in-Time Boundary Flow

1
Define Allocation Scope
The system prompts: Entire Property (binds the full listing boundary to this Conduit) or Part of the Property (triggers the visual sub-leasing canvas).


2
Lock the Hectare Constraint
The land owner enters the exact number of hectares assigned to this farm operator (e.g. 50 ha). This value is strictly locked. The visual boundary cannot alter this metric — to change acreage the user must explicitly edit this numerical field.


3
Tap-and-Drag Directional Gesture
The app instructs: 'Tap where the lease begins, then drag in the direction the farm layout extends.' The initial tap establishes the anchor point. The drag tells the geometry engine which direction to favour when rendering the boundary.


4
Geometry Preview Generated
Based on anchor point, drag direction, and locked hectare input, AgroLease generates a preview polygon constrained within the property's available boundary. The algorithm optimises for irregular property lines without breaking user expectations.


5
Spatial Adjustment — No Resizing
The user fine-tunes placement using Move (slide the fixed-area polygon to another zone) or Rotate (spin orientation to align with roads, treelines, waterways). Resize is blocked. The shape can morph to fit angles, but total area remains fixed at exactly 50.00 ha.


Long-Term Asset Intelligence
By tracking every lease as a distinct geometric layer, the AgroLease backend converts static land into a smart ledger. As a property accumulates active and historic Conduits, the platform automatically computes high-value operational metrics on the land owner's dashboard.

Metric
Business & Operational Utility
Property Utilization %
Calculates exact active space vs. idle inventory across the full property
Encroachment Detection
Blocks any new boundary from overlapping an already active farm operator's zone — prevents legal disputes before they start
Historical Lease Mapping
Visual record of who farmed which sub-sections of the land over a 5–10 year horizon
Crop Rotation History
Tracks historical crop types per polygon layer — flags consecutive same-crop leasing on the same block as a data record for the land owner's awareness
Targeted Satellite Health
Isolates NDVI analysis strictly to the farm operator's operating boundary — ensures the $100/year subscription only processes data the specific subscriber pays for


19
DISCOVERY & MATCHMAKING NETWORK — POST-MVP


The Discovery layer extends AgroLease beyond lease management into relationship creation. It enables landowners, corporate tenants, and commercial farm operators to find suitable partners before formalizing a lease through a Conduit. Discovery is strictly post-MVP — deployed only after the core Conduit ecosystem has proven stable with active paying users.

Adaptive Navigation
AgroLease intentionally changes its primary navigation as the user's relationship matures. Unlinked users are guided toward discovering and creating partnerships — their dashboard prioritizes finding a partner. Established users with active Conduits see an operations-first interface. Discovery recedes into secondary menus.

The Three Listing Pillars
Land Listings — Landowners list available acreage, soil suitability, and regional location to attract corporate tenants looking to expand cultivation footprints.
Farm Operator Listings — Corporations or institutional buyers post active sourcing mandates (e.g. 'Seeking 5,000 hectares for sustainable sugarcane cultivation in Western Kenya').
Farm Management Listings — Professional farming operators, agronomists, or project managers list their operational capacity to manage cultivation for passive or corporate landowners.

The Five-Stage Funnel — Discovery to Conduit

1
Post Listing
A land owner posts a Land Listing for a farm in Kaduna with location, acreage, and soil data.


2
Discover
A corporate procurement manager filters for Kaduna and views the listing. They click 'Contact Owner.'


3
Negotiate
A dedicated, secure in-app messaging channel opens. Both parties discuss terms, price, and expectations directly within AgroLease.


4
Initialize
Once terms are agreed, either party taps 'Create Conduit.' The app automatically pulls both Profile IDs and imports the pre-existing listing and map data into a new draft Conduit.


5
Activate
Both parties are routed to the $250/year Conduit payment wall to formalize the relationship and unlock operational logging.


Conduit Invitation Expiry — User Controlled
When a user taps 'Create New Conduit,' a draft Conduit ID is generated immediately. To prevent dead invitations from polluting dashboards and the backend registry, the invitation expires unless accepted. The creator is warned upfront and notified before expiry.

Expiry Setting
Behaviour
24 hours (default)
ID expires and recycles to the platform pool if not accepted. Creator warned upfront.
7 days
Invitation stays active for 7 days. Warning shown.
30 days
Invitation stays active for 30 days. Warning shown.
Never
Invitation never expires. Warning shown — only use when farm operator confirmation is certain.


If an invitation expires, the creator sees a one-tap regeneration button. The old ID is recycled and a fresh Conduit ID is generated instantly.

The Mapping Engine — Free Data Crowdsourcing
The mapping feature is 100% free for anyone posting a listing. Removing financial friction encourages users to provide rich geographic data that feeds directly into the Conduit and Satellite layers later.

Option A — Use Current GPS Location — user taps one button while standing on the land. App reads hardware GPS and centers a satellite map of their surroundings. They point to where their land starts and ends.
Option B — Drop a Pin — user moves a pin onto a satellite map to mark the approximate centre or entrance of the land.
Option C — Enter GPS Coordinates — user types specific latitude and longitude coordinates from a land survey.
Option D — Draw Farm Boundary — user traces the exact property boundaries using an interactive polygon tool.

The Data Loop
When a listing converts into a Conduit, the geographic data automatically populates the Conduit's Farm Boundary field.
If the land owner later activates the Satellite & Weather layer, the platform reuses this exact map boundary.
Zero redundant data entry across three separate systems — listing, Conduit, and Satellite.


Trust Signals & The Legal Shield
AgroLease never adjudicates land ownership or title deed validity. The directory relies on two objective, automated badges.

Mapped Location Badge — Trigger: user completed any of the four mapping options. Value: signals the listing has a verifiable physical location.
Identity Verified Badge — Trigger: user completed government ID / KYC onboarding checks. Value: signals the platform has verified who posted the listing, entirely separate from what they claim to own.

Mandatory Platform Disclaimer
Displayed permanently underneath every mapped listing, unskippable:
'Mapped using location data supplied by the listing owner. AgroLease verifies that the submitted map data is associated with this listing but does not verify ownership, title, or legal rights over the land. Independent legal due diligence remains the responsibility of all parties.'


Long-Term Roadmap — Intelligent Mapping
Metadata Extraction — AgroLease may introduce system updates that read embedded GPS metadata from uploaded photographs, allowing the app to suggest a farm location automatically for user confirmation.
AI Geospatial Matching — long-term scaling may introduce computer vision models capable of cross-referencing ground-level photos against satellite terrain, field shapes, and landmarks to suggest probable boundaries. Any system-generated location remains a suggestion until explicitly reviewed and accepted by the user.

20
WHAT TO BUILD FIRST — MVP SCOPE


The MVP is the smallest version of AgroLease that delivers real value to a real land owner in Nigeria today.

MVP — Build This
Land Owner and farm operator account creation with Profile ID assignment (e.g. user1234, editable)
Conduit creation — system generates Conduit ID (e.g. CON-NG-000184) automatically
Conduit land label — name, hectares, location — mandatory at creation
Conduit invitation with user-controlled expiry (24 hours default, 7 days, 30 days, never)
One-tap invitation regeneration when expired
Dashboard: unlinked view (Create New Conduit primary) and established view (Conduits primary, discovery secondary)
Pending Invitations list with expiry countdown
Conduit partner linking — other party enters the Conduit ID to accept invitation
Conduit split billing — one side pays partial, sends link to other side to complete
Conduit payment wall — everything locked until $250 collected
Three-state app: no-account gate logging, land owner dashboard, farm operator dashboard
Security officer linking via Conduit code — no account required
Three-stage security approval: link → attach → other side approves
Security list with Lock (instant, one side) and Revoke (both sides must confirm)
Linked security identity — name and phone collected on first link, cannot be skipped
Manual mode gate logging — mandatory photo before record seals, no exceptions
Evidence rating on every record (MEDIUM or HIGH only — no BASIC)
Conduit ID and land label appear automatically on every record, invoice, dispute log, and export
Basic agreement setup — percentage, payment deadline, late fee toggle, overwrite fee
Harvest invoice generation with admin-entered commodity prices
Negotiation window — both parties propose and accept adjustments
Invoice approval — both sides confirm, land owner marks payment received
Basic dispute filing — raise dispute, freeze invoice, in-app DM for resolution
Trust Score — auto-calculated from verified platform events
Core notifications — all events in Section 12
Transaction history with tamper-evident audit log
Full history always visible to active Conduit users — no retrieval fees
Admin panel for daily commodity price entry per country

Defer Until Post-MVP
Connected weighbridge and camera hardware integration (RS232/USB)
Automated price scraping bot and public price page
Fixed-term lock and overwrite contract system
Farm Boundary field and Satellite & Weather Intelligence layer (Section 15)
Legal Readiness — record maintenance and structured export (Section 16)
Spatial Conduit Engine — polygon boundary mapping and asset intelligence (Section 18)
Discovery & Matchmaking Network (Section 19)
Compliance report PDF export
Ghana and all subsequent country expansions
Partner Program hardware supply

The Founding Logic
One Conduit. One land owner. One farm operator. One Nigerian farm. That is the entire MVP target.
Profile ID and Conduit ID are separate systems. Profile ID identifies the business. Conduit ID identifies the relationship.
The land label is three fields. It costs almost nothing to build and turns every record into a legally useful document.
The three-stage security approval system is the heart of the trust model. Build it right from the start.
AgroLease never touches settlement money. The verified invoice and the audit trail are the product.


AgroLease V10.0 — June 2026
