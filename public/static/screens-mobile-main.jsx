// Mobile main screens — Dashboard, List, Detail — Direction D · Editorial + Stats
const { useState: _ms, useEffect: _me, useMemo: _mm } = React;

// ── helpers ───────────────────────────────────────────────────────────
function monthlyEquivalent(s) { return s.cycle === 'yearly' ? s.amountPKR / 12 : s.amountPKR; }
function yearlyEquivalent(s)  { return s.cycle === 'yearly' ? s.amountPKR : s.amountPKR * 12; }
function fmt(currency, pkr) {
  if (currency === 'USD') return LumenData.fmtMoney(pkr / LumenData.FX, 'USD');
  return LumenData.fmtMoney(pkr, 'PKR');
}
// Format a number short — "28,460" / "341K" / "1.2M"
function fmtCompact(currency, pkr) {
  const v = currency === 'USD' ? pkr / LumenData.FX : pkr;
  const sym = currency === 'USD' ? '$' : 'Rs ';
  if (v >= 1_000_000) return sym + (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)     return sym + Math.round(v / 1_000) + 'K';
  return sym + Math.round(v).toLocaleString();
}
// Split a Rs/$ string into [ccy, number] so we can render with primitives
function splitMoney(currency, pkr) {
  const v = currency === 'USD' ? pkr / LumenData.FX : pkr;
  const ccy = currency === 'USD' ? '$' : 'Rs';
  return [ccy, Math.round(v).toLocaleString()];
}

// ═══════════════════════════════════════════════════════════════════════
// Top bar — small editorial overhead with date and mailbox switcher
// ═══════════════════════════════════════════════════════════════════════
function TopMeta({ theme, activeAccount, onAccountSwitcher }) {
  const acc = LumenData.ACCOUNTS.find(a => a.id === activeAccount);
  return (
    <div style={{ padding: '56px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONDAY · 29 JUN 2026</Mono>
      <div onClick={onAccountSwitcher} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        padding: '4px 8px', border: `1px solid ${theme.border}`,
      }}>
        <AccountAvatar acc={acc} size={16} />
        <Mono color={theme.text} size={9.5} tracking="0.12em">{acc.label}</Mono>
        <svg width="8" height="5" viewBox="0 0 8 5"><path d="M1 1l3 3 3-3" stroke={theme.textMuted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
      </div>
    </div>
  );
}

function AccountAvatar({ acc, size = 22 }) {
  if (acc.id === 'all') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #C8413A, #5B7DB1, #9BAE7C, #C8413A)' }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: acc.color,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fraunces", serif', fontWeight: 700,
      fontSize: size * 0.5 }}>
      {acc.label.charAt(0)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════════════
function ScreenDashboard({ theme, tweak, subs, activeAccount, onOpenSub, onNav, onAccountSwitcher, onConnect, onOpenSearch }) {
  const activeSubs = subs.filter(s => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount));

  // Empty state — light scenario with zero active subs in scope
  if (activeSubs.length === 0) {
    return <EmptyDashboard theme={theme} activeAccount={activeAccount}
      onConnect={onConnect} onSwitch={onAccountSwitcher} />;
  }

  const monthly = activeSubs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = activeSubs.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const trend = _mm(() => LumenData.buildTrend(activeSubs), [subs, activeAccount]);
  const upcoming = activeSubs
    .map(s => ({ ...s, _d: daysUntil(s.nextCharge) }))
    .filter(s => s._d >= 0 && s._d <= 14)
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  const reviewSubs = activeSubs.filter(s => s.verdict !== 'keep');
  const monthlyReviewSaving = reviewSubs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const cancelSubs = activeSubs.filter(s => s.verdict === 'cancel');

  // Featured pull-quote — pick the "loudest" cancel sub if any
  const featured = cancelSubs[0] || reviewSubs[0];

  const [ccy, num] = splitMoney(tweak.currency, monthly);
  const acc = LumenData.ACCOUNTS.find(a => a.id === activeAccount);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110 }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      {/* Masthead — Lumen. */}
      <div style={{ padding: '4px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <Masthead theme={theme} size={36}>Lumen</Masthead>
          {onOpenSearch && (
            <button onClick={onOpenSearch} aria-label="Search all inboxes" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'transparent', border: `1px solid ${theme.border}`,
              padding: '6px 10px', cursor: 'pointer', color: theme.textMuted,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="7" r="5" />
                <path d="M10.6 10.6L14 14" />
              </svg>
              SEARCH
            </button>
          )}
        </div>
        <div style={{ marginTop: 6 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            DAILY · MORNING EDITION · {acc.label.toUpperCase()} · {activeSubs.length} ACTIVE
          </Mono>
        </div>
      </div>

      {/* Hero stat — monthly spend */}
      <StatHero theme={theme} label="MONTHLY SPEND" value={num} ccy={ccy}>
        <TrendChart trend={trend} theme={theme} />
      </StatHero>

      {/* Stat strip — yearly / active / reclaim */}
      <StatStrip theme={theme} cells={[
        { k: 'YEARLY', v: fmtCompact(tweak.currency, yearly), s: 'at cadence' },
        { k: 'ACTIVE', v: String(activeSubs.length).padStart(2, '0'), s: 'subscriptions' },
        { k: 'RECLAIM', v: fmtCompact(tweak.currency, monthlyReviewSaving), s: `${reviewSubs.length} to review`, accent: true },
      ]} />

      {/* Pull quote — Lumen's voice on the loudest review */}
      {featured && (
        <PullQuote theme={theme} by={`Lumen, on ${featured.merchant}`}>
          {featured.evidence[0]}
        </PullQuote>
      )}

      {/* Price-increase alert — editorial card with old→new price strips */}
      <PriceIncreaseCard theme={theme} tweak={tweak} subs={activeSubs}
        onOpenSub={onOpenSub} onOpenAlerts={() => onNav('alerts')} />

      {/* Up next */}
      <Section theme={theme} kicker="UP NEXT · 14 DAYS"
        action={<span onClick={() => onNav('list')} style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
          letterSpacing: '0.16em', color: theme.accent, cursor: 'pointer', textTransform: 'uppercase',
        }}>SEE ALL →</span>}>
        {upcoming.length === 0 ? (
          <div style={{ padding: '12px 0', color: theme.textMuted, fontSize: 13,
            fontFamily: '"Fraunces", serif', fontStyle: 'italic' }}>
            Nothing renews in the next two weeks.
          </div>
        ) : (
          upcoming.map((s, i) => (
            <EditorialRow key={s.id}
              first={i === 0}
              onClick={() => onOpenSub(s)}
              theme={theme}
              name={s.merchant}
              meta={`${fmtDateShort(s.nextCharge).toUpperCase()} · ${LumenData.CARD_KINDS[s.card].label}·${s.last4}`}
              amount={fmt(tweak.currency, s.amountPKR)}
              sub={`${s._d === 0 ? 'TODAY' : s._d === 1 ? 'TOMORROW' : `${s._d} DAYS`}`}
            />
          ))
        )}
      </Section>

      {/* Where it goes */}
      <Section theme={theme} kicker="WHERE IT GOES"
        action={<span onClick={() => onNav('patterns')} style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
          letterSpacing: '0.16em', color: theme.accent, cursor: 'pointer', textTransform: 'uppercase',
        }}>PATTERNS →</span>}>
        <CategoryStack subs={activeSubs} currency={tweak.currency} theme={theme} />
      </Section>
    </div>
  );
}

