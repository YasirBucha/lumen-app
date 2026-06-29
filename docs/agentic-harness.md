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
| **1** | Vite shell, primitives, auth, AppShell, mobile tabs, seed/Firestore | ✅ Complete — build passes; hosting deployed |
| **2** | Cloud Functions, Gmail sync, parsers, ConnectGmailFlow | 🟡 Partial — functions scaffold + 10 parsers in repo; **deploy blocked on Blaze** |
| **3** | Sub Detail, Alerts, Calendar, Mailroom, desktop, overlays (⌘K, cancel, tour) | ⏳ Not started |
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
| `src/lib/firebase-config.ts` | Reads `VITE_*` from `.env` — do not commit real values |
| `.env` | Gitignored — local Firebase keys (file exists on owner machine) |
| `.env.example` | Safe template only |
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

# Cloud Functions (TypeScript)
cd functions && npm install && npm run build

# Firebase (after config + CLI login) — owner approval for deploy
firebase emulators:start   # optional local backend
firebase deploy --only hosting   # APPROVAL REQUIRED — already deployed once
firebase deploy --only functions # APPROVAL REQUIRED — blocked until Blaze upgrade
```

---

## Local ports & services

| Service | Port | URL | Notes |
|---------|------|-----|--------|
| **Lumen PWA dev** | **5173** | `http://127.0.0.1:5173` | Vite default — primary dev |
| **Lumen preview** | **4173** | `http://127.0.0.1:4173` | `npm run preview` |
| **Prototype reference** | **8765** | `http://127.0.0.1:8765/index.html` | Static; **may conflict with AgentBroker** — use alternate port if busy |
| Legacy Wrangler/PM2 | 3000 | — | **Deprecated** — conflicts with ecosystem policy |
| **Firebase Hosting (prod)** | HTTPS | `https://lumen-20260630.web.app` | Deployed; not a local port |

**Registry:** `/Users/yb/Dev/ai-rules/local-port-registry.md` (Lumen row added 2026-06-30).

---

## Testing / check commands

See [`docs/testing-plan.md`](testing-plan.md).

Quick gate:

```bash
npm run build                      # frontend: tsc -b + vite bundle
cd functions && npm run build      # Cloud Functions TypeScript
```

No unit test runner configured yet. See [`docs/testing-plan.md`](testing-plan.md).

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

- `README.md` partially stale on phase labels — **harness docs supersede** for run commands and status.  
- `.env` holds Firebase keys locally — never commit or echo in chat.  
- `vite-plugin-pwa` installed but not wired in `vite.config.ts` yet (Phase 4).  
- **Functions deploy blocked** — Firebase project on Spark; needs Blaze + `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` on functions.  
- `gmailIncrementalSync` is a stub; real historyId tracking not implemented.  
- `refreshTokenEnc` in client currently stores access token — encryption/TODO before production.  
- Prototype uses fixed date `2026-06-29` in seed/helpers — keep consistent until real Gmail data.  
- Dual hosting artifacts (Firebase + `wrangler.jsonc`) may confuse agents — **Firebase is canonical**.  
- Port **8765** shared with AgentBroker on this Mac — pick another port for prototype if conflict.

## Unresolved conflicts

| Conflict | Resolution |
|----------|------------|
| Firebase vs Wrangler hosting | Use Firebase (`firebase.json`); ignore Wrangler unless owner switches |
| Phase labels in AGENTS.md vs handoff | Handoff + this file are live status; AGENTS.md spec lags slightly |
| Prototype port 8765 vs AgentBroker | Serve prototype on e.g. **8766** locally if 8765 busy |
| Autonomous deploy vs harness “approval required” | Destructive/risky still needs approval; routine doc/build OK autonomous |

---

## Tool-specific entry points

| Tool | File |
|------|------|
| Cursor | [`CURSOR.md`](../CURSOR.md) |
| Codex | [`CODEX.md`](../CODEX.md) |
| Gemini | [`GEMINI.md`](../GEMINI.md) |
| Claude | [`CLAUDE.md`](../CLAUDE.md) |

All point here and to `AGENTS.md` — no duplicated rulebooks.
