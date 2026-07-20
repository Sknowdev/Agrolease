# TASK 3 — Conduit Creation + Invitation

Hand this file to your coding agent as-is. This is where the app becomes actually useful — the first real Conduit gets created here. Depends on Task 1's schema and Task 2's auth/Home/My Conduits/Profile screens already being live.

---

## Objective

Let a user create a Conduit, invite a partner to join it, and let that partner accept — plus turn Task 2's Home and My Conduits from zero-state stubs into the real thing, and build a minimal Conduit Workspace to land on. No harvest records, no invoicing, no security officers, no Trust Score, no Satellite/Legal Readiness activation — all later tasks. This task ends with two linked parties looking at an empty, unpaid Conduit.

## Before You Start

- **Confirm Task 2 is marked ✅ Complete & Confirmed in `task_app_progress.md` before starting.**
- **No new schema patch needed.** Task 1's `conduits` table already has every field this task uses (`land_owner_id`, `farm_operator_id`, land fields, boundary fields, invitation fields).
- **Role reminder (Amendment 7):** there is no `profiles.account_role` and there never will be. Which side someone is on — Land Owner or Farm Operator — is decided fresh, per Conduit, in this task's Step 1. The same profile can be Land Owner on one Conduit and Farm Operator on another.
- **Conduit ID prefix pulls country_code dynamically** from `country_config` (`CON-{country_code}-{6-digit sequence}`) — do not hardcode `"NG"`, same rule as Task 2's fix.
- **Farm Boundary here is not the Spatial Conduit Engine.** This task captures one simple property-level boundary per Conduit (pin, coordinates, polygon trace, or GPS) for Satellite's future use. It does not use Turf.js, does not calculate locked hectares, and does not do encroachment detection — that's all Task 12, working with a completely different table (`conduit_sub_parcels`). Keep this task's polygon capture simple.
- **Don't build the full Conduit Settings `⋮` menu (Amendment 9) yet.** Most of its sections (Documentation, Security, Conduit Settings, Danger Zone) depend on tasks that don't exist yet. Building an empty menu shell now means redoing it repeatedly as each section comes online. Instead, put a plain "Edit" affordance directly on the Land Information card for the one thing this task actually owns. The full menu gets built once enough of it has real content behind it.

---

## Screens This Task Touches (9)

**New (7):** Side Selection · Land Label form · Farm Boundary capture · Invitation Expiry picker · Generated ID/Share · Accept Invitation · Conduit Workspace (minimal)
**Upgraded from Task 2 zero-state to real data (2):** Home · My Conduits

---

## Steps

### 1. Entry points
"Create" tab (stub in Task 2), "Generate Conduit ID" CTA on Home (non-functional in Task 2), and "Generate" button on My Conduits' zero-state all now route to the same flow, starting at Side Selection. "Enter ID" on My Conduits routes to Accept Invitation (Step 7).

### 2. Side Selection
"Are you the Land Owner or Farm Operator on this Conduit?" — single-select, required, first screen of the creation flow. This decides which FK slot (`land_owner_id` or `farm_operator_id`) the creator occupies on this specific Conduit. Whoever accepts the invitation later automatically takes the opposite side — they don't get asked, since it's already determined.

### 3. Land Label form
- Land Name / Reference (text)
- Size in hectares (numeric)
- Location (state/region text)

All three mandatory. Writes onto the draft `conduits` row.

### 4. Farm Boundary capture (optional)
One screen, four-method switcher:
- **Drop a Pin** — tap on map
- **Enter GPS Coordinates** — lat/lng text input
- **Draw Polygon** — tap-to-draw on `react-native-maps`
- **Use Current GPS Location** — `expo-location`

Skippable — required later only if Satellite (Task 13) gets activated. Store as `farm_boundary_coords` (jsonb) + `farm_boundary_type`.

### 5. Invitation Expiry picker
24 hours (default) / 7 days / 30 days / Never — same warning pattern already used for Security link codes (Task 2) for the non-default options.

### 6. Generate
Conduit ID created: `CON-{country_code}-{6-digit zero-padded sequence}`. Show the ID with **Copy** and **Share** actions, countdown timer based on the chosen expiry. `conduits.status = 'draft'`.