// ── Editorial trend chart (stripped down, no card chrome) ─────────────
function TrendChart({ trend, theme }) {
  const max = Math.max(...trend.map(t => t.pkr));
  const min = Math.min(...trend.map(t => t.pkr));
  const w = 340, h = 56;
  const step = w / (trend.length - 1);
  const pts = trend.map((t, i) => [i * step, h - ((t.pkr - min) / (max - min || 1)) * (h - 8) - 4]);
  const d = 'M ' + pts.map(p => p.join(',')).join(' L ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id="dg-trend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.20" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w},${h} L 0,${h} Z`} fill="url(#dg-trend)" />
      <path d={d} fill="none" stroke={theme.accent} strokeWidth="1.5" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={theme.accent} />
    </svg>
  );
}

// ── Category stack — editorial flat (no card chrome) ──────────────────
function CategoryStack({ subs, currency, theme }) {
  const totals = LumenData.CATEGORIES.map(c => {
    const total = subs.filter(s => s.category === c.id).reduce((a, s) => a + monthlyEquivalent(s), 0);
    return { ...c, total };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const grand = totals.reduce((a, c) => a + c.total, 0) || 1;
  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 6, marginBottom: 14, marginTop: 4 }}>
        {totals.map(c => (
          <div key={c.id} title={c.label} style={{ width: `${(c.total / grand) * 100}%`, background: c.swatch }} />
        ))}
      </div>
      {/* Rows */}
      {totals.map((c, i) => (
        <div key={c.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
        }}>
          <CategoryDot id={c.id} size={8} />
          <span style={{ flex: 1, fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 500,
            color: theme.text, letterSpacing: '-0.01em' }}>{c.label}</span>
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 600,
            color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
            {fmt(currency, c.total)}
          </span>
          <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ width: 32, textAlign: 'right' }}>
            {Math.round((c.total / grand) * 100)}%
          </Mono>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Subscriptions list — "All subs."
// ═══════════════════════════════════════════════════════════════════════
function ScreenList({ theme, tweak, subs, activeAccount, onOpenSub, onAccountSwitcher }) {
  const [tab, setTab] = _ms('active');
  const [query, setQuery] = _ms('');

  const scoped = subs.filter(s => activeAccount === 'all' || s.account === activeAccount);
  const counts = {
    active: scoped.filter(s => s.status === 'active').length,
    upcoming: scoped.filter(s => s.status === 'active' && daysUntil(s.nextCharge) >= 0 && daysUntil(s.nextCharge) <= 30).length,
    past: scoped.filter(s => s.status !== 'active').length,
  };

  const filtered = scoped
    .filter(s => {
      if (tab === 'active') return s.status === 'active';
      if (tab === 'upcoming') return s.status === 'active' && daysUntil(s.nextCharge) >= 0 && daysUntil(s.nextCharge) <= 30;
      if (tab === 'past') return s.status !== 'active';
      return true;
    })
    .filter(s => !query || s.merchant.toLowerCase().includes(query.toLowerCase()));

  filtered.sort((a, b) => tab === 'upcoming'
    ? daysUntil(a.nextCharge) - daysUntil(b.nextCharge)
    : monthlyEquivalent(b) - monthlyEquivalent(a));

  // Totals across active scope (used in stat-pair)
  const activeScope = scoped.filter(s => s.status === 'active');
  const monthly = activeScope.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = activeScope.reduce((a, s) => a + yearlyEquivalent(s), 0);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110 }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      <ScreenHead theme={theme}
        kicker="THE SUBSCRIPTION LEDGER"
        rightKicker={`${counts.active} ACTIVE`}
        masthead="All"
        italic="subs"
        meta="SORTED BY MONTHLY COST" />

      <StatPair theme={theme} cells={[
        { k: 'THIS MONTH', v: fmt(tweak.currency, monthly), s: `across ${counts.active} subs` },
        { k: 'YEARLY', v: fmt(tweak.currency, yearly), s: 'at current cadence' },
      ]} />

      {/* Search */}
      <div style={{ padding: '14px 24px 10px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 14 14">
            <circle cx="6" cy="6" r="4.5" fill="none" stroke={theme.textMuted} strokeWidth="1.3"/>
            <path d="M9.5 9.5L12.5 12.5" stroke={theme.textMuted} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search merchants…" style={{
            flex: 1, border: 'none', background: 'transparent', color: theme.text,
            fontFamily: '"Fraunces", serif', fontStyle: query ? 'normal' : 'italic',
            fontSize: 14, outline: 'none', letterSpacing: '-0.01em',
          }} />
        </div>
      </div>

      <TabRow theme={theme} active={tab} onChange={setTab} tabs={[
        { id: 'active', label: 'Active', count: counts.active },
        { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
        { id: 'past', label: 'Past', count: counts.past },
      ]} />

      {/* List */}
      <Section theme={theme} padding="14px 24px" noBorder>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px 0', color: theme.textMuted, fontSize: 14,
            fontFamily: '"Fraunces", serif', fontStyle: 'italic', textAlign: 'center' }}>
            Nothing here.
          </div>
        ) : (
          filtered.map((s, i) => (
            <EditorialRow key={s.id}
              first={i === 0}
              onClick={() => onOpenSub(s)}
              theme={theme}
              name={s.merchant}
              meta={`${LumenData.CATEGORIES.find(c => c.id === s.category)?.label.toUpperCase()} · ${LumenData.CARD_KINDS[s.card].label}·${s.last4} · ${s.cycle.toUpperCase()}`}
              amount={fmt(tweak.currency, s.amountPKR)}
              verdict={<VerdictTag verdict={s.verdict} tone={tweak.aiTone} theme={theme} />}
            />
          ))
        )}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Subscription detail — "merchant.json"
