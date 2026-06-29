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
| `public/prototype/index.html` | Visual source of truth — open in browser or serve on port **8765** |
| `src/` | Production Vite + React 18 + TypeScript PWA (Phase 1 in progress) |
| `AGENTS.md` | **Full build plan** — read after `docs/handoff.md` |
| `docs/agentic-harness.md` | Dev agent rules, ports, testing, handoff protocol |
| `docs/handoff.md` | Current phase and exact next step for agents |

---

## Viewing the Prototype Locally

The prototype runs **entirely in the browser** — no build step needed.

```bash
# Option 1: Open directly in browser (simplest)
open public/prototype/index.html

# Option 2: Serve locally (recommended for agents)
python3 -m http.server 8765 --directory public/prototype
# → http://127.0.0.1:8765/index.html
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
cd /Users/yb/Dev/projects/Lumen
npm install
npm run dev
# → http://127.0.0.1:5173

# See docs/handoff.md for current phase and docs/agentic-harness.md for agent rules
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

### ⏳ Production PWA
| Phase | Features | Status |
|---|---|---|
| Phase 1 | PWA scaffold + Firebase Auth + Firestore + Dashboard | 🟡 In progress |
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
