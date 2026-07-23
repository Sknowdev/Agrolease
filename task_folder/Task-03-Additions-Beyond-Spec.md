
# Task 3 — Additions Beyond the Original Brief

**Written:** 2026-07-21. **Why this file exists:** same reason as `Task-02-Additions-Beyond-Spec.md` — `Task-03-Conduit-Creation-Invitation.md` is the authoritative brief, but real usage this session (the founder actually using the app, not just code review) surfaced genuine gaps and explicit requests the brief never mentioned at all. This file lists every one of them separately from the brief's own checklist, so:

1. Nobody mistakes "not in the original brief" for "not needed" and rips it back out later.
2. Task 4 (and beyond) can see clearly what's already been decided vs. what's still open.
3. The founder or a future agent can tell at a glance what was *requested mid-session* vs. what's *actually specified* in the numbered task brief.

Nothing below contradicts the brief or any Amendment — everything here either fills a real gap the brief left open, fixes a real bug found through live usage, or is explicit developer-experience tooling requested directly.

---

## 1. Session-expiry recovery in `lib/apiClient.ts` (real bug fix, not a feature request)

**Not in the brief, and not specific to Conduits at all** — this is a Task 2-era gap (the shared API client) that Task 3's own usage (linking two real accounts together) was the first thing to actually trigger and expose.

**What was built:** any 401 response from the backend now triggers an automatic sign-out + redirect to `/login`, instead of the app silently retrying the same dead session forever with no way out. See `task_app_progress.md`'s Task 3 session-update entry (2026-07-21) for the full root-cause account.

**Why this belongs here and not purely in Task 2's files:** it was found and fixed while working Task 3, and it directly affects every screen this task's Home/My Conduits/Workspace upgrades depend on (`apiGet`/`apiPost`/`apiPatch`/`apiDelete`) — a future task shouldn't assume this fix is Task 2-scoped and accidentally revert it while touching auth code.

## 2. Back button fallback in `components/ui/AppShell.tsx` (real bug fix)

**Not in the brief.** `showBackButton`'s `router.back()` call now checks `router.canGoBack()` first and falls back to `/home` — a real Expo Router web quirk (silently no-ops with nothing in history), not a design choice. Affects every screen using `AppShell`'s `showBackButton`, not just Conduit screens specifically.

## 3. Metro dev-server proxy for the backend (`metro.config.js`) — Codespaces networking fix

**Not in the brief — infrastructure/tooling, not a product feature.** GitHub Codespaces requires the backend's own forwarded port to be manually set to Public after every restart, which kept failing to register reliably from inside this environment. Rather than keep fighting that manually, `metro.config.js` now proxies `/v1/*` and `/health` requests through Metro's own dev server (port 8081) straight to the local backend (port 4055) using a plain Node `http` request — no new dependency. `constants/config.ts`'s `resolveApiBaseUrl()` points the web build at its own origin instead of a separate backend URL. **Only port 8081 needs to be public now, not both.** Native builds are unaffected (they never go through Metro's dev server at request time).

**Do not remove this thinking it's dead code** — it is the reason `expo start --web` works at all in this Codespace without fighting port visibility on two separate ports every session.

## 4. `npm run dev` — combined backend + Metro startup script

**Not in the brief.** `scripts/dev-all.js` (plain Node `child_process`, no new dependency like `concurrently`) starts both the backend and `expo start --web` together with prefixed output, stopped together on Ctrl+C. Wired as `npm run dev` at the repo root.

**Why:** explicit founder request after repeated confusion from needing two separate commands after every Codespace restart (which destroys all running processes, since nothing survives a restart in this sandbox — a limitation of the environment, not the app).

## 5. My Conduits: hamburger menu removed, replaced with per-row 3-dot Edit/Delete menu

**Not in the brief.** The brief only specifies My Conduits as a pure list (Amendment 8) with rows that tap through to the Workspace — no per-row actions, no edit/delete affordance anywhere in Task 3's own text.

