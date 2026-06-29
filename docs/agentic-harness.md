# Lumen — Development Agentic Harness

**Project:** Lumen — Subscription Intelligence PWA  
**Owner:** Yasir Bucha  
**Path:** `/Users/yb/Dev/projects/Lumen`  
**Updated:** 2026-06-30

---

## Project overview

Gmail-connected subscription intelligence PWA (Pakistan-first, PKR primary). Reads receipt/renewal email, builds a ledger, surfaces Keep / Review / Cancel verdicts. Production stack: **Vite + React 18 + TypeScript**, **Zustand**, **CSS Modules**, **Firebase** (Auth, Firestore, Hosting, Cloud Functions), **Gmail API**, **Gemini BYOK**.

Visual source of truth: `public/prototype/` (open `index.html` or serve on port **8765**).

---

## Read-first order (mandatory)

1. [`docs/handoff.md`](handoff.md) — current phase, blockers, next step  
2. [`AGENTS.md`](../AGENTS.md) — full build spec, Firestore schema, phases, design rules  
3. This file — safe-edit rules, ports, testing  
4. [`docs/product-architecture-map.md`](product-architecture-map.md) — modules and data flow  
5. [`public/prototype/index.html`](../public/prototype/index.html) — pixel reference (browser)  
6. `/Users/yb/Dev/ai-rules/global-agents.md` — global agent rules (handoff protocol, no destructive ops)

---

## Current build status (2026-06-30)

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Design prototype in `public/prototype/` | ✅ Complete |
| **1** | Vite shell, primitives, SignIn, Dashboard, Firebase wiring, seed data | 🟡 In progress — build passes; Firebase config placeholder; deploy pending |
| **2** | Cloud Functions, Gmail sync, parsers, Gemini | ⏳ Not started |
| **3** | All mobile + desktop screens, overlays | ⏳ Not started |
| **4** | PWA manifest, offline, FCM | ⏳ Not started |

---

## Safe-edit rules

### Do

- Match prototype layouts exactly (Fraunces money, hairline borders, no rounded stat cards).  
- Use CSS Modules + CSS custom properties — **no Tailwind**.  
- Port one screen/feature at a time from `public/prototype/*.jsx`.  
- Fall back to `src/lib/seedData.ts` when Firestore is empty.  
- Run `npm run build` before handoff.  
- Update `docs/handoff.md` when ending a session.

### Do not (without owner approval)

- Deploy (`firebase deploy`, Wrangler Pages).  
- Push to remote.  
- Commit secrets or real `firebase-config` values to git.  
- Reset Firestore, user data, or OAuth tokens.  
- Use Tailwind, styled-components, or Emotion.  
- Rewrite unrelated files or delete `public/prototype/`.  
- Change production Firebase project ID in `.firebaserc` without confirmation.  
- Force-push `main`.

---

## Files / folders — do not touch casually

| Path | Reason |
|------|--------|
| `public/prototype/` | Read-only visual spec; do not “modernize” |
| `src/lib/firebase-config.ts` | Secrets — placeholders only in repo |
| `.env`, `.dev.vars` | Gitignored credentials |
| `lumen-handoff.tar.gz` | Original handoff archive |
| `firestore.rules` | Security — review before deploy |
| `node_modules/`, `dist/` | Generated |

### Legacy / conflicting (do not revive without decision)

| Path | Notes |
|------|--------|
| `wrangler.jsonc`, `ecosystem.config.cjs` | Old Cloudflare/Hono path; production target is **Firebase Hosting** |
| Deleted `src/index.tsx` (Hono) | Replaced by Vite `src/main.tsx` |

---

## Local run commands

```bash
cd /Users/yb/Dev/projects/Lumen
npm install
npm run dev          # PWA dev → http://127.0.0.1:5173
npm run build        # tsc + vite build → dist/
npm run preview      # preview prod build → http://127.0.0.1:4173

# Prototype reference (no build)
python3 -m http.server 8765 --directory public/prototype
# → http://127.0.0.1:8765/index.html

# Firebase (after config + CLI login) — owner approval for deploy
firebase emulators:start   # optional local backend
firebase deploy --only hosting   # APPROVAL REQUIRED
```

---

## Local ports & services

| Service | Port | URL | Notes |
|---------|------|-----|--------|
| **Lumen PWA dev** | **5173** | `http://127.0.0.1:5173` | Vite default — primary dev |
| **Lumen preview** | **4173** | `http://127.0.0.1:4173` | `npm run preview` |
| **Prototype reference** | **8765** | `http://127.0.0.1:8765/index.html` | Static; compare side-by-side |
| Legacy Wrangler/PM2 | 3000 | — | **Deprecated** — conflicts with ecosystem policy |

**Registry:** `/Users/yb/Dev/ai-rules/local-port-registry.md` (Lumen row added 2026-06-30).

---

## Testing / check commands

See [`docs/testing-plan.md`](testing-plan.md).

Quick gate:

```bash
npm run build    # typecheck (tsc -b) + production bundle
```

No unit test runner configured yet.

---

## Commit / push rules

- **Conventional commits** per phase when owner asks: `feat(phase1): …`  
- Commit **harness/docs only** in isolated commits when app code is also dirty.  
- **Never push** without owner approval.  
- Do not commit `firebase-config.ts` with real keys — use placeholders + local override pattern if needed.

---

## Deploy rules

- Target: **Firebase Hosting** (`firebase.json` → `dist/`).  
- Requires: real project ID in `.firebaserc`, populated `firebase-config.ts`, Firestore rules deployed, Google Auth enabled.  
- **Owner approval required** for every deploy.  
- Do not use Wrangler Pages for production unless owner explicitly switches target.

---

## Handoff protocol

1. Update [`docs/handoff.md`](handoff.md) with phase, files touched, blockers, exact next step.  
2. Paste-ready continuation prompt at bottom of handoff doc.  
3. If context window is large or debugging was heavy → recommend new chat (per global-agents.md).  
4. Next agent: read handoff → harness → AGENTS.md → execute **one** next step only.

---

## Known risks

- `README.md` was partially stale (Hono era); harness docs supersede for run commands.  
- `firebase-config.ts` uses placeholders — Auth/Firestore fail until configured.  
- `vite-plugin-pwa` installed but not wired in `vite.config.ts` yet (Phase 4).  
- `functions/` directory not scaffolded yet.  
- Prototype uses fixed date `2026-06-29` in seed/helpers — keep consistent until real data.  
- Dual hosting artifacts (Firebase + Wrangler) may confuse agents — treat Firebase as canonical.

---

## Tool-specific entry points

| Tool | File |
|------|------|
| Cursor | [`CURSOR.md`](../CURSOR.md) |
| Codex | [`CODEX.md`](../CODEX.md) |
| Gemini | [`GEMINI.md`](../GEMINI.md) |
| Claude | [`CLAUDE.md`](../CLAUDE.md) |

All point here and to `AGENTS.md` — no duplicated rulebooks.
