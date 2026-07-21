
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

## 6. New backend route: `DELETE /v1/conduits/:id`

**Not in the brief.** Added to support item 5's Delete Conduit action. Requires the caller to be a party on the Conduit (same `assertOwnsConduit` check every other Conduit route uses). Hard-deletes the row — appropriate only because no downstream data (harvest records, invoices, security officers) can exist against a Conduit yet, since no later task has built any of that. **A future task that adds real activity against an `active` Conduit will need a different flow (archive/cancel, not a hard delete) for that case** — this route as written is correct for `draft`/`pending_payment` Conduits only, and should not be assumed to generalize once Task 6+ adds real downstream data.

---

## For Task 4 and beyond: what NOT to accidentally redo

- Don't re-add a hamburger menu to My Conduits — the per-row 3-dot menu (item 5) is the intentional, current design for that screen.
- Don't re-build a combined "edit everything" Conduit screen — `app/conduit/edit.tsx` already exists and covers Land Information, Farm Boundary, and Invitation Expiry.
- Don't remove `metro.config.js`'s proxy or revert `constants/config.ts`'s `resolveApiBaseUrl()` thinking it's an accidental leftover — it's load-bearing for this Codespace's networking (item 3).
- Do keep using `apiGet`/`apiPost`/`apiPatch`/`apiDelete` from `lib/apiClient.ts` as-is for any new authenticated call — the 401-recovery behavior (item 1) is automatic and requires no per-call opt-in.
- If a future task ever needs to delete a Conduit that has real downstream data, don't reuse `DELETE /v1/conduits/:id` as-is without reconsidering whether a hard delete is still correct at that point (see item 6's note).