// ═══════════════════════════════════════════════════════════════════════
function ScreenSubDetail({ theme, tweak, sub, onClose, onTagCard, onTagCategory, onCancel }) {
  if (!sub) return null;
  const tone = tweak.aiTone;
  const account = LumenData.ACCOUNTS.find(a => a.id === sub.account);
  const monthly = monthlyEquivalent(sub);
  const yearly = yearlyEquivalent(sub);
  const d = daysUntil(sub.nextCharge);
  const [ccy, num] = splitMoney(tweak.currency, sub.cycle === 'yearly' ? yearly : monthly);
  const isCancelled = sub.status === 'past' && sub.verdict === 'cancel';

  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.bg, color: theme.text,
      fontFamily: theme.fontUI, overflowY: 'auto', paddingBottom: 110, zIndex: 10 }}>

      {/* Header bar with back chevron */}
      <div style={{ padding: '56px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 28, height: 28, border: `1px solid ${theme.border}`,
          background: 'transparent', color: theme.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14"><path d="M8.5 2L3.5 7l5 5" stroke={theme.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">FILE NO. {sub.id.toUpperCase()}</Mono>
        <button style={{
          width: 28, height: 28, border: `1px solid ${theme.border}`,
          background: 'transparent', color: theme.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14"><circle cx="7" cy="3" r="1.1" fill={theme.text}/><circle cx="7" cy="7" r="1.1" fill={theme.text}/><circle cx="7" cy="11" r="1.1" fill={theme.text}/></svg>
        </button>
      </div>

      {/* Editorial masthead */}
      <div style={{ padding: '14px 24px 18px', borderBottom: `1px solid ${theme.border}`,
        opacity: isCancelled ? 0.85 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <MerchantGlyph sub={sub} size={52} radius={2} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
              fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1,
              color: isCancelled ? theme.textMuted : theme.text }}>
              {sub.merchant}<span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>.</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Mono color={theme.textMuted} size={9} tracking="0.14em">
                SINCE {sub.since.toUpperCase()} · {(account.email || account.label).toUpperCase()}
              </Mono>
            </div>
          </div>
        </div>
        {isCancelled && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CancelledStamp theme={theme} size="md" />
            <Mono color={theme.textSubtle} size={9} tracking="0.16em">
              MOVED TO PAST · NO RENEWAL
            </Mono>
          </div>
        )}
      </div>

      {/* Hero price */}
      {isCancelled ? (
        <div style={{ padding: '22px 24px 24px', borderBottom: `1px solid ${theme.border}`,
          position: 'relative' }}>
          <span style={{ position: 'absolute', top: 26, left: 24, width: 18, height: 1.5,
            background: theme.textSubtle }} />
          <div style={{ paddingLeft: 26 }}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
              WAS {sub.cycle === 'yearly' ? 'PER YEAR' : 'PER MONTH'}
            </Mono>
          </div>
          <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
            <BigNumber size={46} color={theme.textMuted} ccy={ccy}>{num}</BigNumber>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '52%',
              height: 1.5, background: theme.accent, transform: 'rotate(-3deg)' }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.14em">
              RECLAIMED · {fmt(tweak.currency, yearly)} / YEAR
            </Mono>
          </div>
        </div>
      ) : (
        <StatHero theme={theme}
          label={sub.cycle === 'yearly' ? 'PER YEAR' : 'PER MONTH'}
          value={num} ccy={ccy}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.14em">
            ≈ {fmt(tweak.currency, sub.cycle === 'yearly' ? monthly : yearly)} / {sub.cycle === 'yearly' ? 'MONTH' : 'YEAR'}
          </Mono>
        </StatHero>
      )}

      {/* Stat pair — next charge + verdict */}
      <StatPair theme={theme} cells={[
        { k: 'NEXT CHARGE', v: fmtDateShort(sub.nextCharge),
          s: d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`,
          accent: d <= 3 },
        { k: 'VERDICT', v: (sub.verdict === 'cancel' ? 'Cancel' : sub.verdict === 'review' ? 'Review' : 'Keep'),
          s: tone === 'quiet' ? 'evidence-based' : tone === 'confident' ? 'with confidence' : 'with care',
          accent: sub.verdict !== 'keep' },
      ]} />

      {/* AI verdict block — editorial pull-quote style */}
      <PullQuote theme={theme} by={`Lumen verdict · ${tone}`}>
        {verdictHeadline(sub, tone)}
      </PullQuote>

      {/* Price history sparkline — only for subs with a recorded increase */}
      {sub.priceIncrease && <PriceHistorySparkline theme={theme} tweak={tweak} sub={sub} width={340} />}

      {/* Shared-with-family row — only for plans with multiple members */}
      {sub.sharedWith && <SharedWith theme={theme} tweak={tweak} sub={sub} />}

      <Section theme={theme} kicker="THE EVIDENCE">
        {sub.evidence.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              fontWeight: 500, color: theme.textSubtle, letterSpacing: '0.12em',
              minWidth: 24, paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14.5,
              color: theme.text, lineHeight: 1.45, letterSpacing: '-0.005em' }}>{e}</span>
          </div>
        ))}
      </Section>

      {/* Tags — editorial rows */}
      <Section theme={theme} kicker="VERIFIED TAGS">
        <TagRow theme={theme} label="Payment method" onClick={() => onTagCard(sub)} first>
          <CardChip kind={sub.card} last4={sub.last4} theme={theme} />
        </TagRow>
        <TagRow theme={theme} label="Category" onClick={() => onTagCategory(sub)}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CategoryDot id={sub.category} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: theme.text }}>
              {LumenData.CATEGORIES.find(c => c.id === sub.category)?.label}
            </span>
          </div>
        </TagRow>
        <TagRow theme={theme} label="Gmail">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AccountAvatar acc={account} size={14} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              fontWeight: 600, letterSpacing: '0.08em', color: theme.text }}>
              {account.email || account.label}
            </span>
          </div>
        </TagRow>
      </Section>

      {/* History — column of editorial rows */}
      <Section theme={theme} kicker={`TRANSACTION HISTORY · LAST ${sub.history.length}`}>
        {sub.history.map((h, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center',
            padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.semantic.good }} />
            <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 500, fontSize: 14,
              color: theme.text, letterSpacing: '-0.01em' }}>{fmtDateShort(h.date)}</span>
            <Mono color={theme.textSubtle} size={9} tracking="0.16em">VERIFIED</Mono>
            <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
              color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
              {fmt(tweak.currency, h.pkr)}
            </span>
          </div>
        ))}
      </Section>

      {/* Verdict-change history timeline */}
      <VerdictHistory theme={theme} sub={sub} />

      {/* Actions */}
      <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isCancelled ? (
          <>
            <div style={{
              height: 50, border: `1px solid ${theme.border}`, background: 'transparent',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              color: theme.textMuted,
            }}>
              <svg width="11" height="11" viewBox="0 0 14 14">
                <path d="M3 7l3 3 5-6" stroke={theme.semantic.good} strokeWidth="1.6"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filed as cancelled
            </div>
            <button onClick={onClose} style={{
              height: 40, border: 'none', background: 'transparent', color: theme.textMuted,
              fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>
              Back to the ledger
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onCancel && onCancel(sub)} style={{
              height: 50, border: `1px solid ${theme.borderHi}`,
              background: sub.verdict === 'cancel' ? theme.accent : 'transparent',
              color: sub.verdict === 'cancel' ? '#fff' : theme.text,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              Open cancel link
              <svg width="11" height="11" viewBox="0 0 12 12"><path d="M4 2h6v6M10 2L3 9" stroke={sub.verdict === 'cancel' ? '#fff' : theme.text} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
            </button>
            <button onClick={() => onCancel && onCancel(sub)} style={{
              height: 40, border: 'none',
              background: 'transparent', color: theme.textMuted,
              fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>
              Mark as cancelled manually
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function verdictHeadline(s, tone) {
  if (tone === 'conversational') {
    if (s.verdict === 'keep') return `Looks like ${s.merchant} earns its keep.`;
    if (s.verdict === 'review') return `${s.merchant} is borderline — worth a closer look.`;
    return `${s.merchant} isn't earning its renewal anymore.`;
  }
  if (tone === 'confident') {
    if (s.verdict === 'keep') return `Keep ${s.merchant}.`;
    if (s.verdict === 'review') return `Review ${s.merchant}.`;
    return `Cancel ${s.merchant}.`;
  }
  // quiet — neutral, evidence-first
  if (s.verdict === 'keep') return `Usage and pricing support keeping this active.`;
  if (s.verdict === 'review') return `Usage is uneven against the price.`;
  return `Usage has dropped well below the renewal cost.`;
}

function TagRow({ theme, label, children, onClick, first }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderTop: first ? 'none' : `1px solid ${theme.border}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.16em">{label}</Mono>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children}
        {onClick && <svg width="7" height="11" viewBox="0 0 8 12"><path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>}
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenDashboard, ScreenList, ScreenSubDetail,
  monthlyEquivalent, yearlyEquivalent, fmt, fmtCompact, splitMoney,
  AccountAvatar, TopMeta,
});
