# Lumen — Testing Plan

**Updated:** 2026-06-30

---

## Current state

No Jest/Vitest/Playwright configured. Primary gate is **TypeScript + production build** (frontend + functions).

---

## Required checks (every handoff)

| Command | Purpose | When |
|---------|---------|------|
| `npm run build` | `tsc -b` + Vite bundle | After TS/React changes |
| `cd functions && npm run build` | Cloud Functions TypeScript | After `functions/src/` changes |
| Manual: `/signin` | Sign-in layout vs prototype | UI work |
| Manual: `/` (authed or seed) | Dashboard vs prototype | UI work |
| Manual: tab routes | `/ledger`, `/verdicts`, `/patterns`, `/settings` | Tab/shell work |
| Manual: Connect Gmail overlay | OAuth flow (needs configured Firebase) | Phase 2 work |

---

## Recommended additions (future)

| Layer | Tool | Priority |
|-------|------|----------|
| Unit | Vitest — `format.ts`, seed helpers, verdict logic | Medium |
| Component | Vitest + RTL — primitives snapshot-free style checks | Low |
| E2E | Playwright — sign-in mock, dashboard smoke | Phase 3 |
| Functions | Firebase emulator + parser fixtures | Phase 2 |

---

## Visual regression

Until automated: keep **prototype on :8765** (or :8766 if busy) and **PWA on :5173** side-by-side.

Checklist per screen:

- Fraunces + tabular-nums on all money  
- Verdict tags = bordered rectangles, not pills  
- No rounded corners on stat cards/rows  
- Oxblood accent ≤ 2× per screen  
- Masthead: one italic accent word + period  

---

## Do not run without approval

- `firebase deploy`  
- Production Firestore writes at scale  
- Gmail sync against real inbox (Phase 2+) without test account scope  
- Database reset / emulator `--export-on-exit` over production data  

---

## CI (not configured)

Suggested GitHub Action when repo is active:

```yaml
# .github/workflows/ci.yml (future)
- npm ci
- npm run build
- cd functions && npm ci && npm run build
```
