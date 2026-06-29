# Graph Report - .  (2026-06-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 742 nodes · 1262 edges · 46 communities (35 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39dede27`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 42 edges
2. `useSubStore` - 38 edges
3. `useUiStore` - 38 edges
4. `ThemeTokens` - 22 edges
5. `Subscription` - 20 edges
6. `AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents` - 17 edges
7. `Lumen — Development Agentic Harness` - 15 edges
8. `useAuthStore` - 14 edges
9. `TopMeta()` - 12 edges
10. `Lumen — Product Architecture Map` - 12 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useTweaks()`  [INFERRED]
  public/prototype/app.jsx → public/prototype/tweaks_panel.jsx
- `App()` --calls--> `useAuthStore`  [EXTRACTED]
  src/App.tsx → src/store/authStore.ts
- `CancellationFlow()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/overlays/CancellationFlow.tsx → src/hooks/useTheme.ts
- `CancellationFlow()` --calls--> `useUiStore`  [EXTRACTED]
  src/components/overlays/CancellationFlow.tsx → src/store/uiStore.ts
- `CancellationFlow()` --calls--> `useSubStore`  [EXTRACTED]
  src/components/overlays/CancellationFlow.tsx → src/store/subStore.ts

## Communities (46 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (57): AccountAvatar(), AccountAvatarProps, TopMeta(), TopMetaProps, EmptyDashboard(), useGmailAccounts(), useKeyboard(), useIsDesktop() (+49 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (43): Agent harness (read before coding), AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents, Build Phases, code:html (<!-- Google Fonts load string -->), code:typescript (// functions/src/parsers/index.ts), code:block11 (You extract structured subscription billing data from email ), code:json ({ "projects": { "default": "YOUR_PROJECT_ID" } }), code:bash (firebase functions:config:set gmail.client_id="..." gmail.cl) (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (33): adobe, amazon, amount, baseResult(), chatgpt, daraz, disney, domainParser() (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (7): App(), _poll, TWEAK_DEFAULTS, s, TweakSuggestionBar(), useTweaks(), useTwkTypewriter()

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (15): BigNumber(), BigNumberProps, Masthead(), MastheadProps, Mono(), MonoProps, GroupHeadProps, PullQuoteProps (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (20): TrendChart(), TrendChartProps, EditorialRowProps, VerdictTagProps, LumenLogoProps, Tab, TabRowProps, Accent (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (17): CategoryStack(), CategoryStackProps, EmptyDashboardProps, numberWord(), PriceIncreaseCard(), PriceIncreaseCardProps, daysUntil(), fmt() (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (20): admin, CATEGORY_MAP, db, decodeBody(), geminiParser_1, glyphColor(), googleapis_1, parseMessage() (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (21): AI / automation today, Client state (Zustand), code:mermaid (flowchart LR), Data & storage, Diagram (target architecture), Firestore (`users/{uid}/…`), For future agents, Implemented (production) (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (14): CATEGORY_MAP, glyphColor(), normalizeSubscription(), buildTrend(), CARD_KINDS, LIGHT_IDS, SUBS_HEAVY, SUBS_LIGHT (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (12): verdictHeadline(), buildVerdictHistory(), VerdictHistoryEvent, vhDateStamp(), SharedWith(), SharedWithProps, SubDetailProps, VerdictHistory() (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (20): code:bash (cd /Users/yb/Dev/projects/Lumen), code:bash (npm run build                      # frontend: tsc -b + vite), Commit / push rules, Current build status (2026-06-30), Deploy rules, Do, Do not (without owner approval), Files / folders — do not touch casually (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (8): CAL_TODAY, calBuildMonthGrid(), calDaysInMonth(), calFmtMonthShort(), calFmtMonthYear(), calStartOfMonth(), DeskCalendar(), ScreenCalendar()

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (7): AccountOption, PaletteFilters, ParsedQuery, parseQuery(), searchSubs(), ACCOUNTS, CATEGORIES

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (5): fmtMonthShort(), fmtPriceShort(), PriceHistorySparkline(), PriceJumpRow(), priceQuote()

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): firebaseConfig, isFirebaseConfigured, googleProvider, connectCurrentUserMailbox(), connectGmailMailbox(), ConnectResult, googleAccessTokenFromCredential(), GoogleTokenResponse (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (9): fmt(), fmtCompact(), monthlyEquivalent(), ScreenDashboard(), ScreenList(), ScreenSubDetail(), splitMoney(), verdictHeadline() (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (14): code:bash (graphify extract .), code:bash (graphify extract .), code:bash (graphify update .), code:bash (graphify query "<question>"), code:bash (graphify hook install), Context window handoff (all projects), Core Directives & Auth, graphify (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (14): Autonomous mode, Blockers, code:bash (npm run build                    # pass (PWA + SW generated)), code:block2 (Lumen PWA — continue from docs/handoff.md.), Done, Key routes, Lumen — Agent Handoff, Next (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (13): Building the Production PWA, code:bash (# Option 1: Open directly in browser (simplest)), code:bash (cd /Users/yb/Dev/projects/Lumen), Completion Status, Design System (locked), Lumen — Subscription Intelligence, ⏳ Production PWA, ✅ Prototype (100% complete) (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.27
Nodes (8): alertReason(), AlertRow(), alertYearlyDeltaPKR(), DeskAlertRow(), DeskAlerts(), fmtAlertPrice(), FUTURE_KINDS, ScreenAlerts()

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (5): CAL_TODAY, calBuildMonthGrid(), calDaysInMonth(), calStartOfMonth(), RenewalEntry

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (6): ACCOUNTS, CARD_KINDS, CATEGORIES, LIGHT_IDS, SUBS_HEAVY, SUBS_LIGHT

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (10): code:block1 (User intent → Context bundle (subs, prefs, account)), Harness shape (shared pattern), Lumen — Runtime Harness Opportunity Audit, Opportunity 1 — Verdict copilot (explain + recommend), Opportunity 2 — Cancellation orchestrator, Opportunity 3 — Inbox scan agent (Gmail sync progress), Opportunity 4 — Command palette agent (⌘K), Opportunity 5 — Price alert agent (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (7): buildPriceSeries(), MONTHS, priceIncreasePct(), priceQuote(), PriceSeriesPoint, PriceHistorySparkline(), PriceHistorySparklineProps

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (8): CI (not configured), code:yaml (# .github/workflows/ci.yml (future)), Current state, Do not run without approval, Lumen — Testing Plan, Recommended additions (future), Required checks (every handoff), Visual regression

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (3): Alert, AlertKind, FUTURE_KINDS

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): Already done (agent / CLI), code:bash (cd /Users/yb/Dev/projects/Lumen), Lumen — Setup for Yasir (one-time), Optional one click (Gmail connect), Quick links

## Knowledge Gaps
- **227 isolated node(s):** `TOUR_SPREADS`, `CANDIDATE_INBOXES`, `MERGE_SAMPLE`, `FUTURE_KINDS`, `CARD_KINDS` (+222 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeTokens` connect `Community 5` to `Community 0`, `Community 4`, `Community 6`, `Community 10`, `Community 11`, `Community 15`, `Community 31`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 0` to `Community 6`, `Community 15`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `Subscription` connect `Community 11` to `Community 0`, `Community 34`, `Community 5`, `Community 6`, `Community 10`, `Community 15`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `TOUR_SPREADS`, `CANDIDATE_INBOXES`, `MERGE_SAMPLE` to the rest of the system?**
  _227 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._