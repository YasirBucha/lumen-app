# Lumen — Runtime Harness Opportunity Audit

**Updated:** 2026-06-30  

A **runtime harness** = in-app orchestration: gather context → structured decision → route tools/actions → safety gates → user-visible result.

Lumen already has **product intelligence** (verdicts, evidence, price watch). A runtime harness would orchestrate **actions** (cancel, rescan, explain, batch review) with explicit approval — not replace the editorial UI.

---

## Opportunity 1 — Verdict copilot (explain + recommend)

| Field | Detail |
|-------|--------|
| **Idea** | User opens a sub → “Why this verdict?” → harness pulls evidence, usage, price history, overlaps; returns structured explanation + suggested action. |
| **User benefit** | Trust and faster decisions without reading raw evidence bullets. |
| **Where in app** | `SubDetail` screen; desktop `DeskSubPanel`. |
| **Reuse** | `Subscription.evidence`, `usage`, `priceIncrease`, `sharedWith`; future Gemini BYOK in `preferences.geminiApiKey`. |
| **Safety risks** | Hallucinated savings; wrong cancel advice. |
| **Start read-only?** | **Yes** — explanation only, no mutations. |
| **Approval gates** | None for read-only; any “change verdict” needs confirm. |
| **Complexity** | **Medium** |
| **Pilot rank** | **#2** |

---

## Opportunity 2 — Cancellation orchestrator

| Field | Detail |
|-------|--------|
| **Idea** | Extend `CancellationFlow` with harness: open merchant URL, track step completion, update ledger only after user confirms. |
| **User benefit** | Guided cancel with reclaimed PKR summary (already in prototype UI). |
| **Where in app** | `components/overlays/CancellationFlow` (port from `dashboard-cards.jsx`). |
| **Reuse** | `CancellationFlow` UI, `subStore.cancelledIds`, Firestore `cancellations/`. |
| **Safety risks** | Marking cancelled without user action; opening wrong URL. |
| **Start read-only?** | No — but **write gated**. |
| **Approval gates** | Step 2 “Yes, cancelled” required; no auto-write. |
| **Complexity** | **Low** (UI exists in prototype) |
| **Pilot rank** | **#3** |

---

## Opportunity 3 — Inbox scan agent (Gmail sync progress)

| Field | Detail |
|-------|--------|
| **Idea** | During `Scanning` screen, harness reports parse progress, merchant discoveries, errors; routes to parser registry + Gemini fallback. |
| **User benefit** | Transparency during long initial sync (5000 msg cap). |
| **Where in app** | `Scanning` screen; Firestore `gmail_accounts.status`. |
| **Reuse** | `functions/gmailSync.ts`, parser registry, `geminiParser.ts`. |
| **Safety risks** | Exposing email snippets in UI logs; token scope misuse. |
| **Start read-only?** | Progress display only first. |
| **Approval gates** | Gmail connect = explicit OAuth; Gemini = BYOK in Settings. |
| **Complexity** | **High** |
| **Pilot rank** | **#4** (after Phase 2 backend exists) |

---

## Opportunity 4 — Command palette agent (⌘K)

| Field | Detail |
|-------|--------|
| **Idea** | ⌘K not just search — intent routing: “subs over 5000 PKR”, “review streaming”, “export CSV”. |
| **User benefit** | Power-user navigation without hunting screens. |
| **Where in app** | `CommandPalette` overlay; `useKeyboard` hook already stubbed. |
| **Reuse** | `subStore`, `format.ts`, future CSV export from `sub-detail-extras.jsx`. |
| **Safety risks** | Bulk cancel/export without confirmation. |
| **Start read-only?** | **Yes** — search + navigate + filter only. |
| **Approval gates** | Destructive actions need second step. |
| **Complexity** | **Medium** |
| **Pilot rank** | **#1 recommended pilot** |

---

## Opportunity 5 — Price alert agent

| Field | Detail |
|-------|--------|
| **Idea** | On price-increase detection, harness summarizes impact, suggests Keep/Review/Cancel, optional FCM nudge. |
| **User benefit** | Proactive savings (core product promise). |
| **Where in app** | Dashboard `PriceIncreaseCard`; Alerts inbox; push (Phase 4). |
| **Reuse** | `priceIncrease` on subscriptions, `PriceIncreaseCard`, alerts prototype. |
| **Safety risks** | Notification fatigue; incorrect price parse. |
| **Start read-only?** | **Yes** — dashboard card only. |
| **Approval gates** | Push notifications opt-in in Settings. |
| **Complexity** | **Medium** |
| **Pilot rank** | **#5** |

---

## Opportunity 6 — Mailbox switch + rescan agent

| Field | Detail |
|-------|--------|
| **Idea** | Harness coordinates multi-account Gmail: which mailbox to scan, merge dedupe rules, empty-state guidance. |
| **User benefit** | Family/work/personal split (seed data already models accounts). |
| **Where in app** | TopMeta account switcher; `ConnectGmailFlow`; `EmptyDashboard`. |
| **Reuse** | `ACCOUNTS`, `gmail_accounts` collection, connect flow prototype. |
| **Safety risks** | Cross-account data leak in UI filter bugs. |
| **Start read-only?** | Filter/switch only first. |
| **Approval gates** | New Gmail connect per account. |
| **Complexity** | **High** |
| **Pilot rank** | **#6** |

---

## Recommended first pilot

**Command palette agent (Opportunity 4)** — read-only v1:

1. Wire existing `useKeyboard` → palette open state.  
2. Port `command-palette.jsx` UI.  
3. Implement search over in-memory/Firestore subs (merchant, category, verdict).  
4. Actions: navigate to sub detail, filter ledger — **no writes**.  
5. Add approval modal stub for future “cancel batch” intents.

**Why first:** Low backend dependency, reuses Zustand + seed/Firestore data, matches power-user editorial brand, clear read-only safety boundary.

---

## Harness shape (shared pattern)

```
User intent → Context bundle (subs, prefs, account)
           → Planner (rules + optional Gemini)
           → Action proposals (typed)
           → Approval UI (if write/external)
           → Execute (nav / Firestore / open URL)
           → Result card in editorial voice
```

Implement as `src/lib/agent/` or `src/harness/` when pilot approved — **not in current scope**.
