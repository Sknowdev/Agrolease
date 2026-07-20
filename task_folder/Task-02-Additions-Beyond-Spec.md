# Task 2 — Additions Beyond the Original Brief

**Written:** 2026-07-20. **Why this file exists:** `Task-02-Auth-ProfileID.md` is the authoritative brief, but real usage (the founder actually using the app, not just code review) surfaced genuine gaps the brief never mentioned at all — a dead hamburger icon with no menu, no way to see what "Recent Activity" actually was, no way to edit a Profile ID without a separate screen, etc. Building these wasn't scope creep — the app was functionally broken or unusable without them. This file lists every one of them separately from the brief's own checklist, so:

1. Nobody mistakes "not in the original brief" for "not needed" and rips it back out later.
2. Task 3 (and beyond) can see clearly what's already been decided vs. what's still open.
3. The founder or a future agent can tell at a glance what was *requested mid-session* vs. what's *actually specified* in a numbered task brief.

Nothing below contradicts the brief or any Amendment — everything here fills a real gap the brief left open, mostly around basic account-management affordances that any real app needs but Task 2's own checklist never explicitly asked for.

---

## 1. A real, working hamburger menu

**Not in the brief.** Task 2's brief mentions "hamburger menu" exactly once, in Home's own description ("Green header, avatar, ... hamburger menu"), with zero specification of what it should contain or do — Amendment 9's Conduit Settings `⋮` menu is a completely different, later-task menu.

