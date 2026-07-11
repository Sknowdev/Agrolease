# AgroLease — Task & App Progress Tracker

**This file is a living document.** Every coding agent that completes a task updates its row here — status, date, and what was actually verified — before ending its turn. Nothing gets marked Complete without passing the test criteria stated in that task's brief.

---

## How This Works

1. Each numbered task below has (or will have) its own brief: `Task-01-....md`, `Task-02-....md`, etc., in the same repo location as this file.
2. Hand the agent **one task file at a time** — not this whole tracker. The task file is self-contained.
3. When the agent finishes, it must update this tracker before stopping: change the status, add today's date, and write one line on what was tested and confirmed working.
4. If something can't be finished or a test fails, the agent marks it **⚠️ Blocked** with the specific error/reason — never marks it ✅ Complete to move past a failure.
5. When a task is confirmed ✅ here, tell the founder — the next task's brief gets generated from this tracker + the original planning docs, matching what actually got built (not just what was planned).

## Status Legend

| Symbol | Meaning |
|---|---|
| ⬜ Not Started | Brief not yet generated / not yet handed to an agent |
| 🔲 Ready | Brief exists, waiting to be run |
| 🟡 In Progress | Agent is actively working this task |
| ⚠️ Blocked | Attempted, something failed — see notes |
| ✅ Complete & Confirmed | Built, tested against the brief's checklist, verified working |

---

## Task Index

| # | Task | Status | Last Updated | Notes / What Was Verified |
|---|---|---|---|---|
| 1 | Project Scaffolding + Full Database Schema | 🔲 Ready | 2026-07-10 | Brief aligned with confirmed decisions (see `docs/CHANGE_LOG_PRODUCT_PLAN.md`): Railway dropped project-wide, extend existing Supabase project via additive migration, logo corrected to root `/logo.png`, source-masking policy reaffirmed. Not yet built. |
| 2 | Auth + Profile ID | ⬜ Not Started | — | — |
| 3 | Conduit Creation + Invitation | ⬜ Not Started | — | — |
| 4 | Paystack Payment + Entitlement Engine Core | ⬜ Not Started | — | — |
| 5 | Security Officer System | ⬜ Not Started | — | — |
| 6 | Gate Logging + Harvest Records | ⬜ Not Started | — | — |
| 7 | Invoice + Negotiation | ⬜ Not Started | — | — |
| 8 | Dispute Workflow | ⬜ Not Started | — | — |
| 9 | Trust Score | ⬜ Not Started | — | — |
| 10 | Notifications | ⬜ Not Started | — | — |
| 11 | Agreement Rules + Fixed-Term Lock + Sponsorship Verification Providers | ⬜ Not Started | — | — |
| 12 | Spatial Conduit Engine | ⬜ Not Started | — | — |
| 13 | Satellite & Weather Intelligence | ⬜ Not Started | — | — |
| 14 | Scraping Bot (FMARD) | ⬜ Not Started | — | — |
| 15 | Admin Price Panel | ⬜ Not Started | — | — |
| 16 | Legal Readiness Export | ⬜ Not Started | — | — |
| 17 | Discovery & Matchmaking Network | ⬜ Not Started | — | — |
| 18 | Coming Soon States (hardware/AI-dependent only) | ⬜ Not Started | — | — |
| 19 | Full End-to-End Regression Test | ⬜ Not Started | — | — |
| 20 | App Store + Play Store Submission | ⬜ Not Started | — | — |

---

## Notes for Whoever Picks This Up

- This numbering follows the original Agent Build Brief's phase order, with two additions: **Task 16 (Legal Readiness)** and **Task 17 (Discovery)** are now real build tasks, not "Coming Soon" placeholders — per the Year-1 "ship everything" decision. Task 18's Coming Soon list shrank accordingly — it now only covers things that genuinely can't ship without hardware or a trained AI model (weighbridge, AI geospatial matching, AI crop stress analysis, historical time-lapse, Planet Labs upgrade).
- Task 4 folds in the Entitlement Engine core (not just Paystack) because the Sponsorship overlay doc requires the payment wall to check entitlement status from day one, not be retrofitted later.
- **Logo — corrected 2026-07-10:** the real logo is `/logo.png` at the **repo root** (not `App_logo.png` — that name doesn't exist in this repo). A *different* logo also exists at `web/public/logo.png`, belonging to the public price website — do not use that one for the mobile app. No task in this list should generate, replace, or touch either file.
- **This repo also contains a separate, already-shipped product** — the public price website (`/web`, `/scraper`, deployed on Vercel + Supabase) — built before Task 1 started. See `docs/CHANGE_LOG_PRODUCT_PLAN.md` for the full account of what it is, why it exists, and every place its decisions (stack, sourcing, schema) diverge from these task briefs' original assumptions. Task 1 has already been edited to account for it (extends the same Supabase project via an additive migration, doesn't touch the existing `country_config` rows). Read that change log before starting any task that touches shared infrastructure (Supabase project, `country_config`, hosting).
- **Railway is dropped project-wide** (not just for the price website) — see `docs/CHANGE_LOG_PRODUCT_PLAN.md`. Long-term hosting direction is AWS. Task 1's backend is built container-first (Dockerfile) specifically so this move is easy later.
