# TASK 2 — Auth + Profile ID

> ⚠️ **REVISED.** Role selection (Step 6) was added after this task was already handed off. If your agent already ran the original version, it needs to come back and add Step 6 + the updated tests below — everything else is unchanged.

Hand this file to your coding agent as-is. This is the first user-facing flow — it depends on Task 1's schema and deployed backend already being live.

---

## Objective

Get a person from "opens the app" to "authenticated, has a Profile ID, has declared what kind of user they are, correctly routed" — phone OTP as the primary path, email as fallback, and the three app entry states wired up. No dashboard content, no Conduit logic yet — those are Task 3 onward.

## Before You Start

- **Confirm Task 1 is marked ✅ Complete & Confirmed in `task_app_progress.md` before starting.** This task writes into the `profiles` and `security_officers` tables — if Task 1 isn't actually finished, stop and report that instead of proceeding.
- **Run this schema patch first**, if not already applied:
  ```sql
  ALTER TABLE profiles ADD COLUMN account_role text
    CHECK (account_role IN ('land_owner','farm_operator','cooperative','land_agent'));
  ```
- **Farmer / Laborer / Crop Farmer are explicitly OUT of scope for this task.** Unlike Security Officers, nobody's defined what those roles actually do inside the app yet — don't invent a flow for them. They're a future task once that's decided.
- Still no logo/icon work — that's done, leave it alone.
- The Dashboard and full gate-logging screen are not built here. Where this task needs to land a user somewhere those features live, use a simple placeholder screen (details below) — don't build ahead into Task 3/5/6 scope.

## Steps

1. **Supabase Auth:** enable Phone (OTP) as the primary provider, Email as fallback.
2. **Login screen:** phone number entry → send OTP → OTP verification screen.
3. **Email fallback:** reachable via a "Use email instead" link from the login screen.
4. **Profile ID auto-generation** on first successful sign-in: pattern `user` + 4 random digits (e.g. `user4821`). Check uniqueness against `profiles.profile_id`; retry on collision up to 10 times, then fall back to a longer random suffix if still colliding.
5. **Write the `profiles` row** on first sign-in: `id` (FK to `auth.users`), `profile_id`, `phone` or `email`, `country_code` = the active row's `country_code` from `country_config` (query it — `SELECT country_code FROM country_config WHERE active = true LIMIT 1` — do not hardcode `'NG'` as a literal string, even though Nigeria is the only active row today), `kyc_verified = false`, `expo_push_token = null` initially.
6. **Role selection screen** — mandatory, immediately after first-time Profile ID assignment, before any dashboard access:
   - Single-select: **Land Owner**, **Farm Operator**, **Cooperative**, **Land/Lease Agent (In-Charge)** — one-line description under each (e.g. "Cooperative — representing multiple members' land or farming operations")
   - Cannot be skipped on first login. Updates `profiles.account_role`.
   - Returning users who already have `account_role` set skip straight past this screen.
   - This is descriptive, not a permission gate — it doesn't decide which side of a Conduit someone ends up on (that's Task 3, per-Conduit).
7. **Three entry states** — routing logic at the app root:
   - **No session + no deep link →** Login screen
   - **No session + `agrolease://link/{code}` deep link →** Security Officer onboarding (see below) — skips login and role selection entirely
   - **Active session + `account_role` set →** Dashboard placeholder screen (just show "Logged in as {profile_id} · {account_role}" — real dashboard UI is Task 3)
   - **Active session + `account_role` null** (shouldn't happen after Step 6, handle defensively) → Role selection screen
8. **Security Officer onboarding flow** (Stage 1 — Link only; approval mechanics are Task 5):
   - Officer arrives via deep link or manually enters a code
   - Collect full name + phone — **cannot be skipped**
   - Create a `security_officers` row: `status = pending_approval`, `link_code_used = {code}`, `device_info` captured
   - Land on a placeholder confirmation screen: "You're linked. Waiting for approval from both parties." (Full gate logging UI ships in Task 6; full approval workflow ships in Task 5.)
   - **A person who already has a full account (logged in as Land Owner/Operator/etc.) can also link themselves as a Security Officer on their own Conduit** — this is common on small farms with no separate hired guard. Don't build any detection/blocking logic to prevent this; the two records (`profiles` and `security_officers`) are independent and having both is expected, not an edge case to guard against.
9. **Profile edit screen:** view/edit Profile ID (alphanumeric + hyphens, 3–20 characters, uniqueness against `profiles.profile_id`) and view/change `account_role`. Changing `account_role` is **frictionless** — no warning or confirmation step, even if the person already has active Conduits. It's descriptive metadata, not a permission gate (see Amendment 4), so there's nothing for a role change to break.
10. **Push notification permission:** request on first successful login. Store the returned Expo push token to `profiles.expo_push_token`. Storage only for now — no notifications are sent until Task 10.

---

## Test Before Marking Complete

- [ ] OTP sign-in works end to end (real or test phone number)
- [ ] Profile ID auto-generated and confirmed unique on first sign-in
- [ ] Editing Profile ID enforces both the format rule and the uniqueness check
- [ ] Email fallback sign-in works as an alternate path
- [ ] Role selection screen appears immediately after first Profile ID assignment, before the dashboard placeholder, and cannot be skipped
- [ ] Each of the 4 role options correctly sets `profiles.account_role`
- [ ] Returning user with `account_role` already set goes straight to the dashboard placeholder, never sees role selection again
- [ ] Role is viewable and editable from the profile edit screen
- [ ] Fresh install + `agrolease://link/ABC123` deep link routes straight to officer onboarding, bypassing login and role selection entirely
- [ ] Officer onboarding blocks submission until both name and phone are filled in
- [ ] Submitting officer onboarding creates a `security_officers` row with `status = pending_approval`
- [ ] Relaunching with an active session + role set goes straight to the dashboard placeholder, never back to login
- [ ] Push permission prompt appears after first login; token is saved to the profile row

---

## When Done

Update `task_app_progress.md` in the repo root:
- Mark **Task 2** as ✅ **Complete & Confirmed**, today's date, one line on what was tested and verified.
- If anything above fails or can't be finished, mark it ⚠️ **Blocked** instead, with the specific error and what's needed to unblock — do not mark it Complete.

Then stop and report back: what's live, what was tested, and anything that needs a decision before Task 3.
