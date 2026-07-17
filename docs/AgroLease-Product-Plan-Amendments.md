# AgroLease — Product Plan Amendments Log

**Status:** Addendum to V10.0. V10.0 remains the base document except where an amendment below explicitly supersedes a section. Each entry is dated, references the V10.0 section it changes, and states the reason — not just the change — so nobody has to reconstruct the "why" later.

---

## Amendment 1 — Price Engine (supersedes Section 07 in full)

**What changed:** Country-specific scrapers and government APIs are replaced by a single AI price engine. At 3AM local time per country, it searches 2–3 independent public sources per tracked crop and returns an estimated price with a confidence rating (high/medium/low), flagging disagreement between sources instead of silently averaging it away. Same retry cadence as before (3AM → 6AM → 9AM), same "last confirmed price" fallback.

**Why:** A bespoke scraper or official-API integration was needed per country before that market could launch — real engineering work, multiplied by 30+ target countries. One AI mechanism works identically everywhere; expansion needs a currency and crop list, not new code. Solo-founder execution capacity was the deciding factor.

**Also changes:**
- Source Attribution Policy: prices now labeled "AgroLease AI Price Estimate," never "verified." Permanent disclaimer: *"Estimated by AI from multiple public sources. Not a guaranteed market rate — a starting reference for negotiation, not the final word."* Individual source names/URLs stay unlisted, consistent with the original never-name-a-source policy.
- The "Data Sources — All 9 Countries" table (originally following Section 07) is obsolete — delete it.
- Section 08's config stack row "Price Feed → which scraper/API to call" becomes "Price Feed → same AI engine for every country, only currency and crop list change."
- Section 13's per-country "Price Source / Method" columns are obsolete for the same reason.
- `commodity_prices.entered_by` gains a third value: `ai_estimate` (alongside `admin`, `scraper`). New columns: `sources_consulted` (jsonb), `confidence` (`high`/`medium`/`low`).

**Doesn't change:** the negotiation + dual-approval flow in Section 09 already treats any starting price as non-final — that safety net is why an AI estimate is an acceptable starting point rather than a risk.

---

## Amendment 2 — Security Team Display (Section 02 table, Section 05)