### 7. Accept Invitation
Reached via "Enter ID" on My Conduits, or `agrolease://conduit/{id}` deep link. Partner enters/confirms the Conduit ID.
- Validate: exists, `status = 'draft'`, not expired.
- Valid: link partner to whichever side the creator didn't take. `status → 'pending_payment'`.
- Expired: "Invitation expired. Ask your partner to regenerate." — one-tap regeneration available to the original creator from My Conduits: generates a fresh Conduit ID, old one recycled.

### 8. My Conduits — now populated
Upgrades Task 2's zero-state into the real list:
- Each row: Conduit ID, Land Label, Partner name (or "Waiting for Partner" if unaccepted, with expiry countdown), Status (`Active` / `Pending Payment` / waiting-on-partner)
- Search bar now functional — filters by land label, Conduit ID, or partner name
- Tapping a row → Conduit Workspace (Step 9)
- Zero-state from Task 2 still applies when the list is genuinely empty

### 9. Home — now populated
Upgrades Task 2's zero-state:
- **My Conduits** card shows the real count
- **Pending** card shows count of Conduits in `draft`/`pending_payment`
- **Pending Invitations** card shows count of unaccepted drafts this user created
- **Recent Activity** stays at 0 — that's Task 6+ territory, not this task's concern
- **Generate Conduit ID** CTA now fully functional, routes to Step 2

### 10. Conduit Workspace (minimal — not the full version)
- Header: Land Label, Conduit ID (with copy), status badge
- Partner info: name, or "Awaiting partner" if still in draft
- Land Information card: hectares, location, plain **Edit** affordance (routes back to a form pre-filled with Step 3's fields)
- Everything this task doesn't own — Harvest Records, Invoices, Security, Trust Score, Satellite/Legal Readiness, Activity Timeline — shows as a plain "Coming in Task [X]" placeholder card. Don't invent zero-states or fake data for features that aren't built yet; label them honestly as not-yet-available.

### 11. Hourly Railway cron
Find `conduits` where `status = 'draft'` and `invitation_expiry < now()` → set `status = 'expired'`. Write a row to `notifications` for the creator (schema already exists from Task 1). Actual push delivery doesn't fire yet — that's Task 10 — this just needs the record to exist so Task 10 has something to deliver once it's built.

---

## Test Before Marking Complete

- [ ] All three entry points (Create tab, Home CTA, My Conduits "Generate") route to the same Side Selection screen
- [ ] Side Selection is required and correctly determines `land_owner_id` vs `farm_operator_id` on creation
- [ ] Land Label form enforces all three fields as mandatory
- [ ] Farm Boundary can be skipped entirely, and each of the 4 capture methods works when used
- [ ] Conduit ID follows `CON-{country_code}-######` using the live `country_config` value, not a hardcoded string
- [ ] Invitation expiry picker works for all 4 settings, warnings show on non-default choices
- [ ] Generated Conduit ID has working Copy and Share actions
- [ ] Accept Invitation correctly validates existence, draft status, and expiry
- [ ] Accepting a valid invitation assigns the partner to the correct opposite side and moves status to `pending_payment`
- [ ] Expired invitation shows the correct message; regeneration produces a fresh ID and recycles the old one
- [ ] My Conduits renders real rows correctly for Active, Pending Payment, and awaiting-partner states, each with correct partner name/status/countdown
- [ ] My Conduits search filters correctly by land label, Conduit ID, and partner name
- [ ] Home's four cards reflect real counts, not hardcoded zeros
- [ ] Home's Generate Conduit ID CTA is now fully functional
- [ ] Conduit Workspace shows correct header/partner/land info, and honest "Coming in Task X" placeholders for everything not yet built — no fake data anywhere
- [ ] Land Information's Edit affordance correctly updates the Conduit's land fields
- [ ] Hourly cron correctly expires overdue drafts and writes a notification record
- [ ] No Turf.js, no sub-parcel logic, no encroachment detection anywhere in this task's boundary capture

---

## When Done

Update `task_app_progress.md` in the repo root:
- Mark **Task 3** as ✅ **Complete & Confirmed**, today's date, one line on what was tested and verified.
- If anything above fails or can't be finished, mark it ⚠️ **Blocked** instead, with the specific error and what's needed to unblock — do not mark it Complete.

Then stop and report back: what's live, what was tested, and anything that needs a decision before Task 4.
