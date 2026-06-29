// Mobile aux — Recommendations, Patterns, Accounts, Settings + sheets — D editorial
const { useState: _as, useMemo: _am, useEffect: _ae } = React;

// ═══════════════════════════════════════════════════════════════════════
// AI Recommendations — "What to drop"
// ═══════════════════════════════════════════════════════════════════════
function ScreenRecs({ theme, tweak, subs, activeAccount, onOpenSub, onAccountSwitcher }) {
  const scoped = subs.filter(s => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount));
  const consider = scoped.filter(s => s.verdict === 'cancel');
  const review = scoped.filter(s => s.verdict === 'review');
  const keep = scoped.filter(s => s.verdict === 'keep');

  const considerMonthly = consider.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const considerYearly = consider.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const [ccy, num] = splitMoney(tweak.currency, considerMonthly);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110 }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      <ScreenHead theme={theme}
        kicker="EDITORIAL · EVIDENCE-BASED"
        rightKicker="VOL. III"
        masthead="What to"
        italic="drop"
        meta={`${consider.length} RECOMMENDATIONS · ${consider.length > 0 ? '1 PRIORITY' : 'NOTHING URGENT'}`} />

      {/* Hero stat — potential to reclaim */}
      <StatHero theme={theme} label="POTENTIAL TO RECLAIM" value={num} ccy={ccy} accent />

      <StatStrip theme={theme} cells={[
        { k: 'MONTHLY', v: splitMoney(tweak.currency, considerMonthly)[1] === '0' ? '—' : fmtCompact(tweak.currency, considerMonthly), s: '/month saved', accent: true },
        { k: 'YEARLY', v: fmtCompact(tweak.currency, considerYearly), s: '/year saved' },
        { k: 'SUBS', v: String(consider.length).padStart(2, '0'), s: 'flagged' },
      ]} />

      {/* Editorial note */}
      <PullQuote theme={theme}>
        Lumen does not auto-cancel. Each verdict is grounded in your transaction and usage history.
      </PullQuote>

      {/* Consider cancelling */}
      {consider.length > 0 && (
        <>
          <GroupHead theme={theme} num={String(consider.length).padStart(2, '0')} title="Consider cancelling" sub="PRIORITY" />
          <Section theme={theme} padding="0 24px 18px">
            {consider.map((s, i) => (
              s.priceIncrease ? (
                <PriceJumpRow key={s.id}
                  first={i === 0}
                  onClick={() => onOpenSub(s)}
                  theme={theme} tweak={tweak} sub={s}
                  verdict={<VerdictTag verdict="cancel" tone={tweak.aiTone} theme={theme} />}
                />
              ) : (
                <EditorialRow key={s.id}
                  first={i === 0}
                  onClick={() => onOpenSub(s)}
                  theme={theme}
                  name={s.merchant}
                  meta={s.evidence[0].toUpperCase()}
                  amount={fmt(tweak.currency, s.amountPKR)}
                  sub={`/${s.cycle === 'yearly' ? 'YR' : 'MO'}`}
                  verdict={<VerdictTag verdict="cancel" tone={tweak.aiTone} theme={theme} />}
                />
              )
            ))}
          </Section>
        </>
      )}

      {/* Worth reviewing */}
      {review.length > 0 && (
        <>
          <GroupHead theme={theme} num={String(review.length).padStart(2, '0')} title="Worth reviewing" sub="WATCH" />
          <Section theme={theme} padding="0 24px 18px">
            {review.map((s, i) => (
              s.priceIncrease ? (
                <PriceJumpRow key={s.id}
                  first={i === 0}
                  onClick={() => onOpenSub(s)}
                  theme={theme} tweak={tweak} sub={s}
                  verdict={<VerdictTag verdict="review" tone={tweak.aiTone} theme={theme} />}
                />
              ) : (
                <EditorialRow key={s.id}
                  first={i === 0}
                  onClick={() => onOpenSub(s)}
                  theme={theme}
                  name={s.merchant}
                  meta={s.evidence[0].toUpperCase()}
                  amount={fmt(tweak.currency, s.amountPKR)}
                  sub={`/${s.cycle === 'yearly' ? 'YR' : 'MO'}`}
                  verdict={<VerdictTag verdict="review" tone={tweak.aiTone} theme={theme} />}
                />
              )
            ))}
          </Section>
        </>
      )}

      {/* Keep — compact */}
      {keep.length > 0 && (
        <>
          <GroupHead theme={theme} num={String(keep.length).padStart(2, '0')} title="Earning their keep" sub="KEEP" />
          <Section theme={theme} padding="0 24px 18px" noBorder>
            {keep.map((s, i) => (
              <div key={s.id} onClick={() => onOpenSub(s)} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center',
                padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`, cursor: 'pointer',
              }}>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14.5,
                  color: theme.text, letterSpacing: '-0.01em' }}>{s.merchant}</div>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14,
                  color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
                  {fmt(tweak.currency, s.amountPKR)}
                </div>
                <VerdictTag verdict="keep" tone={tweak.aiTone} theme={theme} />
              </div>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Spending patterns — "The shape."
// ═══════════════════════════════════════════════════════════════════════
function ScreenPatterns({ theme, tweak, subs, activeAccount, onAccountSwitcher }) {
  const scoped = subs.filter(s => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount));
  const trend = _am(() => LumenData.buildTrend(scoped), [subs, activeAccount]);
  const monthly = scoped.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = scoped.reduce((a, s) => a + yearlyEquivalent(s), 0);

  const catTotals = LumenData.CATEGORIES.map(c => ({
    ...c, total: scoped.filter(s => s.category === c.id).reduce((a, s) => a + monthlyEquivalent(s), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const catGrand = catTotals.reduce((a, c) => a + c.total, 0) || 1;

  const cardTotals = Object.entries(LumenData.CARD_KINDS).map(([id, k]) => ({
    id, label: k.label,
    total: scoped.filter(s => s.card === id).reduce((a, s) => a + monthlyEquivalent(s), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const cardGrand = cardTotals.reduce((a, c) => a + c.total, 0) || 1;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110 }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      <ScreenHead theme={theme}
        kicker="PATTERNS · LAST 12 MONTHS"
        rightKicker="ANALYSIS"
        masthead="Spending"
        italic="shape"
        meta="MONTHLY OUTFLOW · CATEGORY · METHOD" />

      <StatPair theme={theme} cells={[
        { k: 'MONTHLY', v: fmt(tweak.currency, monthly), s: 'at cadence' },
        { k: 'ANNUALIZED', v: fmt(tweak.currency, yearly), s: 'commitment' },
      ]} />

      {/* Monthly bars */}
      <Section theme={theme} kicker="MONTHLY OUTFLOW">
        <BarChart trend={trend} theme={theme} />
      </Section>

      {/* By category — donut + legend */}
      <Section theme={theme} kicker="BY CATEGORY">
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Donut totals={catTotals} grand={catGrand}
            center={fmtCompact(tweak.currency, monthly)} subLabel="/MONTH" theme={theme} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {catTotals.slice(0, 5).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.swatch }} />
                <span style={{ flex: 1, fontFamily: '"Fraunces", serif', fontSize: 13, fontWeight: 500,
                  color: theme.text, letterSpacing: '-0.01em' }}>{c.label}</span>
                <Mono color={theme.textMuted} size={9.5} tracking="0.10em">
                  {Math.round(c.total / catGrand * 100)}%
                </Mono>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* By payment method */}
      <Section theme={theme} kicker="BY PAYMENT METHOD">
        {cardTotals.map((c, i) => (
          <div key={c.id} style={{ padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <CardChip kind={c.id} last4={subs.find(s => s.card === c.id)?.last4 || '••••'} theme={theme} />
              <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
                {fmt(tweak.currency, c.total)}<span style={{ fontSize: 10, color: theme.textMuted, marginLeft: 4,
                  fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, letterSpacing: '0.08em' }}>/MO</span>
              </span>
            </div>
            <div style={{ height: 2, background: theme.border, position: 'relative' }}>
              <div style={{ width: `${(c.total / cardGrand) * 100}%`, height: '100%',
                background: theme.accent }} />
            </div>
          </div>
        ))}
      </Section>

      {/* Annualized commitment */}
      <Section theme={theme} kicker="ANNUALIZED COMMITMENT" noBorder>
        <div style={{ paddingTop: 4 }}>
          <BigNumber size={42} color={theme.text}
            ccy={tweak.currency === 'USD' ? '$' : 'Rs'}>
            {splitMoney(tweak.currency, yearly)[1]}
          </BigNumber>
          <div style={{ marginTop: 12, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 14, color: theme.textMuted, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
            Based on currently active subscriptions billed at their stated cadence. No estimates.
          </div>
        </div>
      </Section>
    </div>
  );
}

// Editorial bar chart — thin bars, hairline baseline, no card
function BarChart({ trend, theme }) {
  const max = Math.max(...trend.map(t => t.pkr));
  const min = Math.min(...trend.map(t => t.pkr));
  const h = 120;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h,
        borderBottom: `1px solid ${theme.border}` }}>
        {trend.map((t, i) => {
          const pct = ((t.pkr - min) / (max - min || 1));
          const bh = 10 + pct * (h - 14);
          const peak = t.pkr === max;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%', height: bh,
                background: peak ? theme.accent : (theme.themeName === 'dark' ? 'rgba(242,234,214,0.32)' : 'rgba(26,39,56,0.32)'),
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {trend.map((t, i) => (
          <Mono key={i} color={t.pkr === max ? theme.accent : theme.textSubtle}
            size={8.5} tracking="0.10em" style={{ flex: 1, textAlign: 'center' }}>
            {t.month}
          </Mono>
        ))}
      </div>
    </div>
  );
}

function Donut({ totals, grand, center, subLabel, theme, size = 130 }) {
  const r = (size - 8) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.border} strokeWidth="8" />
        {totals.map((t, i) => {
          const len = (t.total / grand) * C;
          const seg = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.swatch}
              strokeWidth="8" strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset}
              strokeLinecap="butt" />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 17, fontWeight: 700,
          letterSpacing: '-0.03em', color: theme.text, fontVariantNumeric: 'tabular-nums' }}>{center}</div>
        <Mono color={theme.textSubtle} size={8.5} tracking="0.16em" style={{ marginTop: 2 }}>{subLabel}</Mono>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Accounts (multi-Gmail manager) — "The mailroom."
// ═══════════════════════════════════════════════════════════════════════
function ScreenAccounts({ theme, tweak, subs, onAccountSwitcher, activeAccount, onConnect }) {
  const accounts = LumenData.ACCOUNTS.filter(a => a.id !== 'all');
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110 }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      <ScreenHead theme={theme}
        kicker="CONNECTED MAILBOXES"
        rightKicker={`${accounts.length} CONNECTED`}
        masthead="The"
        italic="mailroom"
        meta="ONE SIGN-IN · MULTIPLE INBOXES" />

      <Section theme={theme} kicker="ALL MAILBOXES" padding="14px 24px 4px">
        {accounts.map((a, i) => {
          const count = subs.filter(s => s.account === a.id && s.status === 'active').length;
          const monthly = subs.filter(s => s.account === a.id && s.status === 'active').reduce((x, s) => x + monthlyEquivalent(s), 0);
          return (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
            }}>
              <AccountAvatar acc={a} size={38} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
                  letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{a.label}</div>
                <Mono color={theme.textSubtle} size={9.5} tracking="0.10em" style={{ display: 'block', marginTop: 4 }}>
                  {a.email}
                </Mono>
                <div style={{ marginTop: 4 }}>
                  <Mono color={theme.textMuted} size={9} tracking="0.14em">
                    {count} ACTIVE · {fmt(tweak.currency, monthly)}/MO
                  </Mono>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.16em', color: theme.semantic.good,
                  border: `1px solid ${theme.semantic.good}`, padding: '3px 6px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.semantic.good }} />
                  SYNCED
                </span>
                <Mono color={theme.textSubtle} size={8.5} tracking="0.16em">2 MIN AGO</Mono>
              </div>
            </div>
          );
        })}
      </Section>

      {/* Connect another */}
      <div style={{ padding: '8px 24px 0' }}>
        <button onClick={onConnect} style={{
          width: '100%', padding: '16px 14px',
          background: 'transparent', border: `1.5px dashed ${theme.borderHi}`,
          color: theme.text, fontFamily: theme.fontUI, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}>
          <div style={{ width: 38, height: 38,
            border: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke={theme.text} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
              letterSpacing: '-0.015em', color: theme.text }}>
              Connect another <em style={{ fontStyle: 'italic', color: theme.accent }}>Gmail</em>
            </div>
            <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ display: 'block', marginTop: 4 }}>
              ONE SIGN-IN · MULTIPLE INBOXES
            </Mono>
          </div>
        </button>
      </div>

      {/* Hint */}
      <Section theme={theme} kicker="BROWSE MODES" padding="20px 24px" noBorder>
        <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13.5,
          color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
          Use the mailbox chip in the top-right to switch between <span style={{ color: theme.text, fontStyle: 'normal' }}>All Mail</span> and an individual inbox.
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Settings & privacy — "The office."
// ═══════════════════════════════════════════════════════════════════════
function ScreenSettings({ theme, tweak, setTweak, onAccountSwitcher, activeAccount, subs }) {
  const [exportCount, setExportCount] = _as(0);
  _ae(() => {
    if (!exportCount) return;
    const t = setTimeout(() => setExportCount(0), 2400);
    return () => clearTimeout(t);
  }, [exportCount]);
  const onExportCSV = () => {
    const scoped = (subs || []).filter(s => activeAccount === 'all' || s.account === activeAccount);
    const count = exportSubsToCSV(scoped, tweak.currency);
    setExportCount(count);
  };
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      overflowY: 'auto', paddingBottom: 110, position: 'relative' }}>

      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onAccountSwitcher} />

      <ScreenHead theme={theme}
        kicker="ACCOUNT · PRIVACY · DATA"
        rightKicker="V0.5"
        masthead="The"
        italic="office"
        meta="MASTHEAD · COLOPHON · SETTINGS" />

      <SettingsGroup title="PROFILE" theme={theme}>
        <MobileSettingsRow theme={theme} first icon={
          <div style={{ width: 32, height: 32, background: theme.accent,
            color: theme.accentInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Fraunces", serif', fontWeight: 800, fontSize: 15 }}>Y</div>
        } title="Yasir Bucha" sub="yasir.bucha@gmail.com" chev />
      </SettingsGroup>

      <SettingsGroup title="DISPLAY" theme={theme}>
        <MobileSettingsRow theme={theme} first title="Theme" sub={tweak.theme === 'dark' ? 'Dark · Newsprint cream on ink' : 'Light · Ink on newsprint'} chev />
        <MobileSettingsRow theme={theme} title="Currency" sub={tweak.currency === 'PKR' ? 'PKR (Rs) primary' : 'USD ($) primary'} chev />
        <MobileSettingsRow theme={theme} title="AI tone" sub={(tweak.aiTone[0].toUpperCase() + tweak.aiTone.slice(1)) + ' · ' + toneSub(tweak.aiTone)} chev />
      </SettingsGroup>

      <SettingsGroup title="PRIVACY" theme={theme}>
        <MobileSettingsRow theme={theme} first title="Read-only Gmail access" sub="Receipts & subscription mail" toggle on />
        <MobileSettingsRow theme={theme} title="On-device extraction" sub="Email contents never leave your device" toggle on />
        <MobileSettingsRow theme={theme} title="Verified data only" sub="No estimates. No guesses." toggle on />
        <MobileSettingsRow theme={theme} title="Notify on price increases" sub="Email + push when a renewal changes" toggle on />
      </SettingsGroup>

      <SettingsGroup title="DATA" theme={theme}>
        <MobileSettingsRow theme={theme} first title="Re-scan all mailboxes" sub="Last full scan: today, 2:14 PM" chev />
        <MobileSettingsRow theme={theme} title="Export to CSV" sub="All subscriptions + history" chev
          onClick={onExportCSV} />
        <MobileSettingsRow theme={theme} title="Delete account & data" danger chev />
      </SettingsGroup>

      <div style={{ padding: '36px 24px 24px', textAlign: 'center',
        borderTop: `1px solid ${theme.border}`, marginTop: 24 }}>
        <LumenLogo size={18} color={theme.textMuted} accent={theme.accent} />
        <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ display: 'block', marginTop: 10 }}>
          VERSION 0.5 · BUILD 2026.06
        </Mono>
        <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 12, color: theme.textSubtle, letterSpacing: '-0.005em' }}>
          The Subscription Ledger
        </div>
      </div>

      <ExportToast open={exportCount > 0} theme={theme} count={exportCount} />
    </div>
  );
}

function toneSub(t) {
  if (t === 'quiet') return 'Evidence-based';
  if (t === 'confident') return 'Clear verdicts';
  return 'Friendly';
}

function SettingsGroup({ title, theme, children }) {
  return (
    <div style={{ padding: '20px 24px 0' }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{title}</Mono>
      <div style={{ marginTop: 8, borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}` }}>
        {children}
      </div>
    </div>
  );
}

function MobileSettingsRow({ theme, icon, title, sub, chev, toggle, on, danger, first, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
      borderTop: first ? 'none' : `1px solid ${theme.border}`,
      ...(toggle ? {} : { cursor: 'pointer' }) }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
          letterSpacing: '-0.015em',
          color: danger ? theme.semantic.cancel : theme.text }}>{title}</div>
        {sub && <div style={{ marginTop: 2, fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9.5, color: theme.textMuted, letterSpacing: '0.10em',
          textTransform: 'uppercase' }}>{sub}</div>}
      </div>
      {toggle && (
        <div style={{ width: 36, height: 20, background: on ? theme.accent : theme.borderHi,
          position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16,
            background: theme.bg, transition: 'left .2s' }} />
        </div>
      )}
      {chev && <svg width="7" height="11" viewBox="0 0 8 12"><path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Bottom sheets — editorial (no rounded chrome, hairline rules)
// ═══════════════════════════════════════════════════════════════════════
function Sheet({ open, title, theme, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: theme.bgSheet,
        borderTop: `1px solid ${theme.borderHi}`,
        padding: '14px 24px 36px',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
        maxHeight: '75%', overflowY: 'auto',
      }}>
        <div style={{ width: 30, height: 3, background: theme.borderHi, margin: '0 auto 14px' }} />
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          paddingBottom: 12, borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.025em', color: theme.text }}>
            {title}<span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>.</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
            color: theme.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Done</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AccountSwitcherSheet({ open, theme, activeAccount, setActiveAccount, onClose, onManage }) {
  return (
    <Sheet open={open} title="Mailbox" theme={theme} onClose={onClose}>
      <div>
        {LumenData.ACCOUNTS.map((a, i) => {
          const on = activeAccount === a.id;
          return (
            <div key={a.id} onClick={() => { setActiveAccount(a.id); onClose(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
              cursor: 'pointer',
            }}>
              <AccountAvatar acc={a} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                  letterSpacing: '-0.015em', color: theme.text }}>{a.label}</div>
                <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ marginTop: 2, display: 'block' }}>
                  {a.email || 'COMBINED VIEW'}
                </Mono>
              </div>
              {on && (
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600,
                  color: theme.accent, letterSpacing: '0.16em' }}>ACTIVE</span>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => { onManage(); onClose(); }} style={{
        marginTop: 18, width: '100%', height: 44,
        background: 'transparent', border: `1px solid ${theme.borderHi}`,
        color: theme.text, fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
      }}>
        Manage mailboxes
      </button>
    </Sheet>
  );
}

function CardTagSheet({ open, theme, sub, onClose, onApply }) {
  const [pick, setPick] = _as(sub?.card || 'visa');
  React.useEffect(() => { if (sub) setPick(sub.card); }, [sub?.id]);
  if (!sub) return null;
  return (
    <Sheet open={open} title="Payment" theme={theme} onClose={onClose}>
      <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13.5,
        color: theme.textMuted, marginBottom: 18, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
        Detected card on file: <span style={{ color: theme.text, fontStyle: 'normal' }}>{LumenData.CARD_KINDS[sub.card].label} ending {sub.last4}</span>. Switch if needed — verified data only.
      </div>
      <div>
        {Object.entries(LumenData.CARD_KINDS).map(([id, k], i) => {
          const on = pick === id;
          return (
            <div key={id} onClick={() => setPick(id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`, cursor: 'pointer',
            }}>
              <div style={{ width: 32, height: 20, borderRadius: 1,
                background: `linear-gradient(135deg, ${k.tint[0]}, ${k.tint[1]})` }} />
              <div style={{ flex: 1, fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                letterSpacing: '-0.015em', color: theme.text }}>{k.label}</div>
              <Mono color={theme.textSubtle} size={10} tracking="0.10em">•••• {sub.last4}</Mono>
              {on && <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600,
                color: theme.accent, letterSpacing: '0.16em', marginLeft: 8 }}>SELECTED</span>}
            </div>
          );
        })}
      </div>
      <button onClick={() => onApply(pick)} style={{
        marginTop: 18, width: '100%', height: 48, border: 'none',
        background: theme.accent, color: theme.accentInk,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
      }}>Save</button>
    </Sheet>
  );
}

function CategoryTagSheet({ open, theme, sub, onClose, onApply }) {
  const [pick, setPick] = _as(sub?.category || 'streaming');
  React.useEffect(() => { if (sub) setPick(sub.category); }, [sub?.id]);
  if (!sub) return null;
  return (
    <Sheet open={open} title="Category" theme={theme} onClose={onClose}>
      <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13.5,
        color: theme.textMuted, marginBottom: 18, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
        Categories help spot patterns — school fees vs. shopping vs. streaming.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {LumenData.CATEGORIES.map((c, i) => {
          const on = pick === c.id;
          return (
            <div key={c.id} onClick={() => setPick(c.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px',
              borderTop: i < 2 ? 'none' : `1px solid ${theme.border}`,
              borderLeft: i % 2 === 1 ? `1px solid ${theme.border}` : 'none',
              borderBottom: 'none',
              cursor: 'pointer',
              background: on ? theme.surface : 'transparent',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.swatch }} />
              <span style={{ flex: 1, fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14,
                letterSpacing: '-0.015em', color: theme.text }}>{c.label}</span>
              {on && <span style={{ width: 6, height: 6, background: theme.accent }} />}
            </div>
          );
        })}
      </div>
      <button onClick={() => onApply(pick)} style={{
        marginTop: 18, width: '100%', height: 48, border: 'none',
        background: theme.accent, color: theme.accentInk,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
      }}>Save</button>
    </Sheet>
  );
}

Object.assign(window, {
  ScreenRecs, ScreenPatterns, ScreenAccounts, ScreenSettings,
  Sheet, AccountSwitcherSheet, CardTagSheet, CategoryTagSheet,
});