**What changed:** Security rosters never display individual guard names at the Conduit-summary level, regardless of team size. Always the aggregate pattern: `Kaduna Security (20)` → tap → `View Details` → full roster with per-guard Lock/Unlock/Revoke. The "What Lives Inside a Conduit" example table's `Musa, John, Aliu` / `Emeka, Tunde` becomes `Kaduna's security (20)` / `Oyo security (2)`.

**Why:** teams range from 2 guards to 100+. Rather than a threshold rule for "when do we switch from names to a count," one consistent pattern at every size is simpler to build and simpler for users to learn.

**Doesn't change:** individual guard identity is still fully captured and stamped on every record they log (Section 05, "Linked Security Identity") — this only affects the summary list view, not the audit trail.

---

## Amendment 3 — Split Payment Link Delivery (Section 03)

**What changed:** When a split-payment link is generated, it posts as a system message into the Conduit's shared DM thread — visible to both parties in the same thread — rather than relying only on a native OS share sheet to an external channel.

**Why:** both parties should see the same "₦150,000 remaining, tap to pay" message in the same place, not two different experiences depending on how each of them received it.

---

## Amendment 4 — Account Roles (Section 02, Section 04)

**What changed:** Account setup now includes a required role declaration, distinct from which side of a Conduit someone occupies:

| Account role | What it means |
|---|---|
| Land Owner | Owns/controls the land being leased |
| Farm Operator | Farms leased land — individual, cooperative, or corporation |
| Cooperative | Represents multiple members' land or farming operations |
| Land/Lease Agent (in-charge) | Manages a Conduit on behalf of someone else — the account holder isn't necessarily the legal owner |

**Why:** the person actually running the app isn't always the legal land owner (an agent, a family member, an estate manager), and the operator isn't always literally "a farmer" (Dangote is a corporation). The original binary Land Owner/Farm Operator labeling didn't have room for either case.

**Critical distinction — read this before building anything downstream:** a Conduit still only ever has two sides — a `land_owner_id` slot and a `farm_operator_id` slot (V10 Section 02, unchanged). Account role describes **the person**; the Conduit slot describes **the relationship**. A `land_agent` fills the land-owner slot on someone else's behalf. A `cooperative` fills either slot representing a group. The role is descriptive metadata (onboarding copy, future Discovery matching) — it is never a permission gate on Conduit structure.

**Explicitly deferred:** Farmer, Laborer, Crop Farmer. Unlike Security Officers, nobody has defined what these roles actually *do* inside the app yet — no screen, no permission, no action tied to them. Adding them as selectable roles now would be inventing a feature that doesn't exist. Revisit once that's decided.

---

## Amendment 5 — Weight Recording (supersedes relevant part of Section 06)

**What changed:** Weight becomes fully optional at the gate — not just "optional on entry, required on exit" as originally specced, but skippable at both entry and exit if no weighing equipment is available on-site at all.

- Either party can input weight **later**, after the truck has already left — e.g., the Farm Operator weighs the harvest off-site and enters "5 tons" afterward.
- The **other party** is notified and can **agree** or **disagree** with that entered weight.
- Disagreement does **not** erase or block the record — the entered weight stays, but the record carries a visible warning flag. This is a lighter-weight acknowledgment step, separate from filing a formal Dispute (Section 10's `weight_discrepancy` reason still exists for anyone who wants a full negotiated resolution instead of just a flag).
- Gate-side recording (guard enters weight while the truck is still there) remains the **recommended** path, presented as the strongest evidence option — but never mandatory, and never blocks the flow if skipped.

**Why:** most land owners don't own a weighbridge at all. Many operators weigh crops off-site — at a buyer's facility, a market, a mill — not at the farm gate. Even large operators like Dangote may own scales, but at their own company sites, not at the point of harvest. Requiring hardware to use the app at all would be an adoption-killer for a brand-new, unproven platform — nobody buys a weighbridge to try one guy's new app.

**Also changes:**
- `harvest_records.weight_tonnes` becomes nullable at exit as well as entry (previously "nullable on entry" only).
- New column: `weight_status` (`recorded` / `pending`).
- Evidence rating is **not assigned** while `weight_status = 'pending'` — the UI shows "Weight Pending," not a fake tier. No BASIC rating still holds; it just doesn't apply a rating too early either.
- The tamper-evident trigger (Section 06) needs a carve-out: the *first* time a null `weight_tonnes` gets filled in is a legitimate completion, not tampering. Any change *after* that point still flags as tampering, exactly as before.
- Invoice auto-generation (Section 09) waits for a weight to exist — it does not fire off an unpriced invoice on exit alone.

**Open questions — not yet resolved, flagged so they don't get silently decided during a build task:**
1. If a harvest record's weight is never filled in by anyone, does it just sit `pending` forever with no invoice, or does it need a reminder nudge after some number of days?
2. Off-site, self-reported weight (no photo of an actual scale, entered days later) is objectively weaker evidence than a gate-logged manual weight with a photo taken at the time. Should these be distinguishable somehow (a sub-label, a lower confidence marker) rather than both just becoming "MEDIUM" once agreed? Worth a decision before Task 6/7 are written, not urgent today.
3. Confirm the agree/disagree mechanic is symmetric regardless of which party enters the weight first (Land Owner enters, Operator confirms/disputes — or the reverse) — this doc assumes yes.

---

*This log is additive — new amendments get appended below with the next number, never edited into the original entries above, so the history of decisions stays intact.*

---

## Amendment 6 — Weight Recording Resolutions (resolves Amendment 5's open questions)

**Resolution to Q1 — no "pending" state.** A harvest record with no weight is **settled, not pending** — "pending" implies unfinished, and this record isn't. It seals exactly like any other record and simply displays a ⚠️ warning indicator where the weight would be. If weight is added later, it's handled through the **standard edit/audit-trail mechanism already in Section 06** — shown as "edited," with the change visible in the record's history. This walks back a mistake in Amendment 5: I'd proposed a special carve-out exempting the first weight fill-in from the tamper trigger. That's unnecessary — treating it as a normal tracked edit is simpler and more consistent with how every other field on a sealed record already works. **`harvest_records.weight_status` from Amendment 5 is dropped** — a null `weight_tonnes` is itself the signal; no separate state column needed.

**Resolution to Q2 — no distinguishing marker needed.** Off-site, later-added weight doesn't need a special confidence/provenance label. The edit trail already carries this: a weight added 3 days after the record sealed is visibly different from one entered at the gate, because the timestamp gap tells that story on its own. No new field required.

**Resolution to Q3 — agree/disagree mirrors the Security Officer pattern, with one difference.** One side records the weight, the other side responds — same interaction shape as Security Officer attach → approve (Section 05), regardless of which party enters it first. The difference: a Security Officer rejection is a hard block (guard can't log). A weight disagreement is **not** a hard block — the entered value stays on the record exactly as Amendment 5 specified, just flagged with a warning. Don't build this as a literal reuse of the reject-blocks pattern; the UX shape matches, the consequence doesn't.

**Schema update (supersedes the `weight_status` patch in Amendment 5 — drop that column if already applied):**
```sql
ALTER TABLE harvest_records ADD COLUMN weight_agreement_status text
  CHECK (weight_agreement_status IN ('agreed','disagreed'));