**What was built (explicit founder request):**
- `AppShell`'s hamburger menu is hidden on My Conduits specifically (`hideMenu`) — every other screen (Home, Recent Activity, the Conduit creation flow, etc.) is unaffected.
- Each row now has its own `⋮` button opening a small menu: **Edit Conduit** and **Delete Conduit**.
- **Edit Conduit** → `app/conduit/edit.tsx` (new) — a single combined screen for Land Information, Farm Boundary, and (only while still `draft`) Invitation Expiry, reusing the exact same backend routes the creation flow already uses. This is explicitly the "change anything you can do during creation" screen the founder asked for, in one place rather than three separate creation-flow screens.
- **Delete Conduit** → confirms, then calls the new `DELETE /v1/conduits/:id` backend route (hard delete — safe at this stage of a Conduit's lifecycle since nothing else references it yet).

**Do not confuse this with the Conduit Workspace's own plain "Edit" link on its Land Information card** (Step 10 of the original brief, `app/conduit/edit-land.tsx`) — that one is unchanged, still land-only, still exactly as the brief specifies. The new `edit.tsx` is a *different*, broader entry point reached from My Conduits' 3-dot menu, not a replacement for the Workspace's own affordance.

## 6. Backend route: `DELETE /v1/conduits/:id`

**Not in the brief.** Added to support item 5's Delete Conduit action. Requires the caller to be a party on the Conduit (same `assertOwnsConduit` check every other Conduit route uses). Hard-deletes the row.

**Updated 2026-07-22 — real bug found via a full end-to-end test, not just re-testing the original report:** the first version of this route failed with a 500 (a real Postgres FK violation) on any Conduit that already had a `notifications` row against it (i.e. anything past `draft`) — `notifications.conduit_id` references `conduits.id` with no cascade. Fixed by deleting this Conduit's own `notifications` rows first (safe, purely informational), **and** by defensively checking every other table that references `conduits(id)` per the schema (`security_officers`, `link_codes`, `harvest_records`, `invoices`, `disputes`, `messages`, `agreement_change_log`, `fixed_term_overwrites`, `trust_scores`, `satellite_reports`, `conduit_sub_parcels`, `land_utilization_snapshots`) — if any of those already has a real row, the delete is now blocked with a clear `409 conduit_has_dependent_records` instead of a 500 or a silent cascade through data this task doesn't own. This is not hypothetical: Task 2's own live Security Access flow can write real `security_officers`/`link_codes` rows against a real Conduit today, and this was verified live against exactly that case. **A future task adding real activity against an `active` Conduit should still reconsider whether a hard delete is ever appropriate at that lifecycle stage** — the dependent-records check will correctly block it, but an archive/cancel flow is probably the right UX once that happens, not a delete attempt that always 409s.

## 7. Password management (My Profile) — new feature, not in the brief

**What was built:** `app/profile/password.tsx` (new) + a "Change Password" button on My Profile. Two modes depending on whether the account already has a password (`session.user.app_metadata.providers.includes('email')` — confirmed live against a real Google-only account, not guessed): a no-password account (e.g. Google-only) sets one directly via `updateUser({ password })` using only the existing session; an existing-password account must re-authenticate with its current password (via `signInWithPassword`, since Supabase's `updateUser` has no old-password check of its own) before the new one is accepted.

**Why this belongs here:** explicit founder request, investigated and built in the same session as several Conduit-flow fixes. Not a Conduit feature, but touches the same shared auth/profile infrastructure Task 3 already depends on.

## 8. Live Profile ID / username availability check — new feature, not in the brief

**What was built:** `GET /v1/profiles/check-id?profileId=X` (new, read-only, backed by a `checkProfileIdAvailability()` helper shared with the existing save-path validator) + a 400ms-debounced live check on both places a Profile ID is edited (My Profile's inline editor, and the post-signup Welcome screen's `[edit]` flow) — shows "Available" or the specific taken/invalid reason before the user ever hits Save, instead of only finding out via a 409 after submitting.

## 9. Header navigation redesign: "My Profile" moved out of the hamburger, onto the avatar

**What was built:** `AppShell`'s hamburger menu no longer lists "My Profile" (now only Refresh/Log Out/Delete Account). The avatar circle opposite the hamburger (previously a static icon) is now a real tappable shortcut to `/profile`. Scoped visually to Home only — My Conduits already uses `hideMenu` from item 5 above and never showed this pattern.

## 10. `lib/confirm.ts` — `Alert.alert` replacement, used everywhere

**Not in the brief, and not Conduit-specific at all — a foundational fix.** `react-native-web`'s `Alert.alert` is a complete no-op (confirmed directly in its source: `static alert() {}`) — this silently broke every confirm dialog AND every single-button error/success message across the entire app on web, the one platform this project is actually tested on. `confirmAction()` (multi-button confirm) and `notify()` (single-message alert) are the correct, cross-platform replacements — native still uses the real `Alert.alert`, web falls back to `window.confirm`/`window.alert`. **Every single `Alert.alert` call in the codebase has been replaced with one of these two** — do not reintroduce a raw `Alert.alert` call anywhere; it will silently do nothing on web.

---

## 11. Conduit Workspace dashboard redesign (2026-07-22) — matched to the real reference image, not guessed

**Not a re-guess of the original Step 10 build.** The original Step 10 implementation (header, Partner card, Land Information card, then six generic gray "Coming in Task X" placeholder rows) was built without ever having seen the actual Conduit dashboard mockup — this was flagged mid-session rather than assumed. Two images that looked plausible from context (`IMG_1332.jpeg`, `image_EDFFD7FA-269D-46FB-9949-74C038E9B481.jpeg`) were re-checked directly and confirmed to be the bottom tab bar mockup and the 9-screen Login→Profile sheet respectively — **neither is the Conduit dashboard**. The real one is `app_refrence.png/IMG_1365.jpeg` (a live phone photo of the actual running dashboard), confirmed by viewing it directly before writing any code.

**What changed in `app/conduit/[id].tsx`:**
- Partner card redesigned: partner name + a Trust Score row (shows "Not yet available", not a fake percentage — no `trust_scores` read path exists yet) + a row of 5 icon shortcuts matching the reference exactly: **Message** → `/coming-soon/messages`, **Add Record** → `/coming-soon/add-record` (new stub), **Agreement** → `/coming-soon/agreement` (new stub), **Land** → the existing `edit-land.tsx` (the one shortcut with a real destination), **Security** → the existing `/coming-soon/link-security`.
- The six gray placeholder rows were replaced with six colored icon-chip cards in a 2-up grid, matching the reference's actual card set and explicit naming: **Land Information** (real data, unchanged source), **Live Commodity Price** (kept as a "Coming soon" state — same reasoning as Home's identical card, per the Constitution's "never call price APIs directly from the mobile app" rule), **Harvest Records**, **Invoice**, **Security Information** (all three: honest zero-state, no backing read route exists yet), and **Add-on** — this is the reference's own "Additional Activation" card, **renamed to "Add-on" per explicit instruction** ("please don't use the name additional activation instead call it add-on").
- **Activity Timeline** is now its own full-width card at the bottom (was previously just another gray placeholder row) — still an honest empty state, no activity-log table/route exists yet.
- Two new Coming Soon stubs added: `app/coming-soon/add-record.tsx`, `app/coming-soon/agreement.tsx` — same pattern as the existing `link-security.tsx`/`messages.tsx`/`browse-listings.tsx`.

**Verified:** `tsc --noEmit` clean, `expo export --platform web` clean bundle. Backend (4055) and Metro (8081) both confirmed still healthy after the change.

**⚠️ UPDATE — end of the same session, live re-check by the founder:** the card content/set is confirmed right, but the founder reported the actual **arrangement** ("looks good but not the same arrangement") still doesn't match `IMG_1365.jpeg` closely enough. No specifics given yet (which section, what's positioned differently) before the session ended — **do not guess a layout change**; get a specific description or a fresh side-by-side comparison from the founder first next session.

**For whoever picks this up next:** when Harvest Records / Invoice / Security Information / Trust Score get real backend read routes in their respective later tasks, wire those numbers into these same six cards in `[id].tsx` — don't build a second/parallel dashboard. The card shells, colors, and icon choices are intentionally already matched to the reference; only the zero-state placeholder content inside each needs to be swapped for real data. **Also get the founder's specific arrangement feedback before touching layout again** — the previous round was built from a single static photo with no chance to iterate live before this session ended.

---

## For Task 4 and beyond: what NOT to accidentally redo

- Don't re-add a hamburger menu to My Conduits — the per-row 3-dot menu (item 5) is the intentional, current design for that screen.
- Don't re-build a combined "edit everything" Conduit screen — `app/conduit/edit.tsx` already exists and covers Land Information, Farm Boundary, and Invitation Expiry.
- Don't remove `metro.config.js`'s proxy or revert `constants/config.ts`'s `resolveApiBaseUrl()` thinking it's an accidental leftover — it's load-bearing for this Codespace's networking (item 3).
- Do keep using `apiGet`/`apiPost`/`apiPatch`/`apiDelete` from `lib/apiClient.ts` as-is for any new authenticated call — the 401-recovery behavior (item 1) is automatic and requires no per-call opt-in.
- Don't reuse `DELETE /v1/conduits/:id` as-is once real downstream data can exist on an `active` Conduit without reconsidering whether a hard delete is still the right UX (see item 6) — the dependent-records check will correctly block it either way, so nothing breaks, but a future task should probably build an archive/cancel flow instead of relying on this route 409-ing forever.
- Don't re-add password management or a Profile-ID availability check — both already exist (items 7 and 8).
- Don't re-add "My Profile" to the hamburger menu — it's intentionally on the avatar now (item 9).
- **Never call `Alert.alert` directly anywhere in this codebase** — use `confirmAction`/`notify` from `lib/confirm.ts` (item 10). A raw `Alert.alert` call will compile fine and silently do nothing at runtime on web.
## 12. ⚠️ END-OF-SESSION FLAG (2026-07-22, same day as item 11) — 2 previously-verified fixes reported still failing live; dashboard arrangement not yet matching the reference

**Do not treat items in this file (or in `task_app_progress.md`) as "done" just because they're documented as fixed and `tsc`/`expo export` were clean when written.** Right at the end of this session, the founder did a real live re-check and reported, in the same message:

1. **Header back button still not working** — same symptom as the "Real bug fix" documented in `task_app_progress.md`'s 2026-07-22 entry, item 1 (`app/index.tsx`'s `hasRoutedRef` guard). That code is genuinely present (re-confirmed by re-reading the file after this report came in) — but it's being reported as still broken live, right now.
2. **Profile-icon tap still not routing to `/profile`** — same symptom as item 9 in this file (`AppShell.tsx`'s avatar `Pressable`). Also genuinely present in code, also reported still broken live.
3. **Conduit Workspace arrangement still doesn't match `IMG_1365.jpeg`** closely enough, despite the card content/set (item 11) being confirmed correct. No specifics given yet.

**Explicitly NOT investigated or fixed this session** — the founder's own usage window ended right as this was reported, and gave direct instruction not to address it now. This item exists so nobody assumes items 1/9 in this file are actually working just because the code and docs say so.

**Most likely explanation, to check FIRST next session before writing any new code:** a stale Metro bundle / browser cache / an old backend or Metro process still running from before these fixes landed — since both symptoms were independently coded, doc'd, and verified via `tsc`/`expo export` earlier in this exact same session, then reported broken again immediately after, without an intervening code change that could have reintroduced either bug. Confirm the actual bundle being tested is current (hard-reload, check Metro's own build timestamp/log, restart both processes fresh) before assuming either fix was wrong and writing a second, different fix on top of it.
