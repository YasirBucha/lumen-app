# Lumen — Agent Handoff

**Updated:** 2026-06-30 (harness audit pass)  
**Branch:** `main`  
**Phase:** 1 complete · Phase 2 partial (functions in repo; deploy blocked on Blaze)

---

## Autonomous mode

Yasir prefers agents **commit, deploy, and implement without waiting** for approval — except destructive ops, secrets exposure, production config changes, deploy, push, or data reset.

---

## Done

### Phase 1 — mobile shell ✅
- AppShell + BottomTabBar (Today, Ledger, Verdicts, Shape, Office)
- Screens: SignIn, Scanning, Dashboard, Ledger, Verdicts, Patterns, Settings
- Primitives, dashboard widgets, seed/Firestore fallback
- Sign-in → scanning → tab shell flow

### Phase 2 — partial 🟡
- `functions/`: `gmailInitialSync`, 10 merchant parsers, Gemini fallback, incremental stub
- **ConnectGmailFlow** overlay (pick → consent → scan → done)
- `gmailConnect.ts` + `useGmailAccounts` + Firestore `gmail_accounts`
- Hosting deployed: https://lumen-20260630.web.app

### Harness (this pass) ✅
- Refreshed `docs/agentic-harness.md`, `product-architecture-map.md`, `testing-plan.md`, `runtime-harness-opportunities.md`
- Verified builds: `npm run build`, `functions npm run build`

---

## Blockers

- **Functions deploy** — project on Spark; needs **Blaze upgrade**. Upgrade: [Firebase usage](https://console.firebase.google.com/project/lumen-20260630/usage/details)
- **Gmail OAuth server secrets** — set `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` on functions after Blaze
- Prototype reference port **8765** may conflict with AgentBroker — use **8766** locally if busy

---

## Next (autonomous)

1. **CommandPalette** — port `command-palette.jsx`; wire `useKeyboard` (recommended runtime harness pilot)
2. Sub Detail screen + `openSubId` panel
3. Alerts, Calendar, Mailroom screens
4. CancellationFlow overlay
5. Wire Scanning to real sync progress when functions live
6. Desktop shell (Phase 3)
7. PWA plugin (Phase 4)

---

## Tests (last verified 2026-06-30)

```bash
npm run build                    # pass
cd functions && npm run build    # pass
firebase deploy --only hosting   # already deployed — approval for re-deploy
firebase deploy --only functions # blocked — Blaze required
```

---

## Paste-ready continuation prompt

```
Lumen PWA — continue from docs/handoff.md.

Read: docs/handoff.md → docs/agentic-harness.md → AGENTS.md → docs/product-architecture-map.md.

Phase 1 done. Phase 2 partial (functions in repo, not deployed — Blaze blocker).

Next task: Port CommandPalette from public/prototype/command-palette.jsx — wire useKeyboard + uiStore.paletteOpen, read-only search/nav over subs. No Tailwind. Match prototype pixels.

After UI: npm run build. Update docs/handoff.md. Do not deploy or push without approval.
```