-- null = weight not yet entered, or entered but other party hasn't responded yet
```

**Evidence rating while weight is absent:** `evidence_rating` stays null, not a fake MEDIUM — the ⚠️ warning icon occupies that space in the UI instead of a tier badge. Once weight is added, it's rated MEDIUM (manual/off-site entry, no weighbridge) at that point, alongside the "edited" indicator.

**Notifications (adds to Section 12):** "Weight added to record" → other party notified, respond agree/disagree. "Weight disagreement flagged" → both parties notified.


---

## Amendment 7 — Account Roles Removed (supersedes Amendment 4 in full)

**What changed:** Role selection is removed entirely from account signup. `profiles.account_role` is dropped. Land Owner / Farm Operator / Cooperative / Land Agent are **not** global account traits.

**Why:** role is relationship-scoped, not account-scoped. The same company or person can be a Land Owner on one Conduit and a Farm Operator on another — forcing one fixed global role at signup was inaccurate and unnecessary. Every Conduit already has a `land_owner_id` and `farm_operator_id` slot; whoever occupies that slot *is* that role for that relationship, regardless of any global label. Amendment 4's original concerns — an agent isn't the legal owner, a corporate tenant isn't literally a farmer — are still fully resolved without a global role field. A Conduit's "Farm Operator: Dangote Farms" label is scoped to that relationship, not a claim about Dangote's fundamental identity.

**Also changes:** Task 2's Welcome screen now follows Verification directly — no Role Selection step. Profile and Edit Profile screens no longer show or collect Role.

**Note on history:** Amendment 4 stays in the log above, unedited, so the reasoning that led here is still visible — this entry supersedes its *design*, not its record.

---

## Amendment 8 — Information Architecture: Home / My Conduits / Conduit Workspace

**What changed:** three distinct layers, each with exactly one job, nothing repeated between them.

- **Home** — aggregate overview across everything: My Conduits count, Pending count, Recent Activity, Pending Invitations, "Generate Conduit ID" CTA, a general/browsable Live Commodity Prices widget (country + crop selector, same idea as the public price page), Link Security shortcut, Browse Listings shortcut.
- **My Conduits** — a pure list, nothing else. Search bar + list of Conduits (ID, land label, partner, status). Zero-state: "You don't have any conduits yet" + Generate / Enter ID. **No** statistics, cards, recent activity, pending counts, or commodity prices here — that's all already on Home. Tapping a Conduit goes straight into that Conduit's workspace, never another overview screen.
- **Conduit Workspace** (opened by tapping a Conduit) — the real per-relationship dashboard: header (land label, Conduit ID, status), partner info card (name, verified badge, Trust Score), action row (Message / Add Record / Agreement / Land / Security), info cards (Land Information, a *contextual* live price for whatever that Conduit produces — no selector, unlike Home's — Harvest Records count, pending Invoices count, Security count, Satellite/Legal Readiness activation toggles), Activity Timeline.

**Why:** Home answers "what's happening across everything," My Conduits answers "which relationships do I have," Conduit Workspace answers "what's the state of this one relationship." Repeating stats across two of these would just be the same information twice.

**Pricing clarification:** Home's price widget and the Conduit Workspace's price widget are two different things, not a duplicate — Home is a general reference (any country, any crop), the Conduit Workspace shows the price relevant to that specific relationship's crop, contextually, with no selector needed.

---

## Amendment 9 — Conduit Settings Menu Structure (reference for future task briefs)

The Conduit's `⋮` menu opens a "Conduit Settings" area:

- **Conduit Details** — Conduit ID, Copy ID, Payment Status
- **Land** — Edit land information, View boundary (future), Update location
- **Relationship** — Partner profile, Transfer ownership (future), End relationship
- **Documentation** — Transaction history, Export records, Audit log, Legal Readiness
- **Notifications**
- **Conduit Settings** — Agreement settings, Late payment rules, Overwrite fee, Invitation settings
- **Danger Zone** — Archive conduit, Delete draft

**Open question — flagged, not resolved:** does Conduit renewal auto-charge by default (Paystack recurring billing via a stored authorization, with an explicit "cancel next year" opt-out), or stay fully manual (both parties reminded, must actively re-pay each year, nothing stored)? And can each Conduit use a different payment method, rather than one method for the whole account? This materially changes the Paystack integration depending on the answer. Not urgent — doesn't block Task 2 or 3 — but needs deciding before whichever task builds Payment/Conduit Settings.

---

## Amendment 10 — Conduit Renewal: Auto-Charge by Default (resolves Amendment 9's open question)

**Decision:** Conduit renewal auto-charges by default via a stored payment method, with an explicit "cancel next year" opt-out per party.

**The wrinkle this decision runs into — and how it's resolved:** Paystack only produces a reusable stored authorization when a payment is made **by card**. Bank transfer and USSD payments — both of which Section 03's split billing explicitly supports and Nigeria relies on heavily — don't produce anything reusable. Combined with split billing (either party can pay any portion, by any method), auto-renewal can't be a single Conduit-level switch. It has to be **per party**:

- Each party can independently have auto-renewal active for **their own portion**, and only if they paid by card.
- If a party paid by bank transfer or USSD, or opted out, their portion falls back to the original manual reminder flow (30 days out, daily) at renewal time — regardless of what the other party is doing.
- A Conduit can end up in a mixed state: one side auto-renews, the other gets reminded manually. That's expected, not a bug.
- "Cancel next year" cancels only the canceling party's own stored authorization — never the other party's.

**Consent:** card networks require explicit opt-in to store a card for future charges — this can't be silent. At the moment of payment (Task 4), show a visible, checked-by-default toggle: *"Save this card and auto-renew next year."* Default matches the decision above (on), but it must be genuinely visible and uncheckable in the moment, not disclosed only in fine print.

**Schema (for Task 4, not needed yet):**
```sql
ALTER TABLE conduits ADD COLUMN auto_renew_owner boolean DEFAULT true;
ALTER TABLE conduits ADD COLUMN auto_renew_operator boolean DEFAULT true;
ALTER TABLE conduits ADD COLUMN paystack_authorization_code_owner text;
ALTER TABLE conduits ADD COLUMN paystack_authorization_code_operator text;
```
The boolean being `true` doesn't mean a charge will actually fire — it only fires if the matching authorization code is present (i.e., that party actually paid by card and consented). A `true` flag with a null authorization code is treated the same as manual renewal for that party.

**Also changes (Section 12):** new notification events — "Auto-renewal charged," "Auto-renewal failed — update your payment method," and the existing renewal-reminder notifications now need to check auto-renew status before firing, so a party who's already covered doesn't get needless "pay now" reminders.
