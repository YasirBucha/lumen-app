// Lumen — Alerts Inbox (session 9)
// Dedicated screen showing all price-watch alerts grouped, with placeholders
// for other alert kinds (failed renewals, unrecognized charges).
// Editorial newspaper grammar — same DNA as the rest of the app.

const { useMemo: _aim, useState: _ais } = React;

// ───────────────────────────────────────────────────────────────────────
// Shared helpers
// ───────────────────────────────────────────────────────────────────────

// Pull every alert out of the subs array. Right now: priceIncrease only,
// but the shape is generic so we can add more kinds without rewriting.
function buildAlerts(subs) {
  const alerts = [];
  subs.forEach(s => {
    if (s.priceIncrease && s.status === 'active') {
      const delta = s.priceIncrease.toPKR - s.priceIncrease.fromPKR;
      const pct = (delta / s.priceIncrease.fromPKR) * 100;
      alerts.push({
        id: `pi-${s.id}`,
        kind: 'price-increase',
        sub: s,
        date: s.priceIncrease.date,
        deltaPKR: delta,
        pct,
      });
    }
  });
  // Sort newest first by alert date
  alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return alerts;
}

function alertYearlyDeltaPKR(a) {
  const mFrom = a.sub.cycle === 'yearly' ? a.sub.priceIncrease.fromPKR / 12 : a.sub.priceIncrease.fromPKR;
  const mTo   = a.sub.cycle === 'yearly' ? a.sub.priceIncrease.toPKR   / 12 : a.sub.priceIncrease.toPKR;
  return (mTo - mFrom) * 12;
}

function fmtAlertPrice(pkr, currency) {
  if (currency === 'USD') return '$' + Math.round(pkr / LumenData.FX).toLocaleString();
  return 'Rs ' + Math.round(pkr).toLocaleString();
}

// Placeholders for future alert kinds — shown greyed out so the surface
// doesn't feel one-trick. These are NOT real alerts.
const FUTURE_KINDS = [
  { kind: 'failed-renewal',     label: 'Failed renewals',      caption: 'Cards that declined a charge' },
  { kind: 'unrecognized',       label: 'Unrecognized charges', caption: 'Receipts we could not match' },
  { kind: 'free-trial-ending',  label: 'Free trials ending',   caption: 'Before they auto-convert' },
];

