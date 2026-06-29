# Lumen — Agent Handoff

**Updated:** 2026-06-30  
**Branch:** `main` (local; uncommitted app + harness work)  
**Phase:** 1 — Shell + Auth + Seed Dashboard (in progress)

---

## Goal

Production PWA matching `public/prototype/` pixel-perfectly, on Firebase, Gmail sync + AI verdicts.

---

## Done (this session)

- Created Firebase project **`lumen-20260630`** (display name: Lumen).
- Registered web app **Lumen PWA**; SDK config in local **`.env`** (gitignored).
- Updated **`.firebaserc`** → `lumen-20260630`.
- Migrated **`firebase-config.ts`** to Vite env vars (`.env.example` placeholders; matches GTD pattern).
- **`firebase.ts`**, **`authStore`**, **`useSubscriptions`** guard when Firebase not configured.
- Firestore database created in **`asia-south1`**; **rules deployed**.
- **`npm run build`** passes.
- Dev server verified: SignIn renders at `http://localhost:5173/signin` (matches prototype layout).

---

## Done (prior sessions)

- Vite + React 18 + TS migration; CSS tokens, primitives, stores, hooks.
- Screens: **SignIn**, **Dashboard** (+ cards, trend, category stack).
- Seed data + Firestore listener with seed fallback.
- Agent harness docs (`docs/*`).

---

## Blockers

- [ ] **Firebase Auth not initialized** — Console → [Authentication](https://console.firebase.google.com/project/lumen-20260630/authentication) → **Get started** → enable **Google** → add **`localhost`** to Authorized domains. (CLI init failed: billing quota exceeded on shared billing account; Spark manual setup required.)
- [ ] **`firebase deploy --only hosting`** — needs owner approval (build ready in `dist/`).
- [ ] Git push — uncommitted app + harness; needs approval.
- [ ] Phases 2–4 per `AGENTS.md`.

---

## Firebase project

| Field | Value |
|-------|-------|
| Project ID | `lumen-20260630` |
| Console | https://console.firebase.google.com/project/lumen-20260630/overview |
| Firestore region | `asia-south1` |
| Hosting | not deployed yet |
| Auth | **not enabled** (owner console step above) |

Local credentials: copy `.env.example` → `.env` (values already written locally; not in git).

---

## Files agents should not touch without reason

- `public/prototype/*` (reference only)
- `.env` (secrets)
- `lumen-handoff.tar.gz`

---

## Exact next step

1. **Owner:** Enable Google Auth in Firebase Console (link above).
2. Verify sign-in end-to-end on `http://localhost:5173/signin`.
3. With approval: `npm run build && firebase deploy --only hosting`.
4. Continue Phase 1 checklist in `AGENTS.md`, then Phase 2 (`firebase init functions`).

---

## Tests already run

```bash
npm run build                              # pass (2026-06-30)
firebase deploy --only firestore:rules     # pass → lumen-20260630
# SignIn page load + visual check on :5173  # pass
# Google sign-in popup                      # blocked — Auth not initialized
```

---

## Owner approvals still needed

- Enable Firebase Auth (console — 2 min)
- Firebase Hosting deploy
- Git push (app code + harness currently uncommitted together)
- Gmail OAuth client secrets for Cloud Functions (Phase 2)

---

## Paste-ready continuation prompt

```
Continue Lumen PWA at /Users/yb/Dev/projects/Lumen.

Read first: docs/handoff.md → docs/agentic-harness.md → AGENTS.md.

Phase 1: Firebase project lumen-20260630 wired (.env + .firebaserc). Firestore rules deployed. Build passes.
Blocker: enable Google Auth in Firebase Console, then verify sign-in. Deploy hosting with approval.

Rules: CSS Modules only (no Tailwind). Match public/prototype/ exactly. Do not deploy/push without approval.
```
