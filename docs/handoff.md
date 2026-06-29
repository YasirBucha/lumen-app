# Lumen — Agent Handoff

**Updated:** 2026-06-30  
**Branch:** `main` (local; uncommitted app + harness work)  
**Phase:** 1 — Shell + Auth + Seed Dashboard (in progress)

---

## Goal

Production PWA matching `public/prototype/` pixel-perfectly, on Firebase, Gmail sync + AI verdicts.

---

## Done (this session / recent)

- Extracted handoff tar.gz; prototype in `public/prototype/`.  
- Migrated from Hono/Cloudflare stub → **Vite + React 18 + TS**.  
- CSS tokens, globals, typography.  
- Primitives ported to `src/components/primitives/`.  
- Stores: auth, subs, ui. Hooks: theme, subscriptions, keyboard.  
- Screens: **SignIn**, **Dashboard** (+ dashboard cards, trend, category stack).  
- Seed data in `src/lib/seedData.ts`; Firestore listener with seed fallback.  
- Firebase scaffold: `firebase.json`, `firestore.rules`, `.firebaserc` (placeholder project ID).  
- `npm run build` passes.  
- Agent harness docs created (`docs/*`).

---

## Not done / blockers

- [ ] Real Firebase project ID + `firebase-config.ts` (owner or cross-project credentials).  
- [ ] `firebase deploy --only hosting` — **needs approval**.  
- [ ] Phase 1 remaining: Firestore collections live, full auth flow verified end-to-end.  
- [ ] Phases 2–4 per `AGENTS.md`.  
- [ ] PWA plugin not configured.  
- [ ] `functions/` not created.  
- [ ] README still references old Hono entry — harness docs are authoritative for dev.

---

## Files agents should not touch without reason

- `public/prototype/*` (reference only)  
- `src/lib/firebase-config.ts` (secrets)  
- `lumen-handoff.tar.gz`

---

## Exact next step

1. Populate `src/lib/firebase-config.ts` and `.firebaserc` from Yasir’s Firebase project (same ecosystem credentials as other projects — do not paste secrets in chat).  
2. Verify Google sign-in on `http://127.0.0.1:5173/signin`.  
3. With owner approval: `npm run build && firebase deploy --only hosting`.  
4. Continue Phase 1 checklist in `AGENTS.md`, then Phase 2 (`firebase init functions`).

---

## Tests already run

```bash
npm run build   # pass (2026-06-30)
```

---

## Owner approvals still needed

- Firebase deploy  
- Git push (app code + harness currently uncommitted together)  
- Gmail OAuth client secrets for Cloud Functions (Phase 2)

---

## Paste-ready continuation prompt

```
Continue Lumen PWA at /Users/yb/Dev/projects/Lumen.

Read first: docs/handoff.md → docs/agentic-harness.md → AGENTS.md.

Phase 1 in progress: Vite React app with SignIn + Dashboard, seed data, Firebase placeholders.
Build passes. Next: wire real firebase-config + .firebaserc, verify Google Auth, deploy hosting with approval.

Rules: CSS Modules only (no Tailwind). Match public/prototype/ exactly. Do not deploy/push without approval.
```
