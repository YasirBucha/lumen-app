# Graph Report - Lumen  (2026-06-30)

## Corpus Check
- 111 files · ~78,372 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 746 nodes · 1629 edges · 48 communities (38 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d72c4803`
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
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 49 edges
2. `useUiStore` - 45 edges
3. `useSubStore` - 44 edges
4. `ThemeTokens` - 32 edges
5. `Subscription` - 25 edges
6. `CancellationFlow()` - 22 edges
7. `AccountAvatar()` - 22 edges
8. `fmt()` - 18 edges
9. `AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents` - 17 edges
10. `TopMeta()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `fmt()` --calls--> `ScreenList()`  [EXTRACTED]
  src/lib/format.ts → public/prototype/screens-mobile-main.jsx
- `monthlyEquivalent()` --calls--> `ScreenSubDetail()`  [EXTRACTED]
  src/lib/format.ts → public/prototype/screens-mobile-main.jsx
- `yearlyEquivalent()` --calls--> `ScreenSubDetail()`  [EXTRACTED]
  src/lib/format.ts → public/prototype/screens-mobile-main.jsx
- `fmt()` --calls--> `ScreenSubDetail()`  [EXTRACTED]
  src/lib/format.ts → public/prototype/screens-mobile-main.jsx
- `ScreenSubDetail()` --calls--> `verdictHeadline()`  [EXTRACTED]
  public/prototype/screens-mobile-main.jsx → src/lib/verdictCopy.ts

## Communities (48 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (54): AccountAvatar(), AccountAvatarProps, TopMeta(), TopMetaProps, CategoryStack(), CategoryStackProps, EmptyDashboard(), EmptyDashboardProps (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (72): TrendChart(), TrendChartProps, geminiParse(), admin, CATEGORY_MAP, db, decodeBody(), geminiParser_1 (+64 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (25): useIsDesktop(), useMediaQuery(), AppShell(), BottomTabBar(), AccountOption, PaletteFilters, ParsedQuery, parseQuery() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (28): buildPriceSeries(), MONTHS, priceIncreasePct(), priceQuote(), PriceSeriesPoint, verdictHeadline(), buildVerdictHistory(), VerdictHistoryEvent (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (10): tabs, NavIcon(), NavIconName, paths, App(), NavIcon(), _poll, TWEAK_DEFAULTS (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): ACCOUNTS, buildTrend(), CARD_KINDS, LIGHT_IDS, makeSubs(), SUBS_HEAVY, SUBS_LIGHT, toCurrency() (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (16): firebaseConfig, isFirebaseConfigured, googleProvider, connectCurrentUserMailbox(), connectGmailMailbox(), ConnectResult, googleAccessTokenFromCredential(), GoogleTokenResponse (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (18): CAL_TODAY, calBuildMonthGrid(), calBuildRenewalMap(), calDaysInMonth(), calFmtMonthShort(), calFmtMonthYear(), calIsSameDay(), calKey() (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): AI / automation today, Client state (Zustand), code:mermaid (flowchart LR), Data & storage, Diagram (target architecture), Firestore (`users/{uid}/…`), For future agents, Implemented (production) (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (3): s, TweakSuggestionBar(), useTwkTypewriter()

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): Agent harness (read before coding), AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents, code:bash (# 1. Clone repo), code:block5 (lumen-app/), code:block6 (users/{uid}), code:javascript (rules_version = '2';), code:typescript (// src/types/index.ts), Data Types (TypeScript) (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (14): alertReason(), alertYearlyDeltaPKR(), buildAlerts(), fmtAlertPrice(), FUTURE_KINDS, alertReason(), AlertRow(), alertYearlyDeltaPKR() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.2
Nodes (11): fmtCompact(), splitMoney(), fmt(), fmtCompact(), monthlyEquivalent(), ScreenDashboard(), ScreenList(), ScreenSubDetail() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (3): DeskSubPanelBody(), panelVerdictLine(), SettingsRow()

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (15): code:bash (npm run build                      # frontend: tsc -b + vite), Commit / push rules, Current build status (2026-06-30), Deploy rules, Files / folders — do not touch casually, Handoff protocol, Known risks, Legacy / conflicting (do not revive without decision) (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (3): ScreenSettings(), toneSub(), toneSub()

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): Autonomous mode, Blockers, code:bash (npm run build                    # pass (PWA + SW generated)), code:block2 (Lumen PWA — continue from docs/handoff.md.), Done, Key routes, Lumen — Agent Handoff, Next (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.26
Nodes (10): numberWord(), PriceIncreaseCard(), FlowIconName, CancellationFlow(), ChoiceRow(), FlowActions(), FlowIcon(), FlowKicker() (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.27
Nodes (8): BigNumber(), BigNumberProps, Mono(), MonoProps, StatHero(), StatHeroProps, BigNumber(), EditorialRow()

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (10): code:bash (# Option 1: Open directly in browser (simplest)), Completion Status, Design System (locked), Lumen — Subscription Intelligence, ⏳ Production PWA, ✅ Prototype (100% complete), Tech Stack (production), This Repo: What's Inside (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (10): code:block1 (User intent → Context bundle (subs, prefs, account)), Harness shape (shared pattern), Lumen — Runtime Harness Opportunity Audit, Opportunity 1 — Verdict copilot (explain + recommend), Opportunity 2 — Cancellation orchestrator, Opportunity 3 — Inbox scan agent (Gmail sync progress), Opportunity 4 — Command palette agent (⌘K), Opportunity 5 — Price alert agent (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (6): Masthead(), MastheadProps, ScreenHeadProps, SectionProps, ScreenHead(), Section()

### Community 23 - "Community 23"
Cohesion: 0.2
Nodes (9): graphify, Context window handoff (all projects), Core Directives & Auth, graphify, Local AI Model Management, Run Rituals & Diagnostics, UI/Design Standards, Universal Developer Rules for AI Agents (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (6): LumenLogoProps, Tab, TabRow(), TabRowProps, LumenLogo(), ThemeTokens

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (9): code:html (<!-- Google Fonts load string -->), code:css (--bg: #F1ECDF;), code:css (--bg: #0E1623;), code:css (/* globals.css */), Color Tokens (from `public/static/tokens.jsx`), Design System — NON-NEGOTIABLE, Styling Approach: CSS Modules + CSS Custom Properties, Typography (locked — do not substitute) (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (5): Cell, StatPairProps, StatStripProps, StatPair(), StatStrip()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (8): code:typescript (// functions/src/parsers/index.ts), code:block11 (You extract structured subscription billing data from email ), code:typescript (// Triggered on HTTP call after user connects Gmail), Gemini Prompt (from BUILD_PLAN.md §4.2), Gmail Sync Cloud Functions, gmailInitialSync, Parser Layer, gmailInitialSync

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): CI (not configured), code:yaml (# .github/workflows/ci.yml (future)), Current state, Lumen — Testing Plan, Recommended additions (future), Required checks (every handoff), Visual regression

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (4): GroupHeadProps, PullQuoteProps, GroupHead(), PullQuote()

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (6): code:bash (graphify extract .), code:bash (graphify extract .), code:bash (graphify update .), code:bash (graphify query "<question>"), code:bash (graphify hook install), Project Rules Discovery & Navigation (DOX & Graphify)

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (5): Already done (agent / CLI), code:bash (cd /Users/yb/Dev/projects/Lumen), Lumen — Setup for Yasir (one-time), Optional one click (Gmail connect), Quick links

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (5): Build Phases, Phase 1 — Shell + Auth + Data ✅, Phase 2 — Gmail Sync + Parsing (partial), Phase 3 — Full UI, Phase 4 — PWA Polish

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (5): code:bash (cd /Users/yb/Dev/projects/Lumen), Local run commands, Building the Production PWA, code:bash (cd /Users/yb/Dev/projects/Lumen), Quick Start for Production Build

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (4): Do, Do not (without owner approval), Safe-edit rules, Do not run without approval

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (3): code:json ({ "projects": { "default": "YOUR_PROJECT_ID" } }), code:bash (firebase functions:config:set gmail.client_id="..." gmail.cl), Firebase Setup Checklist (manual steps for Yasir)

## Knowledge Gaps
- **186 isolated node(s):** `CANDIDATE_INBOXES`, `MERGE_SAMPLE`, `FUTURE_KINDS`, `CARD_KINDS`, `CATEGORIES` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gmailInitialSync` connect `Community 28` to `Community 1`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `Gmail Sync Cloud Functions` connect `Community 28` to `Community 10`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `AGENTS.md — Lumen PWA: Full Build Context for Cursor / AI Agents` connect `Community 10` to `Community 35`, `Community 41`, `Community 23`, `Community 25`, `Community 28`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `CANDIDATE_INBOXES`, `MERGE_SAMPLE`, `FUTURE_KINDS` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._