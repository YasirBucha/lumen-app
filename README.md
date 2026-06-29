# Lumen — Subscription Intelligence

> *See every subscription. Spend with intent.*

**Prototype Vol. III** — High-fidelity interactive prototype by Yasir Bucha.  
Editorial newspaper × fintech ledger design language. Gmail-connected subscription intelligence app.

---

## Live URL
- **Sandbox:** https://3000-iudrnfk8yx6m0c500ylk7-8f57ffe2.sandbox.novita.ai

---

## What Is Lumen?

Lumen reads Gmail receipts and renewal notices, parses them into a structured ledger, and surfaces every active / past / upcoming subscription with **verified financials** and **evidence-based verdicts** (Keep / Review / Cancel).

**Market wedge:** In Pakistan, bank transaction enrichment APIs (Plaid, Tink) don't exist. Gmail is the only universal source of truth for subscription payments. Lumen owns the email-receipt-parsing space.

---

## Screens & Features — Implementation Status

### ✅ COMPLETED (100% of prototype screens)

#### Mobile Screens (10/10)
| Screen | Status | Description |
|--------|--------|-------------|
| 01. Sign In | ✅ | Editorial cover, Gmail OAuth CTA, passkey option |
| 02. Scanning | ✅ | Live sync progress, % counter, stat strip |
| 03. Dashboard | ✅ | Monthly spend hero, sparkline, Up Next, Price Watch card |
| 04. The Ledger | ✅ | Full subscription list, search, tab filter, editorial rows |
| 05. Sub Detail | ✅ | Price history sparkline, shared-with, verdict history, cancel flow |
| 06. Alerts Inbox | ✅ | Price increases, KPI strip, Coming Soon placeholders |
| 07. Renewal Calendar | ✅ | Week strip, month grid, day detail panel |
| 08. Verdicts | ✅ | Reclaim hero, group sections, PriceJumpRow evidence |
| 09. Spending Shape | ✅ | Bar chart, donut chart, payment breakdown, annualized commitment |
| 10. Mailroom / Accounts | ✅ | Connected Gmail accounts, connect new Gmail |
| 11. Office / Settings | ✅ | Currency, AI tone, theme, notifications, CSV export |

#### Desktop Views (8/8)
| View | Status |
|------|--------|
| D1. Dashboard (DeskHome) | ✅ |
| D2. Ledger (DeskLedger) | ✅ |
| D3. Alerts (DeskAlerts) | ✅ |
| D4. Calendar (DeskCalendar) | ✅ |
| D5. Verdicts (DeskVerdicts) | ✅ |
| D6. Shape (DeskShape) | ✅ |
| D7. Mailroom (DeskMailroom) | ✅ |
| D8. Office (DeskOffice) | ✅ |
| Sub Detail Panel (slide-in) | ✅ |

#### Overlays & Flows (5/5)
| Component | Status |
|-----------|--------|
| ConnectGmailFlow (4-step) | ✅ |
| CancellationFlow (3-step) | ✅ |
| CommandPalette (⌘K) | ✅ |
| OnboardingTour (5 spreads) | ✅ |
| Sheets (Account/Card/Category) | ✅ |

---

## Completion Summary

| Category | Done | Total | % |
|----------|------|-------|---|
| Mobile screens | 10 | 10 | **100%** |
| Desktop views | 8 | 8 | **100%** |
| Overlays/Flows | 5 | 5 | **100%** |
| Design tokens | ✅ | — | **100%** |
| Data layer | ✅ | — | **100%** |
| **TOTAL PROTOTYPE** | **23/23** | **23** | **100%** |

### ⏳ PENDING (Production backend — out of prototype scope)
| Feature | Notes |
|---------|-------|
| Firebase Auth (real Google OAuth) | Needs Firebase project setup |
| Gmail API integration | Needs restricted scope verification |
| Receipt parser (deterministic rules) | 20+ merchant parsers |
| LLM fallback parsing | Claude/Gemini API |
| Firestore data persistence | Replace localStorage |
| Cloud Functions (sync jobs) | Gmail initial + incremental sync |
| Push notifications | Price alerts via FCM |
| PWA service worker | Offline support |
| Google OAuth verification | ~6 weeks, ~$12k CASA audit |

---

## Design System

**"Editorial + Stats" — Direction D (locked)**

- **Fonts:** Fraunces (display/numbers), Inter Tight (UI), JetBrains Mono (labels)
- **Theme:** Light default (newsprint paper `#F1ECDF`), Dark available
- **Accent:** Oxblood (`#8A1F1F` light / `#C8413A` dark) — used sparingly
- **Typography:** All money in Fraunces serif, tabular-nums
- **Borders:** 1px hairline everywhere, NO rounded cards
- **Verdict tags:** Bordered rectangles, NOT pills

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Babel (prototype-mode, CDN) |
| Backend | Hono on Cloudflare Workers |
| Static hosting | Cloudflare Pages |
| Build | Vite + @hono/vite-build |
| Dev server | Wrangler Pages Dev + PM2 |

---

## Data Architecture

- **Data models:** Subscriptions, Accounts, Categories, Card kinds, Receipts
- **Storage (prototype):** localStorage (`lumen.screen`, `lumen.cancelled`, `lumen.tourDone`, etc.)
- **Storage (production):** Firestore under `users/{uid}/subscriptions`, `users/{uid}/preferences`
- **PKR primary** currency, USD secondary, FX ~278

---

## User Guide

1. Open the app → **Sign In** screen (editorial cover)
2. Pick **Mobile** or **Desktop** view via the toggle (top of device frame)
3. **Mobile:** Use the bottom tab bar to navigate (Today / Ledger / Verdicts / Shape / Office)
4. **Desktop:** Use the left sidebar to navigate between all 8 views
5. **⌘K** opens the Command Palette for cross-mailbox search
6. Tap any subscription row → opens Sub Detail with full evidence
7. Cancel a subscription via the 3-step Cancellation Flow
8. Connect additional Gmail accounts via Mailroom → "Connect another Gmail"

---

## Deployment

- **Platform:** Cloudflare Pages (via Wrangler)
- **Status:** ✅ Active (sandbox)
- **Last Updated:** June 29, 2026
- **Designed by:** Yasir Bucha
- **Prototype Vol.:** III
