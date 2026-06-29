# Lumen — Subscription Intelligence

> *See every subscription. Spend with intent.*

**Designed by Yasir Bucha · Prototype Vol. III**

---

## What Is Lumen?

Lumen is a Gmail-connected subscription intelligence app. It reads receipts and renewal notices from Gmail, parses them into a structured ledger, and surfaces every active/past/upcoming subscription with **verified financials** and **evidence-based verdicts** (Keep / Review / Cancel).

**Market:** Pakistan-first (PKR primary, no bank-API enrichment available — Gmail is the only universal source of truth).

---

## This Repo: What's Inside

| Path | What it is |
|---|---|
| `public/prototype/` | Complete high-fidelity interactive prototype (React + Babel, runs in browser) |
| `public/prototype/index.html` | Open this in a browser to see the full working prototype |
| `src/index.tsx` | Hono server that serves the prototype (for online preview) |
| `AGENTS.md` | **Full build plan for Cursor / AI agents** — read this before writing any production code |

---

## Viewing the Prototype Locally

The prototype runs **entirely in the browser** — no build step needed.

```bash
# Option 1: Open directly in browser (simplest)
open public/prototype/index.html

# Option 2: Serve it locally (avoids any CORS issues)
cd public/prototype
npx serve .
# → http://localhost:3000
```

The prototype is the **visual and interaction source of truth** for all production development.

---

## Building the Production PWA

Read **`AGENTS.md`** — it contains the complete engineering brief including:
- Exact tech stack (Vite + React 18 + TypeScript + Firebase + CSS Modules)
- Full project structure to create
- Firestore schema (collections, fields, security rules)
- All TypeScript types
- Gmail sync Cloud Functions architecture
- 10 merchant parser stubs + Gemini LLM fallback
- 4-phase build plan
- Firebase manual setup checklist
- Key design pitfalls to avoid

### Quick Start for Production Build

```bash
# 1. Create the new production repo
npm create vite@latest lumen-app -- --template react-ts
cd lumen-app

# 2. Install dependencies
npm install react-router-dom zustand firebase vite-plugin-pwa

# 3. Copy design reference
cp -r ../lumen-prototype/public/prototype/ ./public/prototype/

# 4. Copy AGENTS.md into the new repo
cp ../lumen-prototype/AGENTS.md ./AGENTS.md

# 5. Follow Phase 1 in AGENTS.md
```

---

## Design System (locked)

| Token | Value |
|---|---|
| Background (light) | `#F1ECDF` — newsprint paper |
| Background (dark) | `#0E1623` — deep ink navy |
| Accent | `#8A1F1F` light / `#C8413A` dark — oxblood |
| Display font | `Fraunces` serif (all money, all headlines) |
| UI font | `Inter Tight` |
| Mono/label font | `JetBrains Mono` |
| Border style | 1px hairline — NO rounded corners on content |
| Verdict tags | Bordered rectangles — NOT pills |

**Do NOT use Tailwind CSS** — it conflicts with ExpressVPN. Use CSS Modules + CSS custom properties.

---

## Completion Status

### ✅ Prototype (100% complete)
All 10 mobile screens, 8 desktop views, 5 overlays, full design system.

### ⏳ Production PWA (to be built in Cursor)
| Phase | Features | Status |
|---|---|---|
| Phase 1 | PWA scaffold + Firebase Auth + Firestore + Dashboard | ⏳ Pending |
| Phase 2 | Gmail Cloud Functions + 10 parsers + Gemini fallback | ⏳ Pending |
| Phase 3 | All screens rebuilt in React/TS + responsive layout | ⏳ Pending |
| Phase 4 | Offline mode + push notifications + PWA polish | ⏳ Pending |

---

## Tech Stack (production)

- **Frontend:** Vite + React 18 + TypeScript
- **Styling:** CSS Modules + CSS custom properties (no Tailwind)
- **Routing:** React Router v6
- **State:** Zustand
- **Auth:** Firebase Authentication (Google OAuth)
- **Database:** Firestore (asia-south1)
- **Backend:** Firebase Cloud Functions (Node 20)
- **Gmail:** `googleapis` npm package, `gmail.readonly` scope
- **AI parsing:** Gemini API (user's own BYOK key)
- **PWA:** `vite-plugin-pwa` (Workbox)
- **Hosting:** Firebase Hosting

---

*Lumen · Prototype Vol. III · Designed by Yasir Bucha · June 2026*
