// Lumen — Editorial cards & flows added in session 6
// Price-increase alert, empty state, cancellation success flow.
// All in Direction D's hairline / Fraunces / oxblood grammar.

const { useState: _dcs, useEffect: _dce } = React;

// ═══════════════════════════════════════════════════════════════════════
// PriceIncreaseCard — editorial alert when a sub has bumped its price
// Shows a strip with "Rs 1,499 → Rs 1,800" using oxblood for the new price
// and a strikethrough arrow. Sits on the dashboard between the pull-quote
// and Up next.
// ═══════════════════════════════════════════════════════════════════════
function PriceIncreaseCard({ theme, tweak, subs, onOpenSub, onOpenAlerts }) {
  const increases = subs.filter(s => s.status === 'active' && s.priceIncrease);
  if (increases.length === 0) return null;

  const fmtPi = (sub, kind) => {
    const v = tweak.currency === 'USD'
      ? sub.priceIncrease[kind === 'from' ? 'fromUSD' : 'toUSD']
      : sub.priceIncrease[kind === 'from' ? 'fromPKR' : 'toPKR'];
    const sym = tweak.currency === 'USD' ? '$' : 'Rs ';
    return sym + Math.round(v).toLocaleString();
  };

  // Sum of monthly delta (PKR) — the new pain
  const monthlyDelta = increases.reduce((a, s) => {
    const mFrom = s.cycle === 'yearly' ? s.priceIncrease.fromPKR / 12 : s.priceIncrease.fromPKR;
    const mTo = s.cycle === 'yearly' ? s.priceIncrease.toPKR / 12 : s.priceIncrease.toPKR;
    return a + (mTo - mFrom);
  }, 0);
  const yearlyDeltaStr = tweak.currency === 'USD'
    ? '$' + Math.round((monthlyDelta * 12) / LumenData.FX).toLocaleString()
    : 'Rs ' + Math.round(monthlyDelta * 12).toLocaleString();

  return (
    <div style={{ borderBottom: `1px solid ${theme.border}`, position: 'relative' }}>
      {/* Editorial kicker bar */}
      <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ width: 6, height: 6, background: theme.accent, display: 'inline-block',
            transform: 'rotate(45deg)', position: 'relative', top: -1 }} />
          <Mono color={theme.accent} size={9.5} tracking="0.20em">PRICE WATCH</Mono>
          <Mono color={theme.textSubtle} size={9} tracking="0.16em">
            {String(increases.length).padStart(2, '0')} ALERTS · +{yearlyDeltaStr}/YR
          </Mono>
        </div>
        {onOpenAlerts && (
          <span onClick={onOpenAlerts} style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
            letterSpacing: '0.16em', color: theme.accent, cursor: 'pointer', textTransform: 'uppercase',
          }}>INBOX →</span>
        )}
      </div>

      {/* Headline */}
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22,
          letterSpacing: '-0.025em', lineHeight: 1.2, color: theme.text }}>
          {increases.length === 1
            ? <>One subscription <em style={{ color: theme.accent, fontWeight: 400 }}>raised its price.</em></>
            : <>{numberWord(increases.length)} subscriptions <em style={{ color: theme.accent, fontWeight: 400 }}>raised their prices.</em></>}
        </div>
      </div>

      {/* The strips */}
      <div style={{ padding: '12px 24px 18px' }}>
        {increases.map((s, i) => (
          <div key={s.id} onClick={() => onOpenSub(s)} style={{
            display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 10,
            alignItems: 'center', padding: '12px 0',
            borderTop: i === 0 ? `1px solid ${theme.border}` : `1px solid ${theme.border}`,
            cursor: 'pointer',
          }}>
            {/* Index */}
            <Mono color={theme.textSubtle} size={9} tracking="0.12em" style={{ paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </Mono>

            {/* Merchant + change strip */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
                letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{s.merchant}</div>
              {/* Price change strip — old → new (oxblood) */}
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'baseline', gap: 6,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, fontWeight: 500,
                letterSpacing: '0.06em', lineHeight: 1 }}>
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
              <div style={{ marginTop: 5, fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                color: theme.textSubtle, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                EFFECTIVE {fmtDateShort(s.priceIncrease.date).toUpperCase()} · {s.cycle.toUpperCase()}
              </div>
            </div>

            {/* Chevron */}
            <svg width="7" height="11" viewBox="0 0 8 12">
              <path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4"
                fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        ))}

        {/* Editorial note */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`,
          fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13.5,
          color: theme.textMuted, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
          Lumen detected these from renewal emails. Tap any row to review the verdict
          before the next charge.
        </div>
      </div>
    </div>
  );
}

function numberWord(n) {
  return ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n] || String(n);
}

// ═══════════════════════════════════════════════════════════════════════
// EmptyDashboard — when activeSubs.length === 0 (e.g. account with no subs)
// Editorial cover: "Nothing to report yet." · "—" · CTA
// ═══════════════════════════════════════════════════════════════════════
function EmptyDashboard({ theme, activeAccount, onConnect, onSwitch }) {
  const acc = LumenData.ACCOUNTS.find(a => a.id === activeAccount);
  const isSpecificAccount = activeAccount !== 'all';

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text,
      fontFamily: theme.fontUI, overflowY: 'auto', paddingBottom: 110, display: 'flex',
      flexDirection: 'column' }}>

      {/* Editorial top */}
      <div style={{ padding: '56px 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONDAY · 29 JUN 2026</Mono>
        <div onClick={onSwitch} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '4px 8px', border: `1px solid ${theme.border}`,
        }}>
          <AccountAvatar acc={acc} size={16} />
          <Mono color={theme.text} size={9.5} tracking="0.12em">{acc.label}</Mono>
          <svg width="8" height="5" viewBox="0 0 8 5">
            <path d="M1 1l3 3 3-3" stroke={theme.textMuted} strokeWidth="1.4"
              fill="none" strokeLinecap="round"/></svg>
        </div>
      </div>

      {/* Masthead */}
      <div style={{ padding: '4px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <Masthead theme={theme} size={36}>Lumen</Masthead>
        <div style={{ marginTop: 6 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            DAILY · MORNING EDITION · {acc.label.toUpperCase()} · 00 ACTIVE
          </Mono>
        </div>
      </div>

      {/* Empty centerpiece */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px',
        minHeight: 440 }}>

        {/* Big oxblood em-dash, like a newspaper "nothing here today" */}
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 200,
          fontSize: 96, lineHeight: 0.8, color: theme.accent,
          letterSpacing: '-0.04em' }}>—</div>

        {/* Editorial headline */}
        <div style={{ marginTop: 24, fontFamily: '"Fraunces", serif', fontWeight: 700,
          fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.03em', color: theme.text,
          maxWidth: 280 }}>
          Nothing to <em style={{ color: theme.accent, fontWeight: 400 }}>report</em> yet.
        </div>

        {/* Body */}
        <div style={{ marginTop: 18, fontFamily: '"Fraunces", serif',
          fontSize: 15, lineHeight: 1.45, color: theme.textMuted, maxWidth: 300,
          letterSpacing: '-0.005em' }}>
          {isSpecificAccount
            ? <>No subscriptions found in <em>{acc.email || acc.label}</em>. Either this mailbox is genuinely clean,
              or it needs a fresh scan.</>
            : <>No subscriptions are filed against your name today. Connect a Gmail to begin the ledger,
              or wait — Lumen will pick up the next renewal.</>}
        </div>

        {/* Stat strip — empty but still typeset */}
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, width: '100%', maxWidth: 320 }}>
          {[
            { k: 'MONTHLY', v: '—' },
            { k: 'YEARLY', v: '—' },
            { k: 'ACTIVE', v: '00' },
          ].map((c, i) => (
            <div key={i} style={{ borderLeft: i > 0 ? `1px solid ${theme.border}` : 'none',
              paddingLeft: i > 0 ? 14 : 0 }}>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">{c.k}</Mono>
              <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontWeight: 600,
                fontSize: 22, letterSpacing: '-0.025em', color: theme.textMuted,
                fontVariantNumeric: 'tabular-nums' }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onConnect} style={{
          marginTop: 36, height: 48, padding: '0 20px',
          background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.20em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          {isSpecificAccount ? 'Re-scan this mailbox' : 'Connect a Gmail'}
          <svg width="11" height="11" viewBox="0 0 12 12">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="#fff" strokeWidth="1.5"
              fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Editorial colophon */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${theme.border}`,
          width: '100%', maxWidth: 340 }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">
            — A QUIET DAY AT THE LEDGER —
          </Mono>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CancellationFlow — 3-step sheet that slides up
// step 1: instruction sheet ("we'll open Netflix' cancel link in a new tab")
// step 2: "Did you cancel it?" — Yes / Not yet
// step 3: "Filed as cancelled" — confirmation with editorial pull-quote
// ═══════════════════════════════════════════════════════════════════════
function CancellationFlow({ theme, tweak, sub, open, onClose, onConfirmCancelled, surface = 'mobile' }) {
  const [step, setStep] = _dcs(1);

  _dce(() => { if (open) setStep(1); }, [open, sub && sub.id]);

  if (!open || !sub) return null;

  const monthlyPKR = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
  const yearlyPKR = sub.cycle === 'yearly' ? sub.amountPKR : sub.amountPKR * 12;
  const fmtV = (pkr) => tweak.currency === 'USD'
    ? '$' + Math.round(pkr / LumenData.FX).toLocaleString()
    : 'Rs ' + Math.round(pkr).toLocaleString();

  // Per-merchant cancel URL (mock)
  const cancelUrl = `https://${sub.merchant.toLowerCase().replace(/[^a-z]/g, '')}.com/account/cancel`;

  const handleOpenLink = () => {
    // Don't actually open in prototype — just advance
    setStep(2);
  };

  // ── STEP 1: instructions ──────────────────────────────────────────
  const step1 = (
    <>
      <FlowKicker theme={theme} step={1} total={3} label="CANCELLATION · STEP 01" />
      <div style={{ padding: '14px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.1, color: theme.text }}>
          Cancel <em style={{ color: theme.accent, fontWeight: 400 }}>{sub.merchant}</em>.
        </div>
        <div style={{ marginTop: 10 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            HERE IS WHAT WILL HAPPEN
          </Mono>
        </div>
      </div>

      {/* Numbered editorial steps */}
      <div style={{ padding: '14px 24px 0' }}>
        {[
          ['01', `Lumen will open ${sub.merchant}'s cancel page in a new tab.`],
          ['02', `Follow their flow to confirm the cancellation.`],
          ['03', `Come back here and tell us how it went.`],
        ].map(([n, line], i) => (
          <div key={n} style={{ display: 'flex', gap: 14, padding: '12px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
            <Mono color={theme.accent} size={10} tracking="0.14em" style={{ paddingTop: 3, minWidth: 22 }}>{n}</Mono>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15,
              color: theme.text, lineHeight: 1.4, letterSpacing: '-0.005em' }}>{line}</span>
          </div>
        ))}
      </div>

      {/* Cancel link box */}
      <div style={{ margin: '18px 24px 0', padding: '14px 14px',
        border: `1px solid ${theme.border}`, background: theme.surface }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.16em">CANCEL LINK</Mono>
        <div style={{ marginTop: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          color: theme.text, wordBreak: 'break-all', letterSpacing: '0.02em' }}>
          {cancelUrl}
        </div>
      </div>

      {/* Reclaim editorial — what they're getting back */}
      <div style={{ padding: '18px 24px 0' }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">YOU RECLAIM</Mono>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 26,
              letterSpacing: '-0.03em', color: theme.accent,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{fmtV(monthlyPKR)}</div>
            <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9, color: theme.textSubtle, letterSpacing: '0.14em',
              textTransform: 'uppercase' }}>PER MONTH</div>
          </div>
          <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: 16 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 26,
              letterSpacing: '-0.03em', color: theme.accent,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{fmtV(yearlyPKR)}</div>
            <div style={{ marginTop: 4, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9, color: theme.textSubtle, letterSpacing: '0.14em',
              textTransform: 'uppercase' }}>PER YEAR</div>
          </div>
        </div>
      </div>

      <FlowActions theme={theme}
        primary={{ label: 'Open cancel link', onClick: handleOpenLink, arrow: 'external' }}
        secondary={{ label: 'Not now', onClick: onClose }}
      />
    </>
  );

  // ── STEP 2: did you cancel? ──────────────────────────────────────
  const step2 = (
    <>
      <FlowKicker theme={theme} step={2} total={3} label="CANCELLATION · STEP 02" />
      <div style={{ padding: '14px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.1, color: theme.text }}>
          Did you <em style={{ color: theme.accent, fontWeight: 400 }}>cancel</em> it?
        </div>
        <div style={{ marginTop: 10 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            LUMEN WILL UPDATE THE LEDGER ACCORDINGLY
          </Mono>
        </div>
      </div>

      {/* Editorial pull-quote */}
      <div style={{ padding: '22px 24px',
        fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: 17, lineHeight: 1.45, letterSpacing: '-0.01em', color: theme.text,
        borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 42, lineHeight: 0.4, color: theme.accent,
          marginBottom: 12, fontStyle: 'normal', fontWeight: 700 }}>"</div>
        We trust your word. If the renewal email returns next cycle,
        Lumen will quietly flip it back to active.
        <div style={{ marginTop: 12, fontFamily: '"JetBrains Mono", monospace',
          fontStyle: 'normal', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
          color: theme.textMuted, textTransform: 'uppercase' }}>
          — BY LUMEN
        </div>
      </div>

      {/* Two big choice rows */}
      <div style={{ padding: '4px 24px 0' }}>
        <ChoiceRow theme={theme} accent
          title="Yes, cancelled"
          sub={`Mark ${sub.merchant} as past`}
          onClick={() => { onConfirmCancelled(sub); setStep(3); }}
          icon="check" />
        <ChoiceRow theme={theme}
          title="Not yet"
          sub="Keep this as active, remind me"
          onClick={onClose}
          icon="clock" />
        <ChoiceRow theme={theme}
          title="They wouldn't let me"
          sub="Mark for manual help"
          onClick={() => { onConfirmCancelled(sub, 'blocked'); setStep(3); }}
          icon="warn" />
      </div>

      <FlowActions theme={theme}
        secondary={{ label: 'Go back', onClick: () => setStep(1) }}
      />
    </>
  );

  // ── STEP 3: confirmation ─────────────────────────────────────────
  const step3 = (
    <>
      <FlowKicker theme={theme} step={3} total={3} label="CANCELLATION · STEP 03" />
      <div style={{ padding: '14px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.1, color: theme.text }}>
          Filed as <em style={{ color: theme.accent, fontWeight: 400 }}>cancelled</em>.
        </div>
        <div style={{ marginTop: 10 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            {sub.merchant.toUpperCase()} · MOVED TO PAST
          </Mono>
        </div>
      </div>

      {/* Reclaim hero */}
      <StatHero theme={theme} label="MONTHLY RECLAIMED" accent
        value={fmtV(monthlyPKR).replace(/^(\$|Rs )/, '')}
        ccy={tweak.currency === 'USD' ? '$' : 'Rs'}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.14em">
          ≈ {fmtV(yearlyPKR)} / YEAR · {sub.cycle.toUpperCase()}
        </Mono>
      </StatHero>

      {/* Editorial proof rows */}
      <div style={{ padding: '14px 24px 0' }}>
        {[
          ['01', `Removed from active subscriptions.`],
          ['02', `Next charge cleared from the calendar.`],
          ['03', `Lumen will watch for unexpected renewals.`],
        ].map(([n, line], i) => (
          <div key={n} style={{ display: 'flex', gap: 14, padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
            <Mono color={theme.semantic.good} size={10} tracking="0.14em" style={{ paddingTop: 3, minWidth: 22 }}>{n}</Mono>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15,
              color: theme.text, lineHeight: 1.4, letterSpacing: '-0.005em' }}>{line}</span>
          </div>
        ))}
      </div>

      <FlowActions theme={theme}
        primary={{ label: 'Back to the ledger', onClick: onClose }}
      />
    </>
  );

  // ── Surface chrome ────────────────────────────────────────────────
  const body = step === 1 ? step1 : step === 2 ? step2 : step3;

  if (surface === 'desktop') {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{
          width: 560, maxHeight: '86%', overflowY: 'auto',
          background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
          border: `1px solid ${theme.borderHi}`,
        }}>
          {body}
        </div>
      </div>
    );
  }

  // Mobile — slide-up sheet
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 50, display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxHeight: '92%', overflowY: 'auto',
        background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
        borderTop: `1px solid ${theme.borderHi}`,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.3)',
        paddingBottom: 36,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 3, background: theme.border }} />
        </div>
        {body}
      </div>
    </div>
  );
}

// ── Flow helpers ────────────────────────────────────────────────────
function FlowKicker({ theme, step, total, label }) {
  return (
    <div style={{ padding: '12px 24px 8px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between' }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{label}</Mono>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{ width: 18, height: 2,
            background: i < step ? theme.accent : theme.border }} />
        ))}
      </div>
    </div>
  );
}

function FlowActions({ theme, primary, secondary }) {
  return (
    <div style={{ padding: '22px 24px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {primary && (
        <button onClick={primary.onClick} style={{
          height: 50, border: 'none',
          background: theme.accent, color: '#fff', cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {primary.label}
          {primary.arrow === 'external' && (
            <svg width="11" height="11" viewBox="0 0 12 12">
              <path d="M4 2h6v6M10 2L3 9" stroke="#fff" strokeWidth="1.5"
                fill="none" strokeLinecap="round"/></svg>
          )}
        </button>
      )}
      {secondary && (
        <button onClick={secondary.onClick} style={{
          height: 40, border: 'none', background: 'transparent',
          color: theme.textMuted, cursor: 'pointer',
          fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13.5,
          fontWeight: 500,
        }}>
          {secondary.label}
        </button>
      )}
    </div>
  );
}

function ChoiceRow({ theme, title, sub, onClick, icon, accent }) {
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '32px 1fr auto',
      gap: 12, alignItems: 'center', padding: '16px 0',
      borderTop: `1px solid ${theme.border}`, cursor: 'pointer',
    }}>
      {/* Icon square */}
      <div style={{ width: 28, height: 28,
        border: `1px solid ${accent ? theme.accent : theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ? theme.accent : theme.textMuted }}>
        <FlowIcon name={icon} />
      </div>
      <div>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
          letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.1 }}>{title}</div>
        <div style={{ marginTop: 3, fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9.5, color: theme.textSubtle, letterSpacing: '0.10em',
          textTransform: 'uppercase' }}>{sub}</div>
      </div>
      <svg width="7" height="11" viewBox="0 0 8 12">
        <path d="M1 1l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4"
          fill="none" strokeLinecap="round"/></svg>
    </div>
  );
}

function FlowIcon({ name }) {
  const p = { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'check') return <svg {...p}><path d="M2.5 7l3 3 6-6"/></svg>;
  if (name === 'clock') return <svg {...p}><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 1.5"/></svg>;
  if (name === 'warn')  return <svg {...p}><path d="M7 2l5.5 10h-11L7 2z"/><path d="M7 6.5v2.5M7 10.7v0.1"/></svg>;
  return null;
}

Object.assign(window, {
  PriceIncreaseCard,
  EmptyDashboard,
  CancellationFlow,
});
