# TASK 2 — Auth + Profile ID

> ⚠️ **REVISION (v5).** Two changes from the previous version: (1) Role selection is removed entirely — see Amendment 7. (2) The generic "Dashboard stub" is replaced with real zero-state builds of **Home** and **My Conduits**, per Amendment 8's three-tier structure (Home / My Conduits / Conduit Workspace). Conduit Workspace itself is *not* built here — there's no Conduit to open until Task 3 exists. If your agent already built the old version, remove Role Selection and split the old Dashboard stub into these two screens.

Hand this file to your coding agent as-is. This is the first user-facing flow — it depends on Task 1's schema and deployed backend already being live.

---

## Objective

Build the full authenticated entry path: Splash → Login/Sign Up (email or phone, password-based, Google OAuth available) → identity verification → Profile ID reveal → routed into a real zero-state Home and My Conduits. Plus two fully independent side-flows: Security Access (no full account) and Forgot Password. Conduit Workspace and all real Conduit functionality are Task 3 onward.

## Before You Start

- **Confirm Task 1 is marked ✅ Complete & Confirmed in `task_app_progress.md` before starting.**
- **Schema:** `profiles.account_role` is **removed** — if it was already added in an earlier revision, drop it now: `ALTER TABLE profiles DROP COLUMN IF EXISTS account_role;`. Confirm `profiles.phone` is nullable. No new columns are needed for password or Google auth; Supabase Auth handles credentials natively in `auth.users`, not in `profiles`.
- **Farmer / Laborer / Crop Farmer are still out of scope.**
- Still no logo/icon work — leave it alone.
- Home and My Conduits are built for real in their zero-state (see Steps 6–7) — not throwaway placeholders. Their *populated* states (real Conduits, real stats) are Task 3. Conduit Workspace isn't built at all here.

---

## Screens This Task Builds (15)

1. Splash · 2. Login · 3. Sign Up (collapsed/expanded — same screen) · 4. Verification · 5. Welcome · 6. Home (zero-state) · 7. My Conduits (zero-state) · 8. Profile · 9. Edit Profile · 10. Security Access entry · 11. Security Details · 12. Waiting for Approval · 13. Forgot Password · 14. Reset Verification Code · 15. New Password

---

## Steps

### 1. Splash Screen
Logo, "AgroLease," "Loading..." — brief branded loading state while the session check resolves. Routes to Login (no session) or Home (active session).

### 2. Supabase Auth setup
- Enable **Email + Password** provider
- Enable **Phone + Password** (phone as an identifier with password auth, not OTP-only)
- Enable **Google OAuth** provider
- Both email and phone signups still get a one-time verification code (Step 4) to confirm ownership of the contact method — separate concern from password auth

### 3. Login
- **Email or Phone** (single field — detect format client-side: contains `@` → email, else → phone)
- **Password**
- **Sign In** button
- **Continue with Google** and **Security Access** — same row, equal visual weight
- **Forgot Password** (link → Step 13)
- **Don't have an account?** (link → Sign Up)

### 4. Sign Up (collapsed → expanded, same screen, no new page)
Collapsed state:
- **Display Name** (single field — no first/last split)
- **Email** (required)
- **Password**
- **Confirm Password**
- **Continue** button
- **Continue with Google** and **Security Access** — same row as Login
- **+ Add Phone Number** — slides open a Phone field inline, same screen, no navigation

Expanded state: same screen, Phone field visible. Optional — Continue works with or without it.

On **Continue**: create `auth.users` (email+password), write the initial `profiles` row (`display_name`, phone if provided, `id` FK, `country_code` = active row from `country_config` — never hardcoded), generate the Profile ID (reveal at Welcome), route to Verification.

**Google sign-in:** skip Verification entirely — OAuth already proves email ownership. Still offer optional Phone + Display Name if missing, then straight to Welcome.

### 5. Verification
- Email: "Enter 6-digit code," **Verify**
- Phone: standard OTP entry
- On success: mark confirmation, route to Welcome

### 6. Welcome
Transition screen — auth is over, visual language changes to the main app shell from here on.
- Checkmark icon, "Welcome!"
- "Your Profile ID" with the auto-generated value (`user` + 4 digits, uniqueness-checked, retry up to 10x) and inline **[edit]**
- **Continue** → Home