// ═══════════════════════════════════════════════════════════════════════
// MOBILE — ScreenAlerts
// ═══════════════════════════════════════════════════════════════════════
function ScreenAlerts({ theme, tweak, subs, activeAccount, onAccountSwitcher, onOpenSub, onBack }) {
  const scoped = subs.filter(s => (activeAccount === 'all' || s.account === activeAccount));
  const alerts = _aim(() => buildAlerts(scoped), [scoped]);

  const totalYearlyDelta = alerts.reduce((a, x) => a + alertYearlyDeltaPKR(x), 0);
  const priceWatch = alerts.filter(a => a.kind === 'price-increase');

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text,
      fontFamily: theme.fontUI, overflowY: 'auto', paddingBottom: 110 }}>

      {/* Top meta */}
      <div style={{ padding: '56px 24px 12px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between' }}>
        {onBack ? (
          <button onClick={onBack} style={{
            width: 28, height: 28, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14">
              <path d="M8.5 2L3.5 7l5 5" stroke={theme.text} strokeWidth="1.6"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONDAY · 29 JUN 2026</Mono>}
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">THE ALERTS INBOX</Mono>
      </div>

      {/* Masthead */}
      <div style={{ padding: '4px 24px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <Masthead theme={theme} italic="inbox" size={38}>The alerts</Masthead>
        <div style={{ marginTop: 6 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            {String(alerts.length).padStart(2, '0')} OPEN · WATCHED BY LUMEN
          </Mono>
        </div>
      </div>

      {/* Stat strip — totals */}
      <StatStrip theme={theme} cells={[
        { k: 'OPEN',         v: String(alerts.length).padStart(2, '0'),
          s: alerts.length === 1 ? 'alert pending' : 'alerts pending', accent: alerts.length > 0 },
        { k: 'PRICE WATCH',  v: String(priceWatch.length).padStart(2, '0'),
          s: priceWatch.length === 1 ? 'subscription' : 'subscriptions' },
        { k: 'IMPACT / YR',  v: totalYearlyDelta > 0
            ? '+' + fmtAlertPrice(totalYearlyDelta, tweak.currency)
            : '—',
          s: 'across all alerts', accent: totalYearlyDelta > 0 },
      ]} />

      {/* Editorial pull quote — Lumen's voice */}
      {alerts.length > 0 && (
        <PullQuote theme={theme} by="By Lumen">
          {priceWatch.length > 0
            ? `${priceWatch.length === 1 ? 'One subscription has' : 'A few subscriptions have'} raised ${priceWatch.length === 1 ? 'its' : 'their'} price. We are flagging them before the next charge clears.`
            : `Lumen has nothing urgent for you today.`}
        </PullQuote>
      )}

      {/* Empty inbox — editorial cover */}
      {alerts.length === 0 && (
        <div style={{ padding: '60px 24px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 200,
            fontSize: 84, lineHeight: 0.8, color: theme.accent, letterSpacing: '-0.04em' }}>—</div>
          <div style={{ marginTop: 18, fontFamily: '"Fraunces", serif', fontWeight: 700,
            fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.03em', color: theme.text,
            maxWidth: 280 }}>
            A <em style={{ color: theme.accent, fontWeight: 400 }}>quiet</em> inbox today.
          </div>
          <div style={{ marginTop: 14, fontFamily: '"Fraunces", serif', fontSize: 14.5,
            color: theme.textMuted, lineHeight: 1.45, maxWidth: 300, letterSpacing: '-0.005em' }}>
            Lumen will surface price increases, failed renewals, and unrecognized
            charges here the moment they arrive.
          </div>
        </div>
      )}

      {/* Price-watch group */}
      {priceWatch.length > 0 && (
        <>
          <GroupHead theme={theme} num="01" title="Price increases" sub="REVIEW BEFORE NEXT CHARGE" />
          <div style={{ padding: '0 24px' }}>
            {priceWatch.map((a, i) => (
              <AlertRow key={a.id} theme={theme} tweak={tweak} alert={a}
                index={i + 1} onClick={() => onOpenSub(a.sub)} />
            ))}
          </div>
        </>
      )}

      {/* Future alert kinds — placeholders */}
      <GroupHead theme={theme} num={priceWatch.length > 0 ? "02" : "01"} title="Coming soon" sub="WATCHING IN THE BACKGROUND" />
      <div style={{ padding: '0 24px' }}>
        {FUTURE_KINDS.map((k, i) => (
          <div key={k.kind} style={{
            display: 'grid', gridTemplateColumns: '20px 1fr auto',
            gap: 12, alignItems: 'center', padding: '14px 0',
            borderTop: `1px solid ${theme.border}`, opacity: 0.55,
          }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.12em" style={{ paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </Mono>
            <div>
              <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
                letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{k.label}</div>
              <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9.5, color: theme.textSubtle, letterSpacing: '0.10em',
                textTransform: 'uppercase' }}>{k.caption}</div>
            </div>
            <div style={{ padding: '3px 7px', border: `1px solid ${theme.border}`,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 8.5, fontWeight: 600,
              letterSpacing: '0.16em', color: theme.textSubtle, textTransform: 'uppercase' }}>
              SOON
            </div>
          </div>
        ))}
      </div>

      {/* Editorial colophon */}
      <div style={{ margin: '28px 24px 0', paddingTop: 16,
        borderTop: `1px solid ${theme.border}` }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.18em">
          — LUMEN ALERTS · WATCHED CONTINUOUSLY —
        </Mono>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// AlertRow — mobile row for a single alert
// ───────────────────────────────────────────────────────────────────────
function AlertRow({ theme, tweak, alert, index, onClick }) {
  const s = alert.sub;
  const fmtPi = (kind) => {
    const v = tweak.currency === 'USD'
      ? s.priceIncrease[kind === 'from' ? 'fromUSD' : 'toUSD']
      : s.priceIncrease[kind === 'from' ? 'fromPKR' : 'toPKR'];
    const sym = tweak.currency === 'USD' ? '$' : 'Rs ';
    return sym + Math.round(v).toLocaleString();
  };
  const yearlyDelta = alertYearlyDeltaPKR(alert);

  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '22px 32px 1fr auto', gap: 12,
      alignItems: 'flex-start', padding: '16px 0',
      borderTop: `1px solid ${theme.border}`, cursor: 'pointer',
    }}>
      <Mono color={theme.textSubtle} size={9} tracking="0.12em" style={{ paddingTop: 4 }}>
        {String(index).padStart(2, '0')}
      </Mono>
      <MerchantGlyph sub={s} size={32} radius={2} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17,
            letterSpacing: '-0.02em', color: theme.text, lineHeight: 1.1 }}>{s.merchant}</span>
          <span style={{ padding: '2px 6px', border: `1px solid ${theme.accent}`,
            color: theme.accent, fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8.5, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase' }}>
            +{Math.round(alert.pct)}%
          </span>
        </div>

        {/* Price strip */}
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'baseline', gap: 6,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, fontWeight: 500,
          letterSpacing: '0.06em', lineHeight: 1 }}>
          <span style={{ color: theme.textMuted, textDecoration: 'line-through',
            textDecorationColor: theme.textSubtle, textDecorationThickness: '1px' }}>
            {fmtPi('from')}
          </span>
          <span style={{ color: theme.textSubtle }}>→</span>
          <span style={{ color: theme.accent, fontWeight: 600 }}>{fmtPi('to')}</span>
        </div>

        {/* Meta line */}
        <div style={{ marginTop: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
          color: theme.textSubtle, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          EFFECTIVE {fmtDateShort(s.priceIncrease.date).toUpperCase()} · {s.cycle.toUpperCase()}
          {yearlyDelta > 0 && (
            <span> · +{fmtAlertPrice(yearlyDelta, tweak.currency)}/YR</span>
          )}
        </div>

        {/* Editorial caption */}
        <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 13, color: theme.textMuted, lineHeight: 1.4, letterSpacing: '-0.005em' }}>
          {alertReason(alert)}
        </div>
      </div>

      <svg width="7" height="11" viewBox="0 0 8 12" style={{ marginTop: 6 }}>
        <path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4"
          fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function alertReason(a) {
  if (a.pct >= 25) return `A sharp jump — review usage before it renews.`;
  if (a.pct >= 15) return `A meaningful increase. Worth a second look.`;
  return `A small bump, but it compounds.`;
}

// ═══════════════════════════════════════════════════════════════════════
// DESKTOP — DeskAlerts
// ═══════════════════════════════════════════════════════════════════════
function DeskAlerts({ theme, tweak, subs, onOpenSub }) {
  const alerts = _aim(() => buildAlerts(subs), [subs]);
  const priceWatch = alerts.filter(a => a.kind === 'price-increase');
  const totalYearlyDelta = alerts.reduce((a, x) => a + alertYearlyDeltaPKR(x), 0);

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
            ALERTS · WATCHED CONTINUOUSLY
          </Mono>
          <div style={{ marginTop: 8 }}>
            <Masthead theme={theme} italic="alerts" size={40}>The</Masthead>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DeskPill theme={theme}>
            <span style={{ width: 5, height: 5, borderRadius: '50%',
              background: alerts.length > 0 ? theme.accent : theme.semantic.good }} />
            {alerts.length > 0 ? `${String(alerts.length).padStart(2, '0')} OPEN` : 'INBOX CLEAR'}
          </DeskPill>
          <DeskPill theme={theme}>CURRENCY · {tweak.currency}</DeskPill>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 0,
        marginBottom: 18, borderTop: `1px solid ${theme.border}` }}>
        <KPICard theme={theme} kicker="OPEN ALERTS"
          big={String(alerts.length).padStart(2, '0')}
          sub={`${priceWatch.length} PRICE WATCH · 0 OTHER`}
          accentText={alerts.length > 0 ? theme.accent : undefined} />
        <KPICard theme={theme} kicker="ANNUAL IMPACT"
          big={totalYearlyDelta > 0 ? '+' + fmtAlertPrice(totalYearlyDelta, tweak.currency) : '—'}
          sub="UNCHALLENGED COST INCREASES" />
        <KPICard theme={theme} kicker="ALERT KINDS"
          big={'01 / ' + String(1 + FUTURE_KINDS.length).padStart(2, '0')}
          sub="LIVE / IN DEVELOPMENT" />
      </div>

      {/* Two-col content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        <DeskCard theme={theme} kicker="PRICE WATCH"
          title={priceWatch.length === 0 ? "No price increases" : "Subscriptions that raised their price"}>
          {priceWatch.length === 0 ? (
            <div style={{ padding: '24px 0',
              fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 15,
              color: theme.textMuted, lineHeight: 1.5 }}>
              Lumen has not detected any renewal price changes in this mailbox scope.
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <DeskAlertHeader theme={theme} />
              {priceWatch.map((a, i) => (
                <DeskAlertRow key={a.id} theme={theme} tweak={tweak} alert={a}
                  index={i + 1} onClick={() => onOpenSub(a.sub)} />
              ))}
            </div>
          )}
        </DeskCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DeskCard theme={theme} kicker="LUMEN'S VOICE" title="By Lumen">
            <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
              fontSize: 16, lineHeight: 1.45, color: theme.text, letterSpacing: '-0.01em' }}>
              <span style={{ fontSize: 36, lineHeight: 0.3, color: theme.accent,
                marginRight: 2, fontStyle: 'normal', fontWeight: 700,
                position: 'relative', top: 6 }}>"</span>
              {priceWatch.length === 0
                ? `Nothing urgent today. Lumen will keep watching every renewal email.`
                : `${priceWatch.length === 1 ? 'One subscription has' : `${priceWatch.length} subscriptions have`} raised ${priceWatch.length === 1 ? 'its' : 'their'} price. We are flagging ${priceWatch.length === 1 ? 'it' : 'them'} before the next charge clears.`}
              <div style={{ marginTop: 14, fontFamily: '"JetBrains Mono", monospace',
                fontStyle: 'normal', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
                color: theme.textMuted, textTransform: 'uppercase' }}>
                — BY LUMEN
              </div>
            </div>
          </DeskCard>

          <DeskCard theme={theme} kicker="COMING SOON" title="More alert kinds">
            <div style={{ marginTop: 8 }}>
              {FUTURE_KINDS.map((k, i) => (
                <div key={k.kind} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 10,
                  padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                  opacity: 0.6,
                }}>
                  <div>
                    <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14,
                      letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{k.label}</div>
                    <div style={{ marginTop: 3, fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9, color: theme.textSubtle, letterSpacing: '0.10em',
                      textTransform: 'uppercase' }}>{k.caption}</div>
                  </div>
                  <div style={{ padding: '2px 6px', border: `1px solid ${theme.border}`,
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 8.5, fontWeight: 600,
                    letterSpacing: '0.16em', color: theme.textSubtle, textTransform: 'uppercase',
                    alignSelf: 'flex-start' }}>SOON</div>
                </div>
              ))}
            </div>
          </DeskCard>
        </div>
      </div>
    </div>
  );
}

function DeskAlertHeader({ theme }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1.8fr 1.2fr 1fr 1fr 0.6fr',
      gap: 12, padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
      {['', 'MERCHANT', 'PRICE CHANGE', 'EFFECTIVE', 'YEARLY IMPACT', ''].map((h, i) => (
        <Mono key={i} color={theme.textSubtle} size={9} tracking="0.18em">{h}</Mono>
      ))}
    </div>
  );
}

function DeskAlertRow({ theme, tweak, alert, index, onClick }) {
  const s = alert.sub;
  const fmtPi = (kind) => {
    const v = tweak.currency === 'USD'
      ? s.priceIncrease[kind === 'from' ? 'fromUSD' : 'toUSD']
      : s.priceIncrease[kind === 'from' ? 'fromPKR' : 'toPKR'];
    const sym = tweak.currency === 'USD' ? '$' : 'Rs ';
    return sym + Math.round(v).toLocaleString();
  };
  const yearlyDelta = alertYearlyDeltaPKR(alert);

  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '32px 1.8fr 1.2fr 1fr 1fr 0.6fr',
      gap: 12, padding: '14px 0', alignItems: 'center',
      borderTop: `1px solid ${theme.border}`, cursor: 'pointer',
    }}>
      <Mono color={theme.textSubtle} size={9} tracking="0.12em">
        {String(index).padStart(2, '0')}
      </Mono>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <MerchantGlyph sub={s} size={28} radius={2} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14.5, fontWeight: 600,
            color: theme.text, letterSpacing: '-0.015em', lineHeight: 1.1 }}>{s.merchant}</div>
          <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{
            display: 'block', marginTop: 3 }}>{s.cycle.toUpperCase()} · {LumenData.CARD_KINDS[s.card].label}·{s.last4}</Mono>
        </div>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.04em' }}>
        <span style={{ color: theme.textMuted, textDecoration: 'line-through',
          textDecorationColor: theme.textSubtle, textDecorationThickness: '1px' }}>
          {fmtPi('from')}
        </span>
        <span style={{ color: theme.textSubtle }}>→</span>
        <span style={{ color: theme.accent, fontWeight: 600 }}>{fmtPi('to')}</span>
        <span style={{ color: theme.accent, paddingLeft: 4, fontWeight: 600 }}>
          +{Math.round(alert.pct)}%
        </span>
      </div>
      <Mono color={theme.textMuted} size={10} tracking="0.10em">
        {fmtDateShort(s.priceIncrease.date)}
      </Mono>
      <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600,
        color: theme.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
        +{fmtAlertPrice(yearlyDelta, tweak.currency)}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <svg width="7" height="11" viewBox="0 0 8 12">
          <path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4"
            fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CancelledStamp — small editorial overlay used on cancelled sub headers
// ═══════════════════════════════════════════════════════════════════════
function CancelledStamp({ theme, size = 'md' }) {
  const px = size === 'lg' ? 13 : size === 'sm' ? 9 : 11;
  const pad = size === 'lg' ? '8px 14px' : size === 'sm' ? '3px 7px' : '5px 10px';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: pad, border: `1.5px solid ${theme.accent}`,
      color: theme.accent, fontFamily: '"JetBrains Mono", monospace',
      fontSize: px, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
      transform: 'rotate(-2deg)', position: 'relative',
    }}>
      <span style={{ width: 5, height: 5, background: theme.accent,
        transform: 'rotate(45deg)', display: 'inline-block' }} />
      Cancelled
    </div>
  );
}

Object.assign(window, {
  ScreenAlerts,
  DeskAlerts,
  CancelledStamp,
  buildAlerts,
  alertYearlyDeltaPKR,
});
