# Lumen — Agent Handoff

**Updated:** 2026-06-30  
**Branch:** `main` @ `fb24977`  
**Phase:** 1 complete · Phase 2 in progress (functions scaffold; deploy blocked on Blaze)

---

## Autonomous mode

Yasir prefers agents **commit, deploy, and implement without waiting** for approval (unless destructive). Cursor rule updated.

---

## Done

### Phase 1 — mobile shell ✅
- AppShell + BottomTabBar (Today, Ledger, Verdicts, Shape, Office)
- Screens: Scanning, Ledger, Verdicts, Patterns, Settings
- Sign-in → scanning → dashboard flow

### Phase 2 — partial 🟡
- `functions/`: `gmailInitialSync`, parser layer (10 merchants), Gemini fallback
- **ConnectGmailFlow** overlay wired (pick → consent → scan → done)
- `gmailConnect.ts` client + Firestore `gmail_accounts` writes
- Hosting deployed: https://lumen-20260630.web.app

### Git
- `ef293b4` Phase 1 base
- `fb24977` Phase 1/2 tabs + functions + ConnectGmailFlow
- Pushed to `genspark` remote

---

## Blockers

- **Functions deploy** — project on Spark; needs **Blaze upgrade** (billing quota on shared account blocked auto-link). Upgrade: [Firebase usage](https://console.firebase.google.com/project/lumen-20260630/usage/details)
- **Gmail OAuth server secrets** — set `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` on functions after Blaze
- Prototype reference port **8765** occupied by AgentBroker

---

## Next (autonomous)

1. Sub Detail screen + `openSubId` panel
2. Alerts, Calendar, Mailroom screens
3. CommandPalette (⌘K), CancellationFlow
4. Wire Scanning to real sync progress when functions live
5. Desktop shell (Phase 3)
6. PWA plugin (Phase 4)

---

## Tests

```bash
npm run build                    # pass
cd functions && npm run build    # pass
firebase deploy --only hosting   # pass
firebase deploy --only functions # blocked — Blaze required
```