### 7. Home (zero-state, built for real)
Green header, avatar, "Welcome / What are you doing today?", hamburger menu. Per Amendment 8, this is the real post-auth landing screen:
- **My Conduits (0)**, **Pending (0)**, **Recent Activity (0)**, **Pending Invitations (0)** cards
- **Generate Conduit ID** CTA — exists and routes correctly, can be non-functional pending Task 3
- General/browsable **Live Commodity Prices** widget (country + crop selector)
- **Link Security** and **Browse Listings** shortcuts
- Bottom tab bar: Home / My Conduits / Create / Messages. **Create and Messages tabs route to simple placeholder stubs until Tasks 3 and 10 respectively** — don't leave them dead with no destination, and don't build out full Create or Messages functionality here. A bare "Coming soon" screen for each is enough.

### 8. My Conduits (zero-state, built for real)
Per Amendment 8 — a pure list, nothing else, no stats repeated from Home:
- "You don't have any conduits yet" + **Generate** / **Enter ID** buttons
- Search bar renders but has nothing to search yet
- Populated-list state (real Conduits) is Task 3's job — this task only needs the empty state + correct routing target

**Not in this task:** Conduit Workspace. Nothing to tap into until Task 3 creates a real Conduit — don't build a placeholder with nowhere to be reached from.

### 9. Profile (view)
Same green header/shell as Home. "My Profile" title. White content card: Display Name, Email, Phone, Profile ID. No Role field. **Edit** → Step 10.

### 10. Edit Profile
Same app shell (not the dark login-card style). Fields: Display Name, Email, Phone. **Save** → back to Profile.

### 10–12. Security Access (fully independent flow — not nested inside Sign Up)
Reachable from both **Login** and **Sign Up** via the "Security Access" button.

- **Entry:** "Verify Your Access" — **Security Access Code** field + **Continue**, or **Scan Access QR Code**. Deep link `agrolease://link/{code}` lands here directly, code pre-filled.
- **Security Details:** full name + phone — **cannot be skipped**. Creates a `security_officers` row: `status = pending_approval`, `link_code_used = {code}`, `device_info` captured.
- **Waiting for Approval:** "You're linked. Waiting for approval from both parties." (Full approval workflow is Task 5; gate logging UI is Task 6.)
- A person with a full account can also complete this on their own Conduit — no blocking logic (common on small farms).

### 13–15. Forgot Password (fully independent flow)
- **Forgot Password:** "No worries! Enter your email or phone and we'll send you a reset link." — field, **Send Reset Link**, or **Reset via SMS**.
- **Reset Verification Code:** enter the code.
- **New Password:** set + confirm → back to Login.

---

## Test Before Marking Complete

- [ ] Splash routes correctly (Login vs. Home) based on session state
- [ ] Sign up with email + password works end to end, including "+ Add Phone Number" inline expansion (same screen, no navigation)
- [ ] Sign up with phone + password works end to end
- [ ] Google OAuth sign-in works, skips Verification, still offers optional phone + Display Name if missing
- [ ] Email code and phone OTP both work correctly depending on signup method
- [ ] No Role Selection screen exists anywhere in this flow
- [ ] Welcome shows the correct auto-generated Profile ID; inline edit enforces format + uniqueness
- [ ] Returning user with an active session goes straight to Home, never back through auth
- [ ] Home's zero-state renders all four cards at 0, Generate Conduit ID CTA exists and routes correctly
- [ ] My Conduits zero-state renders correctly with Generate/Enter ID buttons
- [ ] Profile view shows correct Display Name, Email, Phone, Profile ID — no Role field
- [ ] Edit Profile saves changes correctly
- [ ] Security Access reachable from both Login and Sign Up, and via `agrolease://link/ABC123` deep link (code pre-filled)
- [ ] Security Access supports both manual code entry and QR scan
- [ ] Security Details blocks submission until both name and phone are filled in
- [ ] Submitting Security Details creates a `security_officers` row with `status = pending_approval`
- [ ] A logged-in account holder can complete Security Access on their own Conduit without being blocked
- [ ] Forgot Password works via both the reset-link path and "Reset via SMS"
- [ ] `country_code` on new profiles is pulled from `country_config`, never hardcoded
- [ ] `profiles.account_role` does not exist in the schema

---

## When Done

Update `task_app_progress.md` in the repo root:
- Mark **Task 2** as ✅ **Complete & Confirmed**, today's date, one line on what was tested and verified.
- If anything above fails or can't be finished, mark it ⚠️ **Blocked** instead, with the specific error and what's needed to unblock — do not mark it Complete.

Then stop and report back: what's live, what was tested, and anything that needs a decision before Task 3.
