# Gate Check — Collaborative Study Workspace

Build gate for `collaborative-study-workspace`. PR #3 (workspace data layer) and beyond MUST NOT ship until BOTH LVE-1 and LVE-2 are explicitly marked **PASSED** below. Failure of either gate returns the project to `sdd-explore` / `sdd-propose`.

## LVE-1 — Smoke Test Landing Interest

| Field | Value |
|---|---|
| Source | `GET /api/waitlist` (`{ count, groupInterestCount, ratio }`) |
| Target | `groupInterestSignups / totalWaitlistSignups > 15%` |
| Window | TBD — set when smoke test goes live |
| Current ratio | TBD — see `/api/waitlist` at time of evaluation |
| Status | **PENDING** |

**Pass criteria**: `ratio > 0.15` over the experiment window.
**Fail criteria**: `ratio < 0.10` → pivot (groups are Phase 3+, individual first).

## LVE-2 — Concierge MVP Manual Coordination

| Field | Value |
|---|---|
| Source | Operator-recorded evidence artifact (spreadsheet / doc) |
| Target | `≥ 2 of 3` recruited groups prefer coordination surface over WhatsApp AND report measurable time savings |
| Groups recruited | 0 / 3 |
| Assignments completed | 0 / ≥ 2 per group |
| Evidence artifact path | TBD |
| Status | **PENDING** |

**Pass criteria**: At least 2 of 3 groups report pairwise preference for the coordination surface (Google Sheet / simple Kanban) over their existing WhatsApp-only flow, plus measurable time savings vs baseline.
**Fail criteria**: 1 of 3 (or fewer) prefer the coordination surface → pivot (collaboration is a different problem; explore peer comparison / analytics instead).
**Inconclusive**: Fewer than 3 groups complete the 2-assignment minimum → recruit replacements before re-running.

## Gate Decision

| Gate | Status | Decided on | Decided by |
|---|---|---|---|
| LVE-1 | PENDING | — | — |
| LVE-2 | PENDING | — | — |

**Proceed to PR #3 (workspace data layer)?** **NO** — both gates must PASS first.

## Change Log

- 2026-06-22 — Gate artifact created. Both gates PENDING. PR #1 (smoke test) ships; data begins accumulating.