**What was built:** a real menu (`components/ui/AppShell.tsx`) with three working items: **My Profile** (routes to `/profile`), **Log Out** (`supabase.auth.signOut()`, routes to Login), **Delete Account** (confirms, then calls a new `DELETE /v1/profiles/me` backend route that removes both the `profiles` row and the underlying `auth.users` account via the Admin API). Later in the session, **Refresh** was added as a fourth item (see #5 below), then the standalone header refresh button was removed per explicit instruction and folded into this same menu instead.

**Why:** the brief's own hamburger icon existed on Home from the first build, but did nothing when tapped — a real, tappable icon with no destination is worse than not having one, and Log Out/Delete Account are basic account operations every real user needs day one, not a "later task" concern.

## 2. Profile screen: placeholder editable avatar

**Not in the brief.** Task 2's Profile screen spec: "White content card: Display Name, Email, Phone, Profile ID." No mention of an avatar/photo anywhere in Task 2.

**What was built:** a circular placeholder avatar (person icon, small camera badge) at the top of the Profile screen, tappable — currently shows "Photo upload is coming soon" rather than doing nothing. Real upload needs a Supabase Storage bucket + signed-URL flow (per the Engineering Constitution's file-upload rules), which is out of scope for Task 2 and hasn't been built.

**Why:** the founder's own reference mockups (`app_refrence.png`) show an avatar circle in this position on the Profile screen; leaving it out would have been a visible gap against the design the founder actually wants, even though Task 2's text brief never mentions it.

## 3. Profile ID: tap-to-edit directly on the Profile screen (not just Welcome)

**Partially in the brief, extended beyond it.** The brief only specifies inline `[edit]` on the **Welcome** screen, right after signup. It says nothing about editing the Profile ID again later from the Profile screen itself.

**What was built:** the exact same edit capability, added to the **Profile** screen too — tap the Profile ID value directly (a pencil icon signals it's tappable), inline checkmark/X to save/cancel, no separate "[edit]" link. Welcomes's own `[edit]` link pattern was left untouched, since the brief explicitly specifies it there.

**Why:** explicit founder request — a Profile ID a user can only ever change once, immediately after signup, with no way back to it later, is a real usability gap once the app is actually used for more than a few minutes.

**Also changed beyond the brief:** the *editable* Profile ID format was relaxed from the brief's own `user` + exactly 4 digits pattern to a free-form 3–20 character username (letters/numbers/underscores) — explicit founder instruction ("make the profile id a unique username, not force number"). The *auto-generated* starting value at Welcome still uses the brief's original `user####` pattern; only the later edit path's validation changed.

## 4. Recent Activity: a real, minimal list screen

**Not in the brief.** Task 2's Home spec only ever asks for a "Recent Activity (0)" card showing a count — nothing about viewing what the activity actually is.

**What was built:** `GET /v1/notifications` (new backend route) and a new `app/recent-activity.tsx` screen — tapping the Recent Activity stat card on Home now navigates to a real list of the user's own notifications (title, body, timestamp), instead of a bare, untappable number.

**Why:** the count itself was always real (unread rows in the `notifications` table, never hardcoded), but a count with zero way to see what it represents is functionally useless once a user actually has activity to check — the founder correctly flagged this as unacceptable for "a production product," not a nitpick.

## 5. Manual refresh (menu item, not a header button/pull gesture)

**Not in the brief.** Never mentioned anywhere in Task 2.

**What was built (final form, after two iterations this session):** every screen using `AppShell` now supports an `onRefresh` prop; the actual UI surface for it is a **"Refresh" item inside the hamburger menu** (added, then relocated here from a standalone header icon per explicit instruction — see the earlier draft in git history if that context is ever needed). `useFocusEffect` already refetches automatically on navigation everywhere (see #6), so this is specifically for "I'm already on this screen and want to force a reload without navigating away and back."

**Why:** real backend/network failures were happening silently (see the Additions doc's sibling in `task_app_progress.md`'s bug list) with zero way for the founder to retry without leaving the screen. React Native Web also has no native pull-to-refresh gesture at all — a `RefreshControl` alone would have looked broken specifically in the environment this app is currently being tested in (`expo start --web`), so a real, always-working tap target was necessary, not just decorative.

## 6. Stale-data-on-navigation fix (`useFocusEffect` instead of `useEffect`)

**Not explicitly in the brief**, but arguably implied by "Returning user with an active session goes straight to Home" and general expected behavior — the brief just never anticipated that Expo Router keeps every visited screen mounted, so a plain one-time `useEffect` only ever fetched data once per app session, showing stale data forever after the first visit to Home, My Conduits, Profile, or Edit Profile.

**What was built:** all four screens switched to `useFocusEffect`, refetching real backend data every time the screen is navigated back to.

**Why:** this is closer to a bug fix than a feature addition, but it's listed here because it changed each screen's actual data-fetching lifecycle in a way the brief's text never anticipated or specified.

## 7. Back-button navigation (`showBackButton` on `AppShell`)

**Not in the brief.** Never mentioned.

**What was built:** `AppShell` gained a `showBackButton` prop — swaps the top-left avatar for a left-pointing arrow that calls `router.back()`. Applied to Profile and Edit Profile, which are reached by *pushing* on top of a bottom-tab screen and otherwise had zero way back besides the browser/OS back gesture.

**Why:** a real, reported usability gap — "there's no arrow button to navigate back."

## 8. Error visibility instead of silent failure

**Not in the brief**, and arguably a regression the brief's own text never anticipated: several screens originally had `.catch(() => setSomething(null))` — any backend failure looked identical to "nothing here yet," with zero diagnostic information, which directly caused a real, reported "everything is blank" incident this session that took real debugging to trace back to an actual data bug (see `task_app_progress.md`'s bug log, item on the signup data-loss issue).

**What was built:** Home, Profile, My Conduits, and Edit Profile now show a visible red error banner with the actual failure message when a load fails, instead of silently rendering an empty/blank state indistinguishable from "no data yet."

**Why:** silent failure is categorically worse than a visible one in a product meant for real users — a blank screen gives no signal to retry, report, or diagnose anything.

## 9. Home's stat cards are now tappable where they lead somewhere real

**Not in the brief** (the brief only specifies the four cards exist and show counts). "My Conduits" and "Recent Activity" cards now navigate to `/conduits` and `/recent-activity` respectively when tapped — "Pending" and "Pending Invitations" remain non-interactive since neither has a real destination screen yet (that's genuinely Task 3+ territory).

**Why:** explicit founder request that Home's "My Conduits" card point to the same screen the bottom tab bar's own My Conduits icon already goes to, for consistency.

---

## For Task 3 and beyond: what NOT to accidentally redo

Everything above is already built and working — Task 3's brief should not re-specify or rebuild any of it. Specifically:
- Don't re-build the hamburger menu shell — it exists, has Log Out/Delete Account/Refresh, and Task 3 (or a later task) can add more items to the same `MenuItem` pattern in `components/ui/AppShell.tsx` if a new global action is ever needed.
- Don't re-invent Profile ID editing — it exists on both Welcome (one-time, brief-specified) and Profile (repeatable, this file's #3).
- Don't treat "Recent Activity" as a zero-content stub needing a first real build — the list screen already exists; Task 6+ (harvest records, disputes, etc.) just needs to make sure their own `createNotification()` calls produce content that shows up meaningfully in the existing list, not build a new screen.
- Do keep using `useFocusEffect` (not `useEffect`) for any new screen that fetches data and can be navigated back to.
- Do keep the error-banner + menu-refresh pattern for any new screen `AppShell` wraps.
