// Lumen prototype shell — device toggle, screen nav, tweaks
const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "currency": "PKR",
  "aiTone": "quiet",
  "density": "airy",
  "scenario": "heavy",
  "accent": "oxblood",
  "typePair": "inter"
}/*EDITMODE-END*/;

function App() {
  // Defensive: useTweaks returns [values, setTweak] (array), but tolerate
  // stale Babel compiles that may produce object destructuring.
  const _tw = useTweaks(TWEAK_DEFAULTS);
  const tweak = (_tw && _tw[0]) || (_tw && _tw.tweaks) || TWEAK_DEFAULTS;
  const setTweak = (_tw && _tw[1]) || (_tw && _tw.setTweak) || (() => {});
  const theme = useLumenTheme(tweak);

  // Device mode
  const [device, setDevice] = useState(() => localStorage.getItem('lumen.device') || 'mobile');
  useEffect(() => { localStorage.setItem('lumen.device', device); }, [device]);

  // Mobile screen state
  const [screen, setScreen] = useState(() => localStorage.getItem('lumen.screen') || 'signin');
  useEffect(() => { localStorage.setItem('lumen.screen', screen); }, [screen]);

  // Active Gmail
  const [activeAccount, setActiveAccount] = useState(() => localStorage.getItem('lumen.account') || 'all');
  useEffect(() => { localStorage.setItem('lumen.account', activeAccount); }, [activeAccount]);

  // Sub detail
  const [openSubId, setOpenSubId] = useState(null);
  // DEBUG BRIDGE — lets screenshot scripts drive openSub without UI clicks.
  // Safe to leave in; only window.__lumen.openSub('id') is exposed.
  useEffect(() => { window.__lumen = { ...(window.__lumen || {}), openSub: (id) => setOpenSubId(id), closeSub: () => setOpenSubId(null), setScreen, setDevice }; }, []);
  // Sheets
  const [acctSheet, setAcctSheet] = useState(false);
  const [cardSheetSub, setCardSheetSub] = useState(null);
  const [catSheetSub, setCatSheetSub] = useState(null);

  // Connect-another-Gmail flow (mobile + desktop share this state)
  const [connectOpen, setConnectOpen] = useState(false);

  // Cancellation flow
  const [cancelSub, setCancelSub] = useState(null);

  // Command palette (⌘K) — global cross-mailbox search overlay
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Locally-marked cancelled sub IDs (overrides data) — persisted
  const [cancelledIds, setCancelledIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lumen.cancelled') || '[]'); }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem('lumen.cancelled', JSON.stringify(cancelledIds)); }, [cancelledIds]);

  // Global keyboard shortcut: ⌘K / Ctrl+K opens the palette
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Opening a sub from the palette should also switch to the right surface
  const handlePaletteOpenSub = (sub) => {
    setOpenSubId(sub.id);
    // On mobile, surface the detail; on desktop, the slide-in panel takes over.
    // For desktop, we route through ScreenDesktop's panel using a postMessage-free trick:
    // we already keep panelSubId inside ScreenDesktop. Instead, surface a fallback via a custom event.
    if (device === 'desktop') {
      window.dispatchEvent(new CustomEvent('lumen:openSubPanel', { detail: { id: sub.id } }));
    }
  };

  // Data — apply user-confirmed cancellations on top
  const rawSubs = useMemo(() => tweak.scenario === 'light' ? LumenData.SUBS_LIGHT : LumenData.SUBS_HEAVY, [tweak.scenario]);
  const subs = useMemo(() => rawSubs.map(s =>
    cancelledIds.includes(s.id) ? { ...s, status: 'past', verdict: 'cancel' } : s
  ), [rawSubs, cancelledIds]);
  const openSub = subs.find(s => s.id === openSubId);

  const handleConfirmCancelled = (sub) => {
    if (!sub) return;
    setCancelledIds(prev => prev.includes(sub.id) ? prev : [...prev, sub.id]);
  };

  const SCREENS = ['signin', 'scanning', 'dashboard', 'list', 'alerts', 'calendar', 'recs', 'patterns', 'accounts', 'settings'];

  // Mobile renderer
  const renderMobile = () => {
    const common = { theme, tweak, subs, activeAccount, onAccountSwitcher: () => setAcctSheet(true) };
    let body;
    switch (screen) {
      case 'signin':    body = <ScreenSignIn theme={theme} onNext={() => setScreen('scanning')} />; break;
      case 'scanning':  body = <ScreenScanning theme={theme} subs={subs} onNext={() => setScreen('dashboard')} />; break;
      case 'dashboard': body = <ScreenDashboard {...common} onOpenSub={s => setOpenSubId(s.id)} onNav={setScreen} onConnect={() => setConnectOpen(true)} onOpenSearch={() => setPaletteOpen(true)} />; break;
      case 'list':      body = <ScreenList {...common} onOpenSub={s => setOpenSubId(s.id)} onOpenSearch={() => setPaletteOpen(true)} />; break;
      case 'alerts':    body = <ScreenAlerts {...common} onOpenSub={s => setOpenSubId(s.id)} onBack={() => setScreen('dashboard')} />; break;
      case 'calendar':  body = <ScreenCalendar {...common} onOpenSub={s => setOpenSubId(s.id)} onBack={() => setScreen('dashboard')} />; break;
      case 'recs':      body = <ScreenRecs {...common} onOpenSub={s => setOpenSubId(s.id)} />; break;
      case 'patterns':  body = <ScreenPatterns {...common} />; break;
      case 'accounts':  body = <ScreenAccounts {...common} onConnect={() => setConnectOpen(true)} />; break;
      case 'settings':  body = <ScreenSettings {...common} setTweak={setTweak} />; break;
      default:          body = <ScreenDashboard {...common} onOpenSub={s => setOpenSubId(s.id)} onNav={setScreen} />;
    }
    const tabbed = !['signin', 'scanning'].includes(screen);
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {body}
        {tabbed && <BottomTabs theme={theme} screen={screen} setScreen={setScreen} />}
        {openSub && (
          <ScreenSubDetail theme={theme} tweak={tweak} sub={openSub}
            onClose={() => setOpenSubId(null)}
            onTagCard={(s) => setCardSheetSub(s)}
            onTagCategory={(s) => setCatSheetSub(s)}
            onCancel={(s) => setCancelSub(s)} />
        )}
        <AccountSwitcherSheet open={acctSheet} theme={theme} activeAccount={activeAccount}
          setActiveAccount={setActiveAccount} onClose={() => setAcctSheet(false)}
          onManage={() => setScreen('accounts')} />
        <CardTagSheet open={!!cardSheetSub} theme={theme} sub={cardSheetSub}
          onClose={() => setCardSheetSub(null)} onApply={() => setCardSheetSub(null)} />
        <CategoryTagSheet open={!!catSheetSub} theme={theme} sub={catSheetSub}
          onClose={() => setCatSheetSub(null)} onApply={() => setCatSheetSub(null)} />
        <ConnectGmailFlow open={connectOpen} theme={theme}
          surface="mobile" onClose={() => setConnectOpen(false)} />
        <CancellationFlow open={!!cancelSub} theme={theme} tweak={tweak} sub={cancelSub}
          surface="mobile" onClose={() => setCancelSub(null)}
          onConfirmCancelled={handleConfirmCancelled} />
        <CommandPalette open={paletteOpen} theme={theme} tweak={tweak}
          allSubs={subs} surface="mobile"
          onClose={() => setPaletteOpen(false)}
          onOpenSub={(s) => setOpenSubId(s.id)} />
        {screen === 'dashboard' && (
          <OnboardingTour theme={theme} surface="mobile" />
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: tweak.theme === 'dark' ? '#070C14' : '#E5DECC',
      fontFamily: theme.fontUI,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Subtle bg pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: `radial-gradient(circle at 30% 20%, ${theme.accent}0F, transparent 50%), radial-gradient(circle at 80% 80%, ${theme.accent}08, transparent 50%)` }} />

      {/* Top toolbar */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LumenLogo size={20} color={theme.text} accent={theme.accent} />
          <Mono color={theme.textSubtle} size={10} tracking="0.18em">PROTOTYPE · VOL. III</Mono>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ShellSegmented theme={theme} value={device} onChange={setDevice} options={[
            { id: 'mobile', label: 'MOBILE' },
            { id: 'desktop', label: 'DESKTOP' },
          ]} />
        </div>
      </div>

      {/* Device area */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: '64px 24px 24px', maxHeight: '100%' }}>
        {device === 'mobile' ? (
          <>
            <ScreenStepper theme={theme} screen={screen} setScreen={setScreen} screens={SCREENS} />
            <IOSDevice width={392} height={830} dark={tweak.theme === 'dark'}>
              {renderMobile()}
            </IOSDevice>
            <div style={{ width: 1 }} />
          </>
        ) : (
          <DesktopFrame theme={theme}>
            <ScreenDesktop theme={theme} tweak={tweak} setTweak={setTweak} subs={subs}
              activeAccount={activeAccount} setActiveAccount={setActiveAccount}
              onConnect={() => setConnectOpen(true)}
              onCancel={(s) => setCancelSub(s)}
              onOpenSearch={() => setPaletteOpen(true)} />
            <ConnectGmailFlow open={connectOpen} theme={theme}
              surface="desktop" onClose={() => setConnectOpen(false)} />
            <CancellationFlow open={!!cancelSub} theme={theme} tweak={tweak} sub={cancelSub}
              surface="desktop" onClose={() => setCancelSub(null)}
              onConfirmCancelled={handleConfirmCancelled} />
            <CommandPalette open={paletteOpen} theme={theme} tweak={tweak}
              allSubs={subs} surface="desktop"
              onClose={() => setPaletteOpen(false)}
              onOpenSub={(s) => {
                window.dispatchEvent(new CustomEvent('lumen:openSubPanel', { detail: { id: s.id } }));
              }} />
            {(localStorage.getItem('lumen.desktopView') || 'home') === 'home' && (
              <OnboardingTour theme={theme} surface="desktop" />
            )}
          </DesktopFrame>
        )}
      </div>

      {/* Tweaks panel */}
      <LumenTweaksPanel tweak={tweak} setTweak={setTweak} theme={theme} />
    </div>
  );
}

function ShellSegmented({ theme, value, onChange, options }) {
  return (
    <div style={{ display: 'inline-flex', background: theme.surface,
      border: `1px solid ${theme.border}` }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '8px 14px', border: 'none', cursor: 'pointer',
          background: value === o.id ? theme.text : 'transparent',
          color: value === o.id ? theme.inverse : theme.textMuted,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function BottomTabs({ theme, screen, setScreen }) {
  const tabs = [
    { id: 'dashboard', label: 'Today', icon: 'home' },
    { id: 'list', label: 'Ledger', icon: 'list' },
    { id: 'recs', label: 'Verdicts', icon: 'spark' },
    { id: 'patterns', label: 'Shape', icon: 'chart' },
    { id: 'settings', label: 'Office', icon: 'gear' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: 26, paddingTop: 10, paddingLeft: 0, paddingRight: 0,
      background: theme.bg, borderTop: `1px solid ${theme.border}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '4px 8px',
      }}>
        {tabs.map(t => {
          const active = t.id === screen;
          return (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{
              flex: 1, padding: '6px 0', border: 'none', cursor: 'pointer',
              background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: active ? theme.accent : theme.textMuted,
              position: 'relative',
            }}>
              <NavIcon name={t.icon} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8.5,
                fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{t.label}</span>
              {active && <span style={{ position: 'absolute', bottom: -10, left: '50%',
                transform: 'translateX(-50%)', width: 18, height: 2, background: theme.accent }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenStepper({ theme, screen, setScreen, screens }) {
  const labels = {
    signin: ['01', 'Sign in'],
    scanning: ['02', 'Scanning'],
    dashboard: ['03', 'Dashboard'],
    list: ['04', 'The Ledger'],
    alerts: ['05', 'Alerts'],
    calendar: ['06', 'Calendar'],
    recs: ['07', 'Verdicts'],
    patterns: ['08', 'Spending shape'],
    accounts: ['09', 'Mailboxes'],
    settings: ['10', 'Office'],
  };
  return (
    <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <Mono color={theme.textSubtle} size={9.5} tracking="0.18em" style={{ marginBottom: 14, paddingLeft: 12 }}>FLOW</Mono>
      {screens.map(s => {
        const [num, name] = labels[s];
        const active = s === screen;
        return (
          <div key={s} onClick={() => setScreen(s)} style={{
            padding: '10px 12px', cursor: 'pointer',
            background: active ? theme.surface : 'transparent',
            borderLeft: `2px solid ${active ? theme.accent : 'transparent'}`,
            color: active ? theme.text : theme.textMuted,
            display: 'flex', alignItems: 'baseline', gap: 10,
          }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              fontWeight: 500, letterSpacing: '0.12em', color: active ? theme.accent : theme.textSubtle }}>{num}</span>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 500,
              fontStyle: active ? 'italic' : 'normal', letterSpacing: '-0.01em' }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopFrame({ theme, children }) {
  return (
    <div style={{ width: 1200, height: 760, overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
      background: theme.bg,
      transform: 'scale(0.78)', transformOrigin: 'center center',
      position: 'relative', border: `1px solid ${theme.border}`,
    }}>
      {/* Window chrome */}
      <div style={{ height: 36, background: theme.bgRaised, borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        <div style={{ flex: 1, textAlign: 'center', fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, color: theme.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          LUMEN · THE SUBSCRIPTION LEDGER
        </div>
      </div>
      <div style={{ height: 'calc(100% - 36px)' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Tweaks panel ──────────────────────────────────────────────
function LumenTweaksPanel({ tweak, setTweak, theme }) {
  const handleResetDemo = () => {
    // Wipe every lumen.* localStorage key so the walkthrough restarts clean.
    const keys = Object.keys(localStorage).filter(k => k.startsWith('lumen.'));
    keys.forEach(k => localStorage.removeItem(k));
    // Hard reload so React state matches.
    window.location.reload();
  };
  const handleRestartTour = () => {
    localStorage.removeItem('lumen.tourDone');
    window.location.reload();
  };
  const handleJumpDashboard = () => {
    localStorage.setItem('lumen.screen', 'dashboard');
    window.location.reload();
  };
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Display">
        <TweakRadio label="Theme" value={tweak.theme} onChange={v => setTweak('theme', v)}
          options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
        <TweakRadio label="Currency" value={tweak.currency} onChange={v => setTweak('currency', v)}
          options={[{ value: 'PKR', label: 'PKR' }, { value: 'USD', label: 'USD' }]} />
        <TweakRadio label="Density" value={tweak.density} onChange={v => setTweak('density', v)}
          options={[{ value: 'airy', label: 'Airy' }, { value: 'compact', label: 'Compact' }]} />
        <TweakRadio label="Accent" value={tweak.accent} onChange={v => setTweak('accent', v)}
          options={[
            { value: 'oxblood', label: 'Oxblood' },
            { value: 'ink',     label: 'Ink' },
            { value: 'olive',   label: 'Olive' },
            { value: 'burnt',   label: 'Burnt' },
          ]} />
        <TweakRadio label="Type" value={tweak.typePair} onChange={v => setTweak('typePair', v)}
          options={[{ value: 'inter', label: 'Inter' }, { value: 'geist', label: 'Geist' }]} />
      </TweakSection>
      <TweakSection title="AI & data">
        <TweakSelect label="AI tone" value={tweak.aiTone} onChange={v => setTweak('aiTone', v)}
          options={[
            { value: 'quiet', label: 'Quiet · evidence-based' },
            { value: 'confident', label: 'Confident · clear verdicts' },
            { value: 'conversational', label: 'Conversational' },
          ]} />
        <TweakRadio label="Scenario" value={tweak.scenario} onChange={v => setTweak('scenario', v)}
          options={[{ value: 'light', label: 'Light user' }, { value: 'heavy', label: 'Power user' }]} />
      </TweakSection>
      <TweakSection title="Demo">
        <TweakButton label="Jump to dashboard" onClick={handleJumpDashboard} secondary />
        <TweakButton label="Restart guided tour" onClick={handleRestartTour} secondary />
        <TweakButton label="Reset demo state" onClick={handleResetDemo} />
        <div style={{ marginTop: 10, padding: '10px 0 2px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, textTransform: 'uppercase' }}>
          Lumen · Prototype Vol. III<br/>
          Designed by Yasir Bucha · 2026
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

// Tiny NavIcon used by BottomTabs — local copy (the desktop has its own)
function NavIcon({ name }) {
  const props = { width: 18, height: 18, viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <path d="M2 6l5-4 5 4v6H2V6z" />,
    list: <><path d="M2 4h10M2 7h10M2 10h7" /></>,
    spark: <path d="M7 1l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />,
    chart: <><path d="M2 12V4M5 12V7M8 12V2M11 12V9" /></>,
    user: <><circle cx="7" cy="5" r="2.5" /><path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" /></>,
    gear: <><circle cx="7" cy="7" r="2" /><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" /></>,
    cal: <><rect x="2" y="3" width="10" height="9" rx="0" /><path d="M2 6h10M5 1.5v2M9 1.5v2" /></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

// Defer mount until ALL <script type="text/babel"> blocks finish compiling
// and register their components on window. With 17+ babel scripts the
// double-rAF defer that used to work now sometimes fires while later scripts
// are still being transpiled, leaving #root empty. We poll on an interval
// until every expected global is on window, then mount once.
window.__lumenMounted = false;
function _lumenTryMount() {
  if (window.__lumenMounted) return true;
  if (!window.ScreenSubDetail || !window.CommandPalette ||
      !window.ScreenCalendar || !window.VerdictHistory ||
      !window.OnboardingTour ||
      !window.LumenTokens || !window.LumenData) {
    return false;
  }
  try {
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    window.__lumenMounted = true;
    return true;
  } catch (e) {
    console.error('Lumen mount error:', e);
    return false;
  }
}
// Try once immediately, then poll every 50ms until success or 5s elapse.
if (!_lumenTryMount()) {
  let _tries = 0;
  const _poll = setInterval(() => {
    _tries++;
    if (_lumenTryMount() || _tries > 100) clearInterval(_poll);
  }, 50);
}
