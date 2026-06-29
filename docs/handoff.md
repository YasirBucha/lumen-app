# Lumen — Agent Handoff

**Updated:** 2026-06-30  
**Branch:** `main` (local; Phase 1/2 work uncommitted)  
**Phase:** 1 complete · **Phase 2 scaffolded**

---

## Goal

Production PWA matching `public/prototype/` pixel-perfectly, on Firebase, Gmail sync + AI verdicts.

---

## Done (this session)

### Phase 1 — mobile shell
- **AppShell** + **BottomTabBar** (5 tabs: Today, Ledger, Verdicts, Shape, Office)
- New screens: **Scanning**, **Ledger**, **Verdicts**, **Patterns**, **Settings**
- Sign-in → `/scanning` → Dashboard flow
- Routes: `/`, `/ledger`, `/verdicts`, `/patterns`, `/settings`, `/scanning`

### Phase 2 — Cloud Functions scaffold
- `functions/` with Node 20 + TypeScript
- **`gmailInitialSync`** (callable, `asia-south1`)
- **`gmailIncrementalSync`** (scheduled stub, every 6h)
- Parser layer: netflix, spotify, chatgpt, notion, amazon + **Gemini fallback**
- `firebase.json` updated with functions predeploy build

### Prior (still valid)
- Firebase project **`lumen-20260630`**, Auth + Hosting live
- `.env` local config (gitignored); Firestore rules deployed
- Commit `ef293b4`: SignIn + Dashboard + Firebase wiring

---

## Not done / next

- [ ] Deploy functions (`firebase deploy --only functions`) — needs **Blaze/billing** + `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` env
- [ ] **ConnectGmailFlow** overlay + real OAuth token storage
- [ ] Wire Scanning screen to real `gmailInitialSync` progress
- [ ] Remaining parsers (disney, daraz, dropbox, adobe, icloud)
- [ ] Sub Detail, Alerts, Calendar, desktop views, overlays (Phase 3)
- [ ] Git push — needs approval

---

## Firebase project

| Field | Value |
|-------|-------|
| Project ID | `lumen-20260630` |
| Hosting | https://lumen-20260630.web.app |
| Functions region | `asia-south1` |
| Auth | Google enabled |

---

## Tests run

```bash
npm run build                    # pass
cd functions && npm run build    # pass
```

---

## Paste-ready continuation prompt

```
Continue Lumen PWA at /Users/yb/Dev/projects/Lumen.

Read: docs/handoff.md → docs/agentic-harness.md → AGENTS.md.

Phase 1 mobile tabs done (Dashboard, Ledger, Verdicts, Patterns, Settings, Scanning).
Phase 2 functions scaffolded — wire ConnectGmailFlow + deploy functions with Gmail OAuth secrets.

Rules: CSS Modules only. Match public/prototype/. No deploy/push without approval.
```
