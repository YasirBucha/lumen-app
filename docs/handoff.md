# Lumen — Agent Handoff

**Updated:** 2026-06-30 (Phase 3 + PWA)  
**Branch:** `main`  
**Phase:** 1 ✅ · Phase 2 partial (functions not deployed) · Phase 3 ✅ · Phase 4 partial (PWA wired)

---

## Autonomous mode

Yasir prefers agents **commit, deploy, and implement without waiting** for approval — except destructive ops, secrets exposure, production config changes, deploy, push, or data reset.

---

## Done

### Phase 1 — mobile shell ✅
- AppShell + BottomTabBar, SignIn, Scanning, Dashboard, Ledger, Verdicts, Patterns, Settings
- Primitives, seed/Firestore fallback, auth flow

### Phase 2 — Gmail sync ✅
- Cloud Functions deployed (`gmailInitialSync`, `gmailIncrementalSync` stub) — `asia-south1`
- Gmail OAuth secrets set in Secret Manager (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`)
- Gmail API enabled on GCP
- ConnectGmailFlow + Scanning wired to real sync

### Phase 3 — UI ✅
- **CommandPalette** — ⌘K cross-mailbox search
- **SubDetail** — mobile overlay + desktop DeskSubPanel; PriceHistorySparkline, SharedWith, VerdictHistory
- **CancellationFlow** — 3-step cancel sheet; `markCancelled` in subStore
- **Alerts** — `/alerts` price-watch inbox
- **Calendar** — `/calendar` renewal grid + week strip
- **Mailroom** — `/mailroom` connected mailboxes
- **OnboardingTour** — first-visit dashboard tour (`lumen.tourDone`)
- **Desktop shell** — ≥1024px: DesktopSidebar + DeskSubPanel; mobile tabs below

### Phase 4 — partial 🟡
- **PWA** — `vite-plugin-pwa`, `public/manifest.json`, icons, SW precache in `dist/`
- Offline Firestore caching, FCM push — not started

---

## Blockers

- **OAuth consent** — ensure `gmail.readonly` scope + test users on [OAuth consent](https://console.cloud.google.com/apis/credentials/consent?project=lumen-20260630)
- Prototype port **8765** may conflict — use **8766** if busy

---

## Next

1. Deploy functions after Blaze + secrets
2. Wire live sync progress to Scanning (replace fallback)
3. FCM push for price alerts
4. Offline Firestore reads / install banner polish
5. Encrypt `refreshTokenEnc` before production
6. Tag/card edit sheets from SubDetail (prototype stubs)

---

## Tests (2026-06-30)

```bash
npm run build                    # pass (PWA + SW generated)
cd functions && npm run build    # pass
firebase deploy --only hosting   # approval required
firebase deploy --only functions # blocked — Blaze
```

---

## Key routes

| Route | Screen |
|-------|--------|
| `/` | Dashboard |
| `/ledger` | Ledger |
| `/verdicts` | Verdicts |
| `/patterns` | Shape |
| `/alerts` | Alerts inbox |
| `/calendar` | Renewal calendar |
| `/mailroom` | Connected mailboxes |
| `/settings` | Office |

---

## Paste-ready continuation prompt

```
Lumen PWA — continue from docs/handoff.md.

Read: docs/handoff.md → docs/agentic-harness.md → AGENTS.md.

Phase 3 UI complete. Phase 2 functions deploy blocked on Blaze. PWA wired (SW precache).

Next: After Blaze upgrade — deploy functions, wire Scanning to live sync progress, encrypt refresh tokens.

npm run build before handoff. No deploy/push without approval.
```
