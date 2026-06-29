# Global Rules Reference
> [!IMPORTANT]
> This project follows global development standards. ALWAYS read [GLOBAL_AGENTS.md](file:///GLOBAL_AGENTS.md) or [global-agents.md](file:///Users/yb/Dev/ai-rules/global-agents.md) first to align on universal instructions.

# AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents

> **Project owner:** Yasir Bucha
> **App:** Lumen — Subscription Intelligence
> **Tagline:** *See every subscription. Spend with intent.*
> **Status:** Prototype complete. **Phase 1 done** · **Phase 2 partial** (functions scaffold, ConnectGmailFlow, mobile tabs). See [`docs/handoff.md`](docs/handoff.md).

## Agent harness (read before coding)

| Order | Doc |
|-------|-----|
| 1 | [`docs/handoff.md`](docs/handoff.md) — current phase, next step |
| 2 | [`docs/agentic-harness.md`](docs/agentic-harness.md) — safe edits, ports, commit/deploy rules |
| 3 | This file — full spec |
| 4 | [`docs/product-architecture-map.md`](docs/product-architecture-map.md) |
| 5 | [`public/prototype/index.html`](public/prototype/index.html) — visual source of truth |

Tool entry points: [`CURSOR.md`](CURSOR.md) · [`CODEX.md`](CODEX.md) · [`GEMINI.md`](GEMINI.md) · [`CLAUDE.md`](CLAUDE.md)

---

## What This Repo Is

This repo contains the **complete high-fidelity prototype** of Lumen — a Gmail-connected subscription intelligence app that reads email receipts and surfaces every active/past/upcoming subscription with verified amounts and AI verdicts (Keep / Review / Cancel).

The prototype lives in `public/static/*.jsx` — it is the **visual and interaction source of truth**. Every screen, every component, every pixel in those files must be matched exactly in the production React/TypeScript codebase you are about to build.

**Your job:** Take the prototype and turn it into a production Progressive Web App on Firebase, using proper bundling, real authentication, real Firestore data, and real Gmail parsing.

---

## Design System — NON-NEGOTIABLE

### Typography (locked — do not substitute)
| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / numbers / headlines | `Fraunces` serif | 600–900 | tabular-nums for all money, tracking `-0.03em` to `-0.045em` |
| UI / body | `Inter Tight` | 400–700 | Default body |
| Mono / labels / metadata | `JetBrains Mono` | 400–600 | ALL CAPS, letter-spacing `0.10em–0.18em` |

```html
<!-- Google Fonts load string -->
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700&family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap
```

### Color Tokens (from `public/static/tokens.jsx`)

**Light theme (default):**
```css
--bg: #F1ECDF;
--surface: #FBF8EE;
--surface-raised: #FFFEF7;
--text: #1A2738;
--text-muted: rgba(26, 39, 56, 0.62);
--text-subtle: rgba(26, 39, 56, 0.4);
--border: rgba(26, 39, 56, 0.16);
--border-hi: rgba(26, 39, 56, 0.28);
--accent: #8A1F1F;        /* oxblood */
--accent-ink: #FBF8EE;
--good: #4F6B3C;
--review: #A57F2B;
--cancel: #8A1F1F;        /* same as accent */
```

**Dark theme:**
```css
--bg: #0E1623;
--surface: #14202F;
--surface-raised: #1A2738;
--text: #F2EAD6;
--text-muted: rgba(242, 234, 214, 0.72);
--text-subtle: rgba(242, 234, 214, 0.5);
--border: rgba(242, 234, 214, 0.12);
--border-hi: rgba(242, 234, 214, 0.22);
--accent: #C8413A;
--accent-ink: #F2EAD6;
--good: #8FAE7C;
--review: #D6B26A;
--cancel: #C8413A;
```

### Visual Rules (strictly enforced)
1. **NO rounded corners** on stat cards, table rows, content blocks — hairline rectangles only. Only tiny avatar/chip elements get `border-radius: 4px`.
2. **All money values** = Fraunces serif + `font-variant-numeric: tabular-nums`
3. **Verdict tags** = bordered rectangles with mono uppercase text — NOT pills
4. **Masthead pattern** = every screen has Fraunces title + ONE italic word in oxblood: e.g., "All *subs*.", "What to *drop*.", "Spending *shape*."
5. **Oxblood accent** used SPARINGLY — max 2 occurrences per screen
6. **No emoji anywhere** — monoline 1.5px stroke SVG icons only
7. **Pull quotes** = oxblood `"` glyph + Fraunces italic text + `— BY LUMEN` mono caption
8. **Hairline borders everywhere** = `1px solid var(--border)` — used instead of cards with shadows

### Styling Approach: CSS Modules + CSS Custom Properties
**Do NOT use Tailwind CSS** — it conflicts with the user's ExpressVPN app.

Use **CSS Modules** (`Component.module.css`) with CSS custom properties (variables) for theming. The theme is applied via a `data-theme="light"` or `data-theme="dark"` attribute on `<html>`, and CSS vars switch accordingly.

```css
/* globals.css */
:root[data-theme="light"] {
  --bg: #F1ECDF;
  --surface: #FBF8EE;
  /* ... all tokens ... */
}
:root[data-theme="dark"] {
  --bg: #0E1623;
  /* ... */
}
```

---

## Tech Stack (exact)

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Routing | React Router v6 |
| State | Zustand |
| Styling | CSS Modules + CSS custom properties (NO Tailwind) |
| Auth | Firebase Authentication (Google provider) |
| Database | Firestore (Native mode, region: asia-south1) |
| Hosting | Firebase Hosting |
| Backend | Firebase Cloud Functions (Node 20) |
| Gmail | gmail.readonly scope via googleapis npm package |
| AI parsing | Gemini API (user's own key — BYOK) |
| PWA | vite-plugin-pwa (Workbox) |
| Charts | Custom SVG — no charting library needed |

---

## Project Structure to Create

```
lumen-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # PWA icons (192, 512)
│   └── prototype/             # Reference: original JSX prototype files (read-only)
│       └── *.jsx              # (copy from current repo's public/static/)
├── src/
│   ├── main.tsx               # App entry, mounts React
│   ├── App.tsx                # Router shell, theme provider
│   ├── styles/
│   │   ├── globals.css        # CSS custom properties, resets, font imports
│   │   ├── typography.css     # Type scale classes
│   │   └── tokens.css         # All design token variables
│   ├── lib/
│   │   ├── firebase.ts        # Firebase init (auth, firestore, functions)
│   │   ├── theme.ts           # Theme resolver (light/dark/accent)
│   │   └── format.ts          # fmtMoney(), fmtDate(), daysUntil()
│   ├── store/
│   │   ├── authStore.ts       # Zustand: user, loading, signIn/Out
│   │   ├── subStore.ts        # Zustand: subscriptions, activeAccount, openSubId
│   │   └── uiStore.ts         # Zustand: theme, paletteOpen, cancelFlow, sheets
│   ├── hooks/
│   │   ├── useSubscriptions.ts  # Firestore real-time listener
│   │   ├── useTheme.ts          # Theme context hook
│   │   └── useKeyboard.ts       # ⌘K global keyboard shortcut
│   ├── components/
│   │   ├── primitives/        # Atomic: Masthead, BigNumber, MerchantGlyph, etc.
│   │   │   ├── Masthead.tsx
│   │   │   ├── BigNumber.tsx
│   │   │   ├── MerchantGlyph.tsx
│   │   │   ├── VerdictTag.tsx
│   │   │   ├── StatHero.tsx
│   │   │   ├── StatStrip.tsx
│   │   │   ├── StatPair.tsx
│   │   │   ├── EditorialRow.tsx
│   │   │   ├── PullQuote.tsx
│   │   │   ├── GroupHead.tsx
│   │   │   ├── TabRow.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   └── SectionHeader.tsx
│   │   ├── layout/
│   │   │   ├── BottomTabBar.tsx     # Mobile bottom nav
│   │   │   ├── DesktopSidebar.tsx   # Desktop left nav
│   │   │   └── AppShell.tsx         # Responsive layout switcher
│   │   └── overlays/
│   │       ├── CommandPalette.tsx
│   │       ├── ConnectGmailFlow.tsx
│   │       ├── CancellationFlow.tsx
│   │       └── OnboardingTour.tsx
│   ├── screens/
│   │   ├── SignIn.tsx
│   │   ├── Scanning.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Ledger.tsx
│   │   ├── SubDetail.tsx
│   │   ├── Alerts.tsx
│   │   ├── Calendar.tsx
│   │   ├── Verdicts.tsx
│   │   ├── Patterns.tsx
│   │   ├── Mailroom.tsx
│   │   └── Settings.tsx
│   ├── desktop/
│   │   ├── DeskHome.tsx
│   │   ├── DeskLedger.tsx
│   │   ├── DeskAlerts.tsx
│   │   ├── DeskCalendar.tsx
│   │   ├── DeskVerdicts.tsx
│   │   ├── DeskShape.tsx
│   │   ├── DeskMailroom.tsx
│   │   ├── DeskOffice.tsx
│   │   └── DeskSubPanel.tsx
│   └── types/
│       └── index.ts           # Subscription, Account, Receipt, Verdict types
├── functions/
│   ├── src/
│   │   ├── index.ts           # Cloud Functions entry
│   │   ├── gmailSync.ts       # gmailInitialSync + gmailIncrementalSync
│   │   ├── parsers/
│   │   │   ├── index.ts       # Parser registry
│   │   │   ├── netflix.ts
│   │   │   ├── spotify.ts
│   │   │   ├── chatgpt.ts
│   │   │   ├── disney.ts
│   │   │   ├── notion.ts
│   │   │   ├── daraz.ts
│   │   │   ├── dropbox.ts
│   │   │   ├── adobe.ts
│   │   │   ├── icloud.ts
│   │   │   └── amazon.ts
│   │   └── geminiParser.ts    # LLM fallback parser
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .firebaserc
├── vite.config.ts
├── tsconfig.json
├── package.json
├── AGENTS.md                  # This file
└── README.md
```

---

## Firestore Schema

Collections under `users/{uid}`:

```
users/{uid}
  email: string
  displayName: string
  photoURL: string
  createdAt: Timestamp
  plan: "free"

users/{uid}/gmail_accounts/{accountId}
  email: string
  refreshTokenEnc: string        // encrypted at rest
  lastSyncAt: Timestamp
  status: "synced" | "syncing" | "error"
  color: string                  // avatar dot color

users/{uid}/subscriptions/{subId}
  merchant: string
  glyph: string                  // single letter
  glyphBg: string                // brand hex
  category: "streaming" | "productivity" | "cloud" | "school" | "ecommerce" | "bills"
  cycle: "monthly" | "yearly" | "weekly"
  amountPKR: number
  amountUSD: number
  amountOrig: number
  currency: string
  account: string                // gmail account id
  card: string                   // visa/mc/amex/unionp
  last4: string
  nextCharge: string             // ISO date
  since: string                  // YYYY-MM
  status: "active" | "past" | "cancelled"
  verdict: "keep" | "review" | "cancel"
  evidence: string[]
  usage: { sessionsLast30: number, lastUsed: string }
  priceIncrease?: { fromPKR, toPKR, fromUSD, toUSD, date, emailDate }
  sharedWith?: { plan, members[], note }
  history: { date, pkr, usd, status }[]
  createdAt: Timestamp
  updatedAt: Timestamp

users/{uid}/receipts/{receiptId}
  gmailAccountId: string
  gmailMessageId: string
  subId: string
  subject: string
  fromAddr: string
  receivedAt: Timestamp
  amountRaw: string
  parsedJson: object
  parserUsed: string
  confidence: number

users/{uid}/preferences
  currency: "PKR" | "USD"
  aiTone: "quiet" | "confident" | "conversational"
  theme: "light" | "dark"
  notifications: boolean
  geminiApiKey: string           // BYOK — store encrypted
  tourDone: boolean
  cancelledIds: string[]

users/{uid}/cancellations/{subId}
  filedAt: Timestamp
  source: "manual" | "flow"
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Screens Reference

All screens are defined in detail in `public/prototype/*.jsx` and documented in `README.md`. Read those before implementing any screen. Key cross-references:

| Screen | Reference file |
|---|---|
| Sign In, Scanning | `screens-mobile.jsx` |
| Dashboard, Ledger, Sub Detail | `screens-mobile-main.jsx` |
| Verdicts, Patterns, Mailroom, Settings | `screens-mobile-aux.jsx` |
| Alerts Inbox | `alerts-inbox.jsx` |
| Renewal Calendar | `renewal-calendar.jsx` |
| Desktop shell + DeskHome + DeskLedger + DeskVerdicts | `screen-desktop.jsx` |
| DeskShape, DeskMailroom, DeskOffice, DeskSubPanel | `screen-desktop-aux.jsx` |
| CommandPalette | `command-palette.jsx` |
| ConnectGmailFlow | `connect-gmail-flow.jsx` |
| CancellationFlow | `dashboard-cards.jsx` |
| OnboardingTour | `onboarding-tour.jsx` |
| Price sparkline, SharedWith, VerdictHistory | `sub-detail-extras.jsx` |

---

## Data Types (TypeScript)

```typescript
// src/types/index.ts

export type Verdict = 'keep' | 'review' | 'cancel';
export type SubStatus = 'active' | 'past' | 'cancelled';
export type Cycle = 'monthly' | 'yearly' | 'weekly';
export type Category = 'streaming' | 'productivity' | 'cloud' | 'school' | 'ecommerce' | 'bills';
export type CardKind = 'visa' | 'mc' | 'amex' | 'unionp';
export type Theme = 'light' | 'dark';
export type Accent = 'oxblood' | 'ink' | 'olive' | 'burnt';
export type AiTone = 'quiet' | 'confident' | 'conversational';

export interface GmailAccount {
  id: string;
  label: string;
  email: string;
  color: string;
  lastSyncAt?: string;
  status: 'synced' | 'syncing' | 'error';
}

export interface SharedMember {
  initial: string;
  label: string;
  color: string;
  you?: boolean;
  empty?: boolean;
}

export interface SharedWith {
  plan: string;
  members: SharedMember[];
  note: string;
}

export interface PriceIncrease {
  fromPKR: number;
  toPKR: number;
  fromUSD: number;
  toUSD: number;
  date: string;
  emailDate: string;
}

export interface HistoryEntry {
  date: string;
  pkr: number;
  usd: number;
  status: 'paid' | 'failed';
}

export interface Subscription {
  id: string;
  merchant: string;
  glyph: string;
  glyphBg: string;
  category: Category;
  cycle: Cycle;
  amountPKR: number;
  amountUSD: number;
  account: string;
  card: CardKind;
  last4: string;
  nextCharge: string;
  since: string;
  status: SubStatus;
  verdict: Verdict;
  evidence: string[];
  usage: { sessionsLast30: number; lastUsed: string };
  priceIncrease?: PriceIncrease;
  sharedWith?: SharedWith;
  history: HistoryEntry[];
}

export interface UserPreferences {
  currency: 'PKR' | 'USD';
  aiTone: AiTone;
  theme: Theme;
  accent: Accent;
  notifications: boolean;
  geminiApiKey?: string;
  tourDone: boolean;
  cancelledIds: string[];
}
```

---

## Gmail Sync Cloud Functions

### gmailInitialSync
```typescript
// Triggered on HTTP call after user connects Gmail
// functions/src/gmailSync.ts
export const gmailInitialSync = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const accountId = data.accountId;
  // 1. Get refresh token from Firestore
  // 2. Init OAuth2 client
  // 3. Fetch messages: q = 'from:(billing OR receipts OR renewal OR invoice OR no-reply) newer_than:5y'
  //    maxResults: 5000, cap enforced
  // 4. For each message: run parser layer
  // 5. Upsert to users/{uid}/subscriptions
});
```

### Parser Layer
```typescript
// functions/src/parsers/index.ts
// Layer 1: deterministic per-merchant parsers
// Layer 2: Gemini API fallback for confidence < 0.7 or no match

const PARSERS = [netflix, spotify, chatgpt, disney, notion, daraz, dropbox, adobe, icloud, amazon];

export async function parseMessage(msg: GmailMessage, geminiKey?: string) {
  for (const parser of PARSERS) {
    if (parser.matches(msg)) {
      const result = parser.parse(msg);
      if (result && result.confidence >= 0.7) return result;
    }
  }
  // LLM fallback
  if (geminiKey) return await geminiParse(msg, geminiKey);
  return null;
}
```

### Gemini Prompt (from BUILD_PLAN.md §4.2)
```
You extract structured subscription billing data from email receipts.
Reply with JSON only. Schema:
{
  "is_subscription": boolean,
  "merchant": string,
  "amount": number,
  "currency": "PKR" | "USD" | "EUR" | "GBP" | null,
  "cadence": "monthly" | "yearly" | "weekly" | "one-time" | null,
  "category": "streaming" | "software" | "cloud" | "education" | "shopping" | "other",
  "confidence": 0.0–1.0,
  "notes": string
}
If this is not a subscription receipt, return {"is_subscription": false}.
```

---

## Build Phases

### Phase 1 — Shell + Auth + Data ✅
1. ~~`npm create vite@latest` + React TS scaffold~~ ✅ (in-repo)
2. ~~Install deps: `react-router-dom zustand firebase vite-plugin-pwa`~~ ✅
3. ~~CSS custom properties in `src/styles/tokens.css` + globals~~ ✅
4. ~~Port primitives → `src/components/primitives/`~~ ✅
5. ~~Firebase Auth + `SignIn` screen~~ ✅ (`.env` + `firebase-config.ts`)
6. ~~Firestore rules in repo~~ ✅
7. ~~Seed data → `src/lib/seedData.ts`~~ ✅
8. ~~Dashboard wired to Firestore listener + seed fallback~~ ✅
9. ~~AppShell + mobile tabs (Ledger, Verdicts, Patterns, Settings)~~ ✅
10. ~~Hosting deploy~~ ✅ — re-deploy needs owner approval

### Phase 2 — Gmail Sync + Parsing (partial)
11. ~~Cloud Functions scaffold~~ ✅ (`functions/`, Node 20)
12. ~~`gmailInitialSync`~~ ✅ — deploy blocked (Spark → Blaze)
13. ~~10 merchant parsers~~ ✅ (`functions/src/parsers/index.ts`)
14. ~~Gemini fallback parser~~ ✅
15. ~~ConnectGmailFlow overlay + OAuth client~~ ✅
16. `gmailIncrementalSync` — stub only
17. Scanning screen wired to real sync progress — pending functions deploy

### Phase 3 — Full UI
16. All remaining mobile screens (port from `public/prototype/*.jsx`)
17. All desktop views
18. CommandPalette (⌘K), CancellationFlow, OnboardingTour
19. Sub Detail: PriceHistorySparkline, SharedWith, VerdictHistory, CSV export

### Phase 4 — PWA Polish
20. Service worker caching strategy (Workbox)
21. Offline mode: cached Firestore reads
22. PWA install banner
23. Push notifications (Firebase Cloud Messaging) for price alerts

---

## Firebase Setup Checklist (manual steps for Yasir)

Run these in Firebase console / GCP console before `firebase deploy`:

1. **Create Firebase project** at console.firebase.google.com
   - Enable Firestore in Native mode, region: `asia-south1`
   - Enable Firebase Authentication → Google provider
   - Enable Firebase Hosting

2. **GCP — Enable APIs** (console.cloud.google.com):
   - Gmail API
   - Cloud Functions API
   - Cloud Build API

3. **OAuth consent screen** (GCP → APIs & Services → OAuth consent screen):
   - App name: `Lumen`
   - User support email: your email
   - Scope: `https://www.googleapis.com/auth/gmail.readonly`
   - Status: **Testing** (adds you as test user — stays under 100 user cap)
   - Add test users: your Gmail addresses

4. **Paste `.firebaserc`** with your project ID:
   ```json
   { "projects": { "default": "YOUR_PROJECT_ID" } }
   ```

5. **Firestore rules**: paste rules from this file → Firestore → Rules tab

6. **Environment variables** for Cloud Functions:
   ```bash
   firebase functions:config:set gmail.client_id="..." gmail.client_secret="..."
   ```

---

## Local Dev Setup

```bash
# 1. Clone repo
git clone https://github.com/YasirBucha/lumen-app.git
cd lumen-app

# 2. Install frontend deps
npm install

# 3. Install functions deps
cd functions && npm install && cd ..

# 4. Add Firebase config
# Create src/lib/firebase-config.ts with your firebaseConfig object
# (copy from Firebase console → Project Settings → Your apps → SDK snippet)

# 5. Run dev server
npm run dev
# → http://localhost:5173

# 6. Run Firebase emulators (optional, for full local backend)
firebase emulators:start
```

---

## Key Design Pitfalls (from README.md — strictly follow)

1. No rounded corners on stat cards, rows, or content blocks
2. Oxblood appears max 2x per screen — it's editorial ink, not paint
3. Never change the font stack (Fraunces / Inter Tight / JetBrains Mono)
4. All money in Fraunces, tabular-nums — no exceptions
5. Every screen title follows: Fraunces + ONE italic word in accent + period
6. No emoji anywhere — monoline SVG icons only
7. Verdict tags are bordered rectangles, never pills
8. No `data-cc-id` or other prototype debug attributes in production
9. Do NOT use Tailwind CSS (conflicts with user's ExpressVPN app)
10. Do NOT copy the inline-Babel script pattern from index.html — use Vite bundles

---

## Prototype Reference

The working prototype is in `public/prototype/` — open `index.html` in a browser for the visual source of truth. All screen implementations reference those JSX files. When in doubt about a layout, color, or interaction — the prototype is the spec.

---

*Last updated: June 2026 — Yasir Bucha*

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
