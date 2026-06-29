// Mobile screens — Sign-in & Scanning, in editorial D voice
const { useState: _us, useEffect: _ue, useMemo: _um, useRef: _ur } = React;

// ═══════════════════════════════════════════════════════════════════════
// 01 — Sign-in (editorial cover page)
// ═══════════════════════════════════════════════════════════════════════
function ScreenSignIn({ theme, onNext }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text,
      fontFamily: theme.fontUI, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden' }}>

      {/* Editorial header */}
      <div style={{ padding: '64px 24px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONDAY · 29 JUN 2026</Mono>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">VOL. I · NO. 01</Mono>
        </div>
        <div style={{ marginTop: 28 }}>
          <LumenLogo size={56} color={theme.text} accent={theme.accent} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">THE SUBSCRIPTION LEDGER</Mono>
        </div>
      </div>

      {/* Hero — masthead headline */}
      <div style={{ flex: 1, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
          fontSize: 42, lineHeight: 1.02, letterSpacing: '-0.035em', color: theme.text }}>
          See every<br/>subscription.<br/>
          <em style={{ fontStyle: 'italic', fontWeight: 400, color: theme.accent }}>Spend with intent.</em>
        </div>

        <div style={{ marginTop: 24,
          paddingTop: 18, borderTop: `1px solid ${theme.border}`,
          fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 15, lineHeight: 1.45, color: theme.textMuted, letterSpacing: '-0.005em' }}>
          Lumen reads your Gmail receipts and renewal notices to surface every active, past, and upcoming subscription — with verified amounts only.
        </div>

        <div style={{ marginTop: 18 }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.16em">— By Lumen, on your inbox</Mono>
        </div>
      </div>

      {/* Footer — sign-in actions */}
      <div style={{ padding: '20px 24px 40px',
        borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onNext} style={{
          height: 52, border: 'none', cursor: 'pointer',
          background: theme.accent, color: theme.accentInk,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <GoogleG size={18} />
          Continue with Gmail
        </button>
        <button style={{
          height: 44, border: `1px solid ${theme.borderHi}`, cursor: 'pointer',
          background: 'transparent', color: theme.text,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Sign in with passkey
        </button>
        <div style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.5, color: theme.textSubtle, textAlign: 'center',
          letterSpacing: '0.005em' }}>
          Lumen requests <span style={{ color: theme.textMuted }}>read-only</span> access to receipts.<br/>
          Message contents stay on your device.
        </div>
      </div>
    </div>
  );
}

function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.32z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
      <path fill="#FBBC04" d="M5.84 14.11A6.6 6.6 0 015.5 12c0-.73.13-1.45.34-2.11V7.05H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 02 — Scanning (editorial typesetting in progress)
// ═══════════════════════════════════════════════════════════════════════
function ScreenScanning({ theme, subs, onNext }) {
  const [pct, setPct] = _us(8);
  const [tickerIdx, setTickerIdx] = _us(0);
  const totalEmails = 14_823;

  _ue(() => {
    const t = setInterval(() => setPct(p => Math.min(100, p + 1.5)), 60);
    return () => clearInterval(t);
  }, []);
  _ue(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % subs.length), 700);
    return () => clearInterval(t);
  }, [subs.length]);

  const found = Math.min(subs.length, Math.floor((pct / 100) * subs.length) + 1);
  const scanned = Math.floor((pct / 100) * totalEmails);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Head — extra top padding to clear the iOS status bar */}
      <div style={{ paddingTop: 48 }}>
        <ScreenHead theme={theme}
          kicker="EDITION IN PROGRESS"
          rightKicker="LIVE"
          masthead="Filing the"
          italic="ledger"
          meta="READING · PERSONAL@GMAIL.COM" />
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28 }}>

        {/* Big serif % counter */}
        <div style={{ position: 'relative', width: 200, height: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="200" height="200" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke={theme.border} strokeWidth="1" />
            <circle cx="100" cy="100" r="92" fill="none" stroke={theme.accent} strokeWidth="1.5"
              strokeDasharray={`${(pct / 100) * 578} 578`} strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.3s ease' }} />
          </svg>
          <div style={{ textAlign: 'center' }}>
            <BigNumber size={68} color={theme.text} sub="%">{Math.round(pct)}</BigNumber>
            <div style={{ marginTop: 10 }}>
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">SCANNING</Mono>
            </div>
          </div>
        </div>

        {/* Counters as stat strip */}
        <div style={{ width: '100%', borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 16px', borderRight: `1px solid ${theme.border}` }}>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">EMAILS READ</Mono>
              <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 600,
                fontSize: 24, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>
                {scanned.toLocaleString()}
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">SUBS FOUND</Mono>
              <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 600,
                fontSize: 24, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.accent }}>
                {String(found).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Live ticker — editorial row style */}
        <div style={{ width: '100%' }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ display: 'block', marginBottom: 10 }}>LATEST VERIFICATION</Mono>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12,
            borderTop: `1px solid ${theme.border}` }}>
            <MerchantGlyph sub={subs[tickerIdx]} size={36} radius={2} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                color: theme.text, letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {subs[tickerIdx].merchant}
              </div>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.12em" style={{ marginTop: 2, display: 'block' }}>
                {subs[tickerIdx].cycle.toUpperCase()} · {LumenData.fmtMoney(subs[tickerIdx].amountPKR, 'PKR').toUpperCase()}
              </Mono>
            </div>
            <Mono color={theme.semantic.good} size={9} tracking="0.16em">VERIFIED</Mono>
          </div>
        </div>
      </div>

      {/* Footer button */}
      <div style={{ padding: '16px 24px 36px', borderTop: `1px solid ${theme.border}` }}>
        <button onClick={onNext} disabled={pct < 100} style={{
          width: '100%', height: 50, border: 'none',
          background: pct >= 100 ? theme.accent : 'transparent',
          color: pct >= 100 ? theme.accentInk : theme.textMuted,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          cursor: pct >= 100 ? 'pointer' : 'default',
          border: pct >= 100 ? 'none' : `1px solid ${theme.border}`,
        }}>
          {pct >= 100 ? `See your subscriptions →` : `Scanning ${scanned.toLocaleString()} emails…`}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSignIn, ScreenScanning });
