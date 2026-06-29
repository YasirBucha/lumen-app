# Lumen — Product Architecture Map

**Updated:** 2026-06-30  
**Keep updated when:** new screens, Firebase collections, Cloud Functions, or integrations land.

---

## What the app does

1. User signs in with Google (Firebase Auth).  
2. User connects Gmail (OAuth refresh token stored encrypted — Phase 2).  
3. Backend scans billing/receipt emails, parses subscriptions.  
4. App shows ledger: active/past/upcoming subs, PKR/USD amounts, renewal calendar, AI verdicts (Keep / Review / Cancel).  
5. User can act: cancel flow, command palette search, settings (theme, currency, Gemini BYOK key).

**Market:** Pakistan-first; PKR primary; Gmail as source of truth (no bank API).

---

## Major modules (production `src/`)

| Module | Path | Role |
|--------|------|------|
| Entry | `main.tsx`, `App.tsx` | Router, auth gate, theme init |
| Screens | `screens/` | SignIn, Dashboard (+ Ledger, Verdicts, … planned) |
| Primitives | `components/primitives/` | Editorial UI atoms (Masthead, StatHero, VerdictTag, …) |
| Dashboard widgets | `components/dashboard/` | Trend, categories, price alerts, empty state |
| State | `store/` | Zustand: auth, subscriptions, UI |
| Hooks | `hooks/` | Firestore subs, theme, ⌘K |
| Lib | `lib/` | Firebase, format, seedData |
| Types | `types/index.ts` | Subscription, Verdict, preferences |
| Styles | `styles/` | tokens.css, globals, typography |

**Not yet in repo:** `functions/`, `components/layout/`, `components/overlays/`, `desktop/`, most `screens/*`.

---

## User-facing surfaces

### Implemented (production)

| Surface | Route | Prototype ref |
|---------|-------|----------------|
| Sign In | `/signin` | `screens-mobile.jsx` |
| Dashboard | `/` | `screens-mobile-main.jsx` |

### Planned — mobile (`screens/`)

SignIn, Scanning, Dashboard, Ledger, SubDetail, Alerts, Calendar, Verdicts, Patterns, Mailroom, Settings.

### Planned — desktop (`desktop/`)

DeskHome, DeskLedger, DeskAlerts, DeskCalendar, DeskVerdicts, DeskShape, DeskMailroom, DeskOffice, DeskSubPanel (460px panel).

### Overlays

CommandPalette, ConnectGmailFlow, CancellationFlow, OnboardingTour.

### Reference only

`public/prototype/` — full interactive mock (Babel inline); **do not ship this pattern**.

---

## Data & storage

### Firestore (`users/{uid}/…`)

| Collection / doc | Purpose |
|------------------|---------|
| User profile | email, displayName, plan |
| `gmail_accounts/{id}` | refresh token (encrypted), sync status |
| `subscriptions/{id}` | ledger rows — merchant, amounts, verdict, history |
| `receipts/{id}` | raw email parse audit trail |
| `preferences` | currency, theme, Gemini key (encrypted), tourDone |
| `cancellations/{subId}` | filed cancellations |

Region: **asia-south1**. Rules: owner uid only (`firestore.rules`).

### Local / seed

`src/lib/seedData.ts` — `SUBS_HEAVY`, `SUBS_LIGHT`, accounts, categories until Firestore populated.

### Client state (Zustand)

Ephemeral: active mailbox filter, open sub id, UI sheets, theme, currency.

---

## Sync / API / background jobs (planned)

| Job | Trigger | Location |
|-----|---------|----------|
| `gmailInitialSync` | Callable after Gmail connect | `functions/src/gmailSync.ts` |
| `gmailIncrementalSync` | Scheduled every 6h | same |
| Parser layer | Per message | `functions/src/parsers/*.ts` |
| Gemini fallback | Low confidence / no match | `functions/src/geminiParser.ts` |

Gmail scope: `gmail.readonly`. Gemini: user BYOK from preferences.

---

## Integrations

| Service | Status |
|---------|--------|
| Firebase Auth (Google) | Wired in code; config placeholder |
| Firestore | Wired listener; rules in repo |
| Firebase Hosting | Config ready; not deployed |
| Cloud Functions | Not scaffolded |
| Gmail API | Phase 2 |
| Gemini API | Phase 2 (BYOK) |
| FCM push | Phase 4 |

---

## AI / automation today

- **Prototype:** static verdicts + evidence strings in seed data.  
- **Planned:** deterministic parsers + Gemini structured JSON extraction.  
- **Runtime agent harness (product):** not implemented — see `docs/runtime-harness-opportunities.md`.

---

## Local services

| Port | Service |
|------|---------|
| 5173 | Vite dev (PWA) |
| 4173 | Vite preview |
| 8765 | Static prototype server |

---

## Incomplete / experimental / legacy

| Item | Notes |
|------|--------|
| Phase 1 PWA | Partial — 2 screens |
| `wrangler.jsonc`, `ecosystem.config.cjs` | Legacy Cloudflare path |
| `vite-plugin-pwa` | Dependency only; not in vite config |
| `functions/` | Missing |
| Desktop responsive shell | `AppShell.tsx` not created |
| Fixed “today” date in format helpers | Matches prototype demo date |

---

## Diagram (target architecture)

```mermaid
flowchart LR
  subgraph client [PWA Client]
    UI[React Screens]
    ZS[Zustand]
    UI --> ZS
  end
  subgraph firebase [Firebase]
    Auth[Auth Google]
    FS[(Firestore)]
    CF[Cloud Functions]
    Host[Hosting]
  end
  subgraph external [External]
    Gmail[Gmail API]
    Gemini[Gemini BYOK]
  end
  UI --> Auth
  UI --> FS
  CF --> Gmail
  CF --> Gemini
  CF --> FS
  Host --> UI
```

---

## For future agents

When adding a feature, update this doc’s **Implemented** tables and **Incomplete** list in the same PR/commit as the feature (or handoff if no commit yet).
