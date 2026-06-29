// Desktop multi-view shell — Lumen Direction D
// Routes between: home / subs / verdicts / patterns / accounts / settings
// Plus right-sliding sub-detail panel.
const { useState: _ds, useMemo: _dm, useEffect: _de } = React;

function ScreenDesktop({ theme, tweak, setTweak, subs, activeAccount, setActiveAccount, onOpenSub, onConnect, onCancel, onOpenSearch }) {
  // View state (sidebar nav) — persisted
  const [view, setView] = _ds(() => localStorage.getItem('lumen.desktopView') || 'home');
  _de(() => { localStorage.setItem('lumen.desktopView', view); }, [view]);

  // Sub-panel state — opens slide-in side panel
  const [panelSubId, setPanelSubId] = _ds(null);
  const panelSub = subs.find(s => s.id === panelSubId);
  const openSubPanel = (s) => setPanelSubId(s.id);
  const closeSubPanel = () => setPanelSubId(null);

  // Listen for cross-component requests to open the slide panel (e.g. command palette)
  _de(() => {
    const h = (e) => {
      if (e.detail && e.detail.id) setPanelSubId(e.detail.id);
    };
    window.addEventListener('lumen:openSubPanel', h);
    return () => window.removeEventListener('lumen:openSubPanel', h);
  }, []);

  const scoped = subs.filter(s => (activeAccount === 'all' || s.account === activeAccount));
  const activeScoped = scoped.filter(s => s.status === 'active');

  return (
    <div style={{ width: '100%', height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar */}
      <DeskSidebar theme={theme} view={view} setView={setView}
        activeAccount={activeAccount} setActiveAccount={setActiveAccount}
        alertCount={activeScoped.filter(s => s.priceIncrease).length}
        onOpenSearch={onOpenSearch} />

      {/* Main scrolling area */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {view === 'home'     && <DeskHome theme={theme} tweak={tweak} subs={activeScoped} onOpenSub={openSubPanel} onOpenAlerts={() => setView('alerts')} onOpenCalendar={() => setView('calendar')} />}
        {view === 'subs'     && <DeskLedger theme={theme} tweak={tweak} subs={scoped} onOpenSub={openSubPanel} />}
        {view === 'alerts'   && <DeskAlerts theme={theme} tweak={tweak} subs={activeScoped} onOpenSub={openSubPanel} />}
        {view === 'calendar' && <DeskCalendar theme={theme} tweak={tweak} subs={activeScoped} onOpenSub={openSubPanel} />}
        {view === 'insights' && <DeskVerdicts theme={theme} tweak={tweak} subs={activeScoped} onOpenSub={openSubPanel} />}
        {view === 'patterns' && <DeskShape theme={theme} tweak={tweak} subs={activeScoped} />}
        {view === 'accounts' && <DeskMailroom theme={theme} tweak={tweak} subs={subs} onConnect={onConnect} />}
        {view === 'settings' && <DeskOffice theme={theme} tweak={tweak} setTweak={setTweak} subs={scoped} />}
      </main>

      {/* Sliding sub detail panel */}
      <DeskSubPanel sub={panelSub} theme={theme} tweak={tweak} onClose={closeSubPanel} onCancel={onCancel} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Sidebar — Fraunces nav, hairline mailbox switcher
// ═══════════════════════════════════════════════════════════════════════
function DeskSidebar({ theme, view, setView, activeAccount, setActiveAccount, alertCount = 0, onOpenSearch }) {
  const navItems = [
    { id: 'home',     label: 'Today',      icon: 'home' },
    { id: 'subs',     label: 'The Ledger', icon: 'list' },
    { id: 'alerts',   label: 'Alerts',     icon: 'bell', badge: alertCount },
    { id: 'calendar', label: 'Calendar',   icon: 'cal' },
    { id: 'insights', label: 'Verdicts',   icon: 'spark' },
    { id: 'patterns', label: 'Shape',      icon: 'chart' },
    { id: 'accounts', label: 'Mailroom',   icon: 'user' },
    { id: 'settings', label: 'Office',     icon: 'gear' },
  ];
  return (
    <aside style={{ width: 220, padding: '24px 18px', borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', gap: 18, flexShrink: 0 }}>
      <LumenLogo size={22} color={theme.text} accent={theme.accent} />

      {/* Cross-mailbox search trigger */}
      {onOpenSearch && (
        <button onClick={onOpenSearch} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: theme.surface, border: `1px solid ${theme.border}`,
          padding: '8px 10px', cursor: 'pointer',
          color: theme.textMuted,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="5" />
            <path d="M10.6 10.6L14 14" />
          </svg>
          <span style={{ flex: 1, textAlign: 'left' }}>SEARCH</span>
          <span style={{
            border: `1px solid ${theme.border}`,
            padding: '1px 5px', fontSize: 8, color: theme.textSubtle,
          }}>⌘K</span>
        </button>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em" style={{ marginBottom: 10, paddingLeft: 4 }}>SECTIONS</Mono>
        {navItems.map(n => {
          const active = n.id === view;
          return (
            <div key={n.id} onClick={() => setView(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px',
              background: active ? theme.surface : 'transparent',
              borderLeft: `2px solid ${active ? theme.accent : 'transparent'}`,
              color: active ? theme.text : theme.textMuted, cursor: 'pointer',
              fontFamily: '"Fraunces", serif', fontSize: 14,
              fontStyle: active ? 'italic' : 'normal',
              fontWeight: 500, letterSpacing: '-0.015em',
              transition: 'background 0.15s',
            }}>
              <NavIcon name={n.icon} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge > 0 && (
                <span style={{
                  minWidth: 18, height: 16, padding: '0 5px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: theme.accent, color: '#fff',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.06em', fontStyle: 'normal',
                }}>{String(n.badge).padStart(2, '0')}</span>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em" style={{ marginLeft: 4, marginBottom: 10, display: 'block' }}>MAILBOX</Mono>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {LumenData.ACCOUNTS.map((a, i) => (
            <div key={a.id} onClick={() => setActiveAccount(a.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
              background: activeAccount === a.id ? theme.surface : 'transparent',
              borderLeft: `2px solid ${activeAccount === a.id ? theme.accent : 'transparent'}`,
              cursor: 'pointer',
            }}>
              <AccountAvatar acc={a} size={18} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 500,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                color: activeAccount === a.id ? theme.text : theme.textMuted }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskHome — dashboard
// ═══════════════════════════════════════════════════════════════════════
function DeskHome({ theme, tweak, subs, onOpenSub, onOpenAlerts, onOpenCalendar }) {
  const monthly = subs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = subs.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const trend = _dm(() => LumenData.buildTrend(subs), [subs]);
  const upcoming = subs
    .map(s => ({ ...s, _d: daysUntil(s.nextCharge) }))
    .filter(s => s._d >= 0 && s._d <= 30)
    .sort((a, b) => a._d - b._d);

  const consider = subs.filter(s => s.verdict === 'cancel');
  const review = subs.filter(s => s.verdict === 'review');
  const considerMonthly = consider.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const catTotals = LumenData.CATEGORIES.map(c => ({
    ...c, total: subs.filter(s => s.category === c.id).reduce((a, s) => a + monthlyEquivalent(s), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const catGrand = catTotals.reduce((a, c) => a + c.total, 0) || 1;
  const top = [...subs].sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a)).slice(0, 8);

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24,
        paddingBottom: 18, borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">DAILY · MONDAY 29 JUN 2026 · MORNING EDITION</Mono>
          <div style={{ marginTop: 8 }}>
            <Masthead theme={theme} italic="morning" size={40}>Good</Masthead>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          <DeskPill theme={theme}><span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.semantic.good }} /> ALL INBOXES SYNCED</DeskPill>
          <DeskPill theme={theme}>CURRENCY · {tweak.currency}</DeskPill>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0, marginBottom: 18,
        borderTop: `1px solid ${theme.border}` }}>
        <KPICard theme={theme} kicker="THIS MONTH" big={fmt(tweak.currency, monthly)} sub={`${subs.length} ACTIVE SUBSCRIPTIONS`} accent>
          <div style={{ marginTop: 14 }}>
            <DeskTrendChart trend={trend} currency={tweak.currency} theme={theme} />
          </div>
        </KPICard>
        <KPICard theme={theme} kicker="ANNUALIZED" big={fmt(tweak.currency, yearly)} sub="AT CURRENT CADENCE" />
        <KPICard theme={theme} kicker="RECLAIMABLE" big={fmt(tweak.currency, considerMonthly)} sub={`/MO ACROSS ${consider.length} SUBS`} accentText={theme.accent} />
      </div>

      {/* Price-increase strip — full-width editorial alert */}
      {subs.some(s => s.priceIncrease) && (
        <div style={{ marginBottom: 14, border: `1px solid ${theme.border}`,
          background: theme.surface }}>
          <DeskPriceIncreaseStrip theme={theme} tweak={tweak} subs={subs} onOpenSub={onOpenSub} onOpenAlerts={onOpenAlerts} />
        </div>
      )}

      {/* Two-col content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        {/* Top spend */}
        <DeskCard theme={theme} kicker="TOP SPEND" title="The ledger" action={<span onClick={() => null} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.accent, cursor: 'pointer' }}>VIEW ALL →</span>}>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DeskTableHeader theme={theme} />
            {top.map(s => <DeskTableRow key={s.id} sub={s} theme={theme} tweak={tweak} tone={tweak.aiTone} onClick={() => onOpenSub(s)} />)}
          </div>
        </DeskCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DeskCard theme={theme} kicker="VERDICTS · EVIDENCE-BASED" title="Worth reviewing">
            <div style={{ marginTop: 10 }}>
              {[...consider, ...review].slice(0, 4).map((s, i) => (
                <div key={s.id} onClick={() => onOpenSub(s)} style={{
                  padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                }}>
                  <MerchantGlyph sub={s} size={28} radius={2} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.015em' }}>{s.merchant}</div>
                    <Mono color={theme.textMuted} size={9} tracking="0.10em" style={{ display: 'block', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{s.evidence[0]}</Mono>
                  </div>
                  <VerdictTag verdict={s.verdict} tone={tweak.aiTone} theme={theme} />
                </div>
              ))}
            </div>
          </DeskCard>

          <DeskCard theme={theme} kicker="NEXT 30 DAYS" title="Up next">
            <div style={{ marginTop: 10 }}>
              {upcoming.slice(0, 5).map((s, i) => (
                <div key={s.id} onClick={() => onOpenSub(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`, cursor: 'pointer' }}>
                  <Mono color={s._d <= 3 ? theme.accent : theme.textSubtle} size={9.5} tracking="0.12em" style={{ width: 28 }}>{s._d}d</Mono>
                  <div style={{ flex: 1, fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.015em' }}>{s.merchant}</div>
                  <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, s.amountPKR)}</div>
                </div>
              ))}
            </div>
            {onOpenCalendar && (
              <button onClick={onOpenCalendar} style={{
                marginTop: 12, padding: '6px 0', background: 'transparent',
                border: 'none', borderTop: `1px solid ${theme.border}`,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5,
                color: theme.accent, letterSpacing: '0.18em', textTransform: 'uppercase',
                width: '100%',
              }}>OPEN CALENDAR →</button>
            )}
          </DeskCard>

          <DeskCard theme={theme} kicker="BY CATEGORY" title="Where it goes">
            <div style={{ marginTop: 12, display: 'flex', height: 4, background: theme.border }}>
              {catTotals.map(c => (
                <div key={c.id} style={{ width: `${(c.total / catGrand) * 100}%`, background: c.swatch }} />
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              {catTotals.slice(0, 4).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                  <CategoryDot id={c.id} />
                  <span style={{ flex: 1, fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 500, color: theme.text, letterSpacing: '-0.01em' }}>{c.label}</span>
                  <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13.5, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, c.total)}</span>
                </div>
              ))}
            </div>
          </DeskCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskLedger — full subscription list
// ═══════════════════════════════════════════════════════════════════════
function DeskLedger({ theme, tweak, subs, onOpenSub }) {
  const [query, setQuery] = _ds('');
  const [tab, setTab] = _ds('all');
  const [exportToast, setExportToast] = _ds(0); // 0 = hidden, else count exported
  _de(() => {
    if (!exportToast) return;
    const t = setTimeout(() => setExportToast(0), 2400);
    return () => clearTimeout(t);
  }, [exportToast]);

  const active = subs.filter(s => s.status === 'active');
  const past = subs.filter(s => s.status !== 'active');

  const monthly = active.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = active.reduce((a, s) => a + yearlyEquivalent(s), 0);

  const filterFn = (s) => {
    if (tab === 'active' && s.status !== 'active') return false;
    if (tab === 'past' && s.status === 'active') return false;
    if (tab === 'keep'   && s.verdict !== 'keep') return false;
    if (tab === 'review' && s.verdict !== 'review') return false;
    if (tab === 'cancel' && s.verdict !== 'cancel') return false;
    if (query && !s.merchant.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  };
  const visible = [...subs].filter(filterFn)
    .sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a));

  const tabs = [
    { id: 'all',    label: 'All',     count: subs.length },
    { id: 'active', label: 'Active',  count: active.length },
    { id: 'past',   label: 'Past',    count: past.length },
    { id: 'keep',   label: 'Keep',    count: subs.filter(s => s.verdict === 'keep').length },
    { id: 'review', label: 'Review',  count: subs.filter(s => s.verdict === 'review').length },
    { id: 'cancel', label: 'Cancel',  count: subs.filter(s => s.verdict === 'cancel').length },
  ];

  return (
    <div style={{ padding: '32px 36px' }}>
      <DeskMasthead theme={theme}
        kicker="VOL. III · THE FULL REGISTER"
        rightKicker={`${subs.length} ENTRIES ON FILE`}
        masthead="All"
        italic="subs"
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 18,
        borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <KPICard theme={theme} kicker="THIS MONTH" big={fmt(tweak.currency, monthly)} sub={`${active.length} ACTIVE`} accent flat />
        <KPICard theme={theme} kicker="ANNUALIZED" big={fmt(tweak.currency, yearly)} sub="AT CADENCE" flat />
        <KPICard theme={theme} kicker="ON FILE" big={String(subs.length).padStart(2, '0')} sub={`${past.length} CLOSED · ${active.length} OPEN`} flat />
      </div>

      {/* Search + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '0 0 320px' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="SEARCH MERCHANT, CATEGORY…"
            style={{ width: '100%', padding: '10px 12px 10px 32px', background: 'transparent',
              border: 'none', borderBottom: `1px solid ${theme.border}`,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.10em',
              color: theme.text, outline: 'none', textTransform: 'uppercase' }} />
          <svg width="12" height="12" viewBox="0 0 14 14" style={{ position: 'absolute', left: 10, top: 12, opacity: 0.55 }}>
            <circle cx="6" cy="6" r="4" stroke={theme.textMuted} strokeWidth="1.4" fill="none" />
            <path d="M9 9l3 3" stroke={theme.textMuted} strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 18, justifyContent: 'flex-end' }}>
          {tabs.map(t => {
            const on = t.id === tab;
            return (
              <span key={t.id} onClick={() => setTab(t.id)} style={{
                fontFamily: '"Inter Tight", sans-serif', fontWeight: 600, fontSize: 12.5,
                letterSpacing: '-0.01em', color: on ? theme.text : theme.textMuted,
                paddingBottom: 4, borderBottom: on ? `2px solid ${theme.accent}` : '2px solid transparent',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: 5,
              }}>
                {t.label}
                <span style={{ fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10, color: theme.textSubtle, fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums' }}>{String(t.count).padStart(2, '0')}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Full table */}
      <div style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.9fr', gap: 14,
          padding: '12px 6px', borderBottom: `1px solid ${theme.border}` }}>
          {['MERCHANT', 'CATEGORY', 'CARD', 'NEXT CHARGE', 'AMOUNT', 'VERDICT'].map((h, i) => (
            <Mono key={i} color={theme.textSubtle} size={9} tracking="0.18em">{h}</Mono>
          ))}
        </div>
        {visible.length === 0 ? (
          <div style={{ padding: '40px 6px', textAlign: 'center' }}>
            <span style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic',
              fontSize: 17, color: theme.textMuted }}>No entries match this filter.</span>
          </div>
        ) : visible.map(s => (
          <div key={s.id} onClick={() => onOpenSub(s)} style={{
            display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 0.9fr', gap: 14,
            padding: '14px 6px', alignItems: 'center', borderTop: `1px solid ${theme.border}`,
            cursor: 'pointer', opacity: s.status === 'active' ? 1 : 0.55,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MerchantGlyph sub={s} size={30} radius={2} />
              <div>
                <div style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 600, color: theme.text, letterSpacing: '-0.015em' }}>{s.merchant}</div>
                <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ marginTop: 2, display: 'block' }}>
                  {s.cycle.toUpperCase()} · SINCE {s.since}
                </Mono>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CategoryDot id={s.category} size={7} />
              <Mono color={theme.textMuted} size={9.5} tracking="0.10em">{LumenData.CATEGORIES.find(c => c.id === s.category)?.label}</Mono>
            </div>
            <CardChip kind={s.card} last4={s.last4} theme={theme} />
            <Mono color={daysUntil(s.nextCharge) <= 3 && s.status === 'active' ? theme.accent : theme.textMuted} size={10} tracking="0.10em">
              {s.status === 'active' ? fmtDateShort(s.nextCharge).toUpperCase() : 'CLOSED'}
            </Mono>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, s.amountPKR)}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <VerdictTag verdict={s.verdict} tone={tweak.aiTone} theme={theme} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
          SHOWING {visible.length} OF {subs.length}
        </Mono>
        <button onClick={() => {
          const count = exportSubsToCSV(visible, tweak.currency);
          setExportToast(count);
        }} style={{ background: 'transparent', border: `1px solid ${theme.border}`,
          padding: '8px 14px', color: theme.text, cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg width="11" height="11" viewBox="0 0 14 14">
            <path d="M7 1v9M3 6l4 4 4-4M2 13h10" stroke={theme.text} strokeWidth="1.4"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          EXPORT CSV
        </button>
      </div>

      <ExportToast open={exportToast > 0} theme={theme} count={exportToast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskVerdicts — recommendations grouped
// ═══════════════════════════════════════════════════════════════════════
function DeskVerdicts({ theme, tweak, subs, onOpenSub }) {
  const cancel = subs.filter(s => s.verdict === 'cancel');
  const review = subs.filter(s => s.verdict === 'review');
  const keep   = subs.filter(s => s.verdict === 'keep');
  const monthlyReclaim = cancel.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearlyReclaim  = cancel.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const reviewReclaim  = review.reduce((a, s) => a + monthlyEquivalent(s), 0);

  return (
    <div style={{ padding: '32px 36px' }}>
      <DeskMasthead theme={theme}
        kicker="VOL. III · THE EDITOR'S DESK"
        rightKicker={`${cancel.length + review.length} ENTRIES TO CONSIDER`}
        masthead="What to"
        italic="drop"
      />

      {/* Reclaim hero */}
      <div style={{ marginTop: 18, padding: '24px 24px 28px', border: `1px solid ${theme.border}`,
        position: 'relative', background: theme.surface }}>
        <span style={{ position: 'absolute', top: 28, left: 24, width: 22, height: 1.5, background: theme.accent }} />
        <div style={{ paddingLeft: 30 }}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">RECLAIMABLE · MONTHLY</Mono>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <BigNumber size={64} color={theme.accent}>{fmt(tweak.currency, monthlyReclaim)}</BigNumber>
          <div style={{ display: 'flex', gap: 0 }}>
            <ReclaimCell theme={theme} k="YEARLY" v={fmt(tweak.currency, yearlyReclaim)} accent />
            <ReclaimCell theme={theme} k="SUBS TO CANCEL" v={String(cancel.length).padStart(2, '0')} />
            <ReclaimCell theme={theme} k="WORTH REVIEW" v={`+${fmt(tweak.currency, reviewReclaim)}/MO`} />
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <div style={{ marginTop: 22, paddingBottom: 22, borderBottom: `1px solid ${theme.border}` }}>
        <PullQuote theme={theme} by="By Lumen · quiet verdict">
          {cancel.length === 0
            ? `Nothing to drop right now. Usage and price are well-matched across the register.`
            : `${cancel.length} subscriptions show usage well below their renewal cost. ${review.length} more sit on the edge.`}
        </PullQuote>
      </div>

      {/* Group: cancel */}
      {cancel.length > 0 && (
        <>
          <GroupHead theme={theme} num="01" title="Consider cancelling" sub="PRIORITY" />
          <div style={{ padding: '0 24px', borderBottom: `1px solid ${theme.border}` }}>
            {cancel.map((s, i) => (
              s.priceIncrease ? (
                <PriceJumpRow key={s.id} sub={s} theme={theme} tweak={tweak}
                  onClick={() => onOpenSub(s)} first={i === 0} mode="desktop"
                  verdict={<VerdictTag verdict="cancel" tone={tweak.aiTone} theme={theme} />} />
              ) : (
                <DeskVerdictRow key={s.id} sub={s} theme={theme} tweak={tweak}
                  onClick={() => onOpenSub(s)} first={i === 0} />
              )
            ))}
          </div>
        </>
      )}

      {/* Group: review */}
      {review.length > 0 && (
        <>
          <GroupHead theme={theme} num={cancel.length > 0 ? "02" : "01"} title="Worth reviewing" sub="CHECK" />
          <div style={{ padding: '0 24px', borderBottom: `1px solid ${theme.border}` }}>
            {review.map((s, i) => (
              s.priceIncrease ? (
                <PriceJumpRow key={s.id} sub={s} theme={theme} tweak={tweak}
                  onClick={() => onOpenSub(s)} first={i === 0} mode="desktop"
                  verdict={<VerdictTag verdict="review" tone={tweak.aiTone} theme={theme} />} />
              ) : (
                <DeskVerdictRow key={s.id} sub={s} theme={theme} tweak={tweak}
                  onClick={() => onOpenSub(s)} first={i === 0} />
              )
            ))}
          </div>
        </>
      )}

      {/* Group: keep — collapsed summary */}
      <>
        <GroupHead theme={theme}
          num={String((cancel.length > 0 ? 1 : 0) + (review.length > 0 ? 1 : 0) + 1).padStart(2, '0')}
          title="Earning their renewal" sub={`${keep.length} KEEP`} />
        <div style={{ padding: '4px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 24px' }}>
            {keep.map((s, i) => (
              <div key={s.id} onClick={() => onOpenSub(s)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                borderTop: i < 2 ? 'none' : `1px solid ${theme.border}`,
                cursor: 'pointer',
              }}>
                <MerchantGlyph sub={s} size={22} radius={2} />
                <span style={{ flex: 1, fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 500, color: theme.text, letterSpacing: '-0.015em' }}>{s.merchant}</span>
                <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13.5, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, s.amountPKR)}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}

function ReclaimCell({ theme, k, v, accent }) {
  return (
    <div style={{ padding: '0 18px', borderLeft: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em">{k}</Mono>
      <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontWeight: 600,
        fontSize: 18, letterSpacing: '-0.025em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        color: accent ? theme.accent : theme.text }}>{v}</div>
    </div>
  );
}

function DeskVerdictRow({ sub, theme, tweak, onClick, first }) {
  const monthly = monthlyEquivalent(sub);
  const yearly = yearlyEquivalent(sub);
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18,
      padding: '16px 0', borderTop: first ? 'none' : `1px solid ${theme.border}`,
      alignItems: 'center', cursor: 'pointer',
    }}>
      <MerchantGlyph sub={sub} size={42} radius={2} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 19,
          letterSpacing: '-0.02em', color: theme.text, lineHeight: 1.1 }}>{sub.merchant}</div>
        <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 14, color: theme.textMuted, lineHeight: 1.4, letterSpacing: '-0.005em',
          maxWidth: 600 }}>
          “{sub.evidence[0]}.”
          {sub.evidence[1] && <span style={{ color: theme.textSubtle }}> {sub.evidence[1]}.</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 20,
          letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>
          {fmt(tweak.currency, sub.cycle === 'yearly' ? yearly : monthly)}
        </div>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 4, display: 'block' }}>
          /{sub.cycle === 'yearly' ? 'YR' : 'MO'} · RECLAIMABLE
        </Mono>
      </div>
      <VerdictTag verdict={sub.verdict} tone={tweak.aiTone} theme={theme} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Shared shell pieces
// ═══════════════════════════════════════════════════════════════════════
function DeskMasthead({ theme, kicker, rightKicker, masthead, italic }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      paddingBottom: 18, borderBottom: `1px solid ${theme.border}` }}>
      <div>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{kicker}</Mono>
        <div style={{ marginTop: 8 }}>
          <Masthead theme={theme} italic={italic} size={40}>{masthead}</Masthead>
        </div>
      </div>
      {rightKicker && (
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{rightKicker}</Mono>
      )}
    </div>
  );
}

function NavIcon({ name }) {
  const props = { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <path d="M2 6l5-4 5 4v6H2V6z" />,
    list: <><path d="M2 4h10M2 7h10M2 10h7" /></>,
    spark: <path d="M7 1l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />,
    chart: <><path d="M2 12V4M5 12V7M8 12V2M11 12V9" /></>,
    user: <><circle cx="7" cy="5" r="2.5" /><path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" /></>,
    gear: <><circle cx="7" cy="7" r="2" /><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" /></>,
    bell: <><path d="M3.5 10V6.5C3.5 4.5 5 3 7 3s3.5 1.5 3.5 3.5V10M2 10h10M6 11.5a1 1 0 0 0 2 0" /></>,
    cal: <><rect x="2" y="3" width="10" height="9" /><path d="M2 6h10M5 1.5v2M9 1.5v2" /></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

function DeskPill({ theme, children }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px',
      borderLeft: `1px solid ${theme.border}`,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9.5, color: theme.textMuted, fontWeight: 500,
      letterSpacing: '0.16em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function KPICard({ theme, kicker, big, sub, accent, accentText, children, flat }) {
  return (
    <div style={{ padding: 18, position: 'relative',
      background: flat ? 'transparent' : theme.surface,
      borderRight: flat ? `1px solid ${theme.border}` : 'none',
      border: flat ? 'none' : `1px solid ${theme.border}` }}>
      {accent && (
        <span style={{ position: 'absolute', top: 18, left: 18, width: 18, height: 1.5,
          background: theme.accent }} />
      )}
      <div style={{ paddingLeft: accent ? 26 : 0 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{kicker}</Mono>
      </div>
      <div style={{ marginTop: 10 }}>
        <BigNumber size={36} color={accentText || theme.text}>{big}</BigNumber>
      </div>
      <div style={{ marginTop: 8 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.14em">{sub}</Mono>
      </div>
      {children}
    </div>
  );
}

function DeskTrendChart({ trend, currency, theme }) {
  const max = Math.max(...trend.map(t => t.pkr));
  const min = Math.min(...trend.map(t => t.pkr));
  const w = 500, h = 70;
  const step = w / (trend.length - 1);
  const pts = trend.map((t, i) => [i * step, h - ((t.pkr - min) / (max - min || 1)) * (h - 8) - 4]);
  const d = 'M ' + pts.map(p => p.join(',')).join(' L ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id="dtrend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w},${h} L 0,${h} Z`} fill="url(#dtrend)" />
      <path d={d} fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Desktop price-increase strip — full-width horizontal alert
function DeskPriceIncreaseStrip({ theme, tweak, subs, onOpenSub, onOpenAlerts }) {
  const increases = subs.filter(s => s.priceIncrease);
  if (increases.length === 0) return null;
  const monthlyDelta = increases.reduce((a, s) => {
    const mFrom = s.cycle === 'yearly' ? s.priceIncrease.fromPKR / 12 : s.priceIncrease.fromPKR;
    const mTo = s.cycle === 'yearly' ? s.priceIncrease.toPKR / 12 : s.priceIncrease.toPKR;
    return a + (mTo - mFrom);
  }, 0);
  const yearlyDeltaStr = tweak.currency === 'USD'
    ? '$' + Math.round((monthlyDelta * 12) / LumenData.FX).toLocaleString()
    : 'Rs ' + Math.round(monthlyDelta * 12).toLocaleString();
  const fmtPi = (s, kind) => {
    const v = tweak.currency === 'USD'
      ? s.priceIncrease[kind === 'from' ? 'fromUSD' : 'toUSD']
      : s.priceIncrease[kind === 'from' ? 'fromPKR' : 'toPKR'];
    const sym = tweak.currency === 'USD' ? '$' : 'Rs ';
    return sym + Math.round(v).toLocaleString();
  };
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        paddingBottom: 10, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ width: 7, height: 7, background: theme.accent, display: 'inline-block',
            transform: 'rotate(45deg)' }} />
          <Mono color={theme.accent} size={9.5} tracking="0.20em">PRICE WATCH</Mono>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            {String(increases.length).padStart(2, '0')} ALERTS · +{yearlyDeltaStr}/YR
          </Mono>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 18, fontWeight: 400, color: theme.text, letterSpacing: '-0.015em' }}>
            {increases.length === 1 ? 'One subscription' : `${increases.length} subscriptions`}{' '}
            <span style={{ color: theme.accent }}>raised{increases.length === 1 ? ' its' : ' their'} price.</span>
          </div>
          {onOpenAlerts && (
            <span onClick={onOpenAlerts} style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.16em', color: theme.accent, cursor: 'pointer', textTransform: 'uppercase',
            }}>INBOX →</span>
          )}
        </div>
      </div>
      {/* Three-column horizontal row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(increases.length, 3)}, 1fr)`,
        marginTop: 12 }}>
        {increases.slice(0, 3).map((s, i) => (
          <div key={s.id} onClick={() => onOpenSub(s)} style={{
            padding: '10px 16px',
            borderRight: i < Math.min(increases.length, 3) - 1 ? `1px solid ${theme.border}` : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
              letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{s.merchant}</div>
            <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'baseline', gap: 6,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.04em' }}>
              <span style={{ color: theme.textMuted, textDecoration: 'line-through',
                textDecorationColor: theme.textSubtle, textDecorationThickness: '1px' }}>
                {fmtPi(s, 'from')}
              </span>
              <span style={{ color: theme.textSubtle }}>→</span>
              <span style={{ color: theme.accent, fontWeight: 600 }}>{fmtPi(s, 'to')}</span>
              <span style={{ color: theme.textSubtle, paddingLeft: 4 }}>
                +{Math.round(((s.priceIncrease.toPKR - s.priceIncrease.fromPKR) / s.priceIncrease.fromPKR) * 100)}%
              </span>
            </div>
            <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9, color: theme.textSubtle, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              EFFECTIVE {fmtDateShort(s.priceIncrease.date).toUpperCase()} · {s.cycle.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeskCard({ theme, kicker, title, action, children, titleStyle }) {
  return (
    <div style={{ padding: 18, background: theme.surface, border: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 10, borderBottom: `1px solid ${theme.border}`, marginBottom: 4 }}>
        <div>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{kicker}</Mono>
          <div style={{ marginTop: 4, fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 700,
            letterSpacing: '-0.025em', color: theme.text, ...titleStyle }}>{title}</div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function DeskTableHeader({ theme }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.7fr',
      gap: 12, padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
      {['MERCHANT', 'CATEGORY', 'CARD', 'CYCLE', 'AMOUNT', 'VERDICT'].map((h, i) => (
        <Mono key={i} color={theme.textSubtle} size={9} tracking="0.18em">{h}</Mono>
      ))}
    </div>
  );
}

function DeskTableRow({ sub, theme, tweak, tone, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.7fr', gap: 12,
      padding: '12px 0', alignItems: 'center', borderTop: `1px solid ${theme.border}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <MerchantGlyph sub={sub} size={24} radius={2} />
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.015em' }}>{sub.merchant}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <CategoryDot id={sub.category} size={7} />
        <Mono color={theme.textMuted} size={9.5} tracking="0.10em">{LumenData.CATEGORIES.find(c => c.id === sub.category)?.label}</Mono>
      </div>
      <Mono color={theme.textMuted} size={9.5} tracking="0.10em">{LumenData.CARD_KINDS[sub.card].label}·{sub.last4}</Mono>
      <Mono color={theme.textMuted} size={9.5} tracking="0.10em">{sub.cycle}</Mono>
      <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, sub.amountPKR)}</span>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <VerdictTag verdict={sub.verdict} tone={tone} theme={theme} />
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenDesktop, DeskHome, DeskLedger, DeskVerdicts,
  DeskSidebar, DeskMasthead, DeskPill, KPICard,
  DeskCard, DeskTrendChart, DeskTableHeader, DeskTableRow, DeskVerdictRow, ReclaimCell,
});
