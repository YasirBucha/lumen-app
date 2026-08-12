# Lumen — Agent Handoff

**Updated:** 2026-08-13 (Gmail OAuth, live sync, and push setup verified)
**Branch:** `main`  
**Phase:** 1 ✅ · Phase 2 ✅ · Phase 3 ✅ · Phase 4 ✅

---

## Autonomous mode

Yasir prefers agents **commit, deploy, and implement without waiting** for approval — except destructive ops, secrets exposure, production config changes, deploy, push, or data reset.

---

## Done

### Phase 1 — mobile shell ✅
- AppShell + BottomTabBar, SignIn, Scanning, Dashboard, Ledger, Verdicts, Patterns, Settings
- Primitives, seed/Firestore fallback, auth flow

### Phase 2 — Gmail sync ✅
- Cloud Functions deployed (`gmailInitialSync`, `gmailIncrementalSync`) — `asia-south1`
- Gmail OAuth secrets set in Secret Manager (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`)
- Gmail API enabled on GCP
- ConnectGmailFlow + Scanning wired to real sync
- Firestore rules deployed; public Gmail account docs no longer accept OAuth tokens
- Existing legacy token migrated to the server-only token path

### Phase 3 — UI ✅
- **CommandPalette** — ⌘K cross-mailbox search
- **SubDetail** — mobile overlay + desktop DeskSubPanel; PriceHistorySparkline, SharedWith, VerdictHistory
- **CancellationFlow** — 3-step cancel sheet; `markCancelled` in subStore
- **Alerts** — `/alerts` price-watch inbox
- **Calendar** — `/calendar` renewal grid + week strip
- **Mailroom** — `/mailroom` connected mailboxes
- **OnboardingTour** — first-visit dashboard tour (`lumen.tourDone`)
- **Desktop shell** — ≥1024px: DesktopSidebar + DeskSubPanel; mobile tabs below

### Phase 4 — implemented ✅
- **PWA** — `vite-plugin-pwa`, `public/manifest.json`, icons, SW precache in `dist/`
- Offline Firestore caching with multi-tab IndexedDB persistence
- FCM opt-in in Settings, root messaging worker, and server-side price-change notifications
- Install prompt with seven-day dismissal
- Live sync progress fields wired from Cloud Functions to Scanning
- Card/category edit sheets persist to Firestore from SubDetail

---

## Blockers

- Prototype port **8765** may conflict — use **8766** if busy

## External setup / verification

- OAuth callback registered on the Google web client.
- Gmail reconnected; refresh-token-backed live sync verified.
- `VITE_FIREBASE_VAPID_KEY` configured and deployed for push; browser permission remains opt-in.

---

## Tests (2026-08-12)

```bash
npm run build                                      # pass (PWA + SW generated)
cd functions && npm run build                      # pass
firebase deploy --only firestore:rules,functions,hosting # pass
live Gmail sync                                          # pass
push notifications                                       # VAPID configured; permission is user opt-in
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

Phases 1–4 are implemented. Server-side Gmail OAuth, live sync, and the push VAPID configuration are verified.

Next: Continue Phase 4 polish only if needed.

npm run build before handoff. No deploy/push without approval.
```
