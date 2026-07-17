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
| 1 | Project Scaffolding + Full Database Schema | 🔲 Ready | — | Brief attached: `Task-01-Scaffolding-Database.md` |
| 2 | Auth + Profile ID | 🔲 Ready (Revised v5) | — | 15 screens — Home and My Conduits built as real zero-states per Amendment 8; Conduit Workspace excluded (nothing to open until Task 3). Role Selection removed per Amendment 7. Awaiting answer on PIN/Biometrics scope. |
| 3 | Conduit Creation + Invitation | ⬜ Not Started | — | — |
| 4 | Paystack Payment + Entitlement Engine Core | ⬜ Not Started | — | Auto-renewal design resolved in Amendment 10 (per-party, card-only, mixed auto/manual states expected) — build against that when this task is written. |
| 5 | Security Officer System | ⬜ Not Started | — | — |
| 6 | Gate Logging + Harvest Records | ⬜ Not Started | — | Weight fully optional at gate, resolved in Amendments doc (6). No `weight_status` column — null `weight_tonnes` + ⚠️ icon is the signal. Later weight entry uses standard edit/audit trail, no tamper carve-out. New `weight_agreement_status` column. Invoice (Task 7) still waits for weight to exist before generating. |
| 7 | Invoice + Negotiation | ⬜ Not Started | — | — |
| 8 | Dispute Workflow | ⬜ Not Started | — | — |
| 9 | Trust Score | ⬜ Not Started | — | — |
| 10 | Notifications | ⬜ Not Started | — | — |
| 11 | Agreement Rules + Fixed-Term Lock + Sponsorship Verification Providers | ⬜ Not Started | — | — |
| 12 | Spatial Conduit Engine | ⬜ Not Started | — | — |
| 13 | Satellite & Weather Intelligence | ⬜ Not Started | — | — |
| 14 | AI Price Estimation Bot (was: Scraping Bot) | ⬜ Not Started | — | Pivoted from country-specific scrapers to LLM + web search (2–3 sources, confidence-flagged). Requires small schema patch to `commodity_prices` (entered_by enum + sources_consulted + confidence columns) before this task starts. |
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
- Logo/brand assets are already in the repo (`App_logo.png` + companion file). No task in this list should generate, replace, or touch those.
