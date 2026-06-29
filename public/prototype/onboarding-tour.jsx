// ═══════════════════════════════════════════════════════════════════════
// OnboardingTour — one-time, skippable, editorial hint overlay shown on
// the dashboard the first time a fresh visitor lands on it.
//
// Behavior:
//   - Reads/sets `lumen.tourDone` in localStorage. If 'true', renders null.
//   - 5 numbered "spreads": each is a centered editorial card with a
//     hairline-bordered panel, mono kicker (e.g. "01 OF 05"), Fraunces
//     headline w/ one italic oxblood word, a short rationale, and
//     [Skip tour] / [Next →] buttons. The last spread says [Begin →]
//     and dismisses.
//   - No DOM targeting / arrow positioning. The tour is a *narrative
//     introduction* that fits the editorial voice of the rest of the app
//     instead of a generic "click here" tooltip walkthrough.
//   - Mounts inside both mobile (full-bleed inside iOS frame) and
//     desktop surfaces. Render the same component once per surface
//     and pass `surface` so layout can adapt.
// ═══════════════════════════════════════════════════════════════════════

const { useState: _otUs, useEffect: _otUe } = React;

const TOUR_SPREADS = [
  {
    kicker: 'OPENING SPREAD',
    title: ['Welcome to ', 'Lumen', '.'],
    italic: 1,
    body: 'A subscription ledger that reads your Gmail and surfaces every active, past, and upcoming charge — with verified amounts only. No vibes, no guessing.',
    foot: '— Read this once. You can re-open it from Tweaks.',
  },
  {
    kicker: 'WHAT YOU SEE',
    title: ['Every charge, ', 'in print', '.'],
    italic: 1,
    body: 'The dashboard is your daily edition. Monthly spend, yearly commitment, what to reclaim — composed like a front page, not a spreadsheet.',
    foot: '— Tap a row to read the file on any subscription.',
  },
  {
    kicker: 'EVIDENCE FIRST',
    title: ['Numbers ', 'beat opinions', '.'],
    italic: 1,
    body: 'Lumen never says "you should cancel this" without showing you the data. Every verdict comes with usage, price history, and the receipt the verdict was built on.',
    foot: '— Open Netflix or Dropbox to see the file structure.',
  },
  {
    kicker: 'YOUR TOOLS',
    title: ['Search, ', 'calendar', ', alerts.'],
    italic: 1,
    body: 'Press ⌘K anywhere to search across mailboxes. The calendar shows what renews when. The alerts inbox surfaces price hikes and decisions worth your time.',
    foot: '— These three are how power users keep spend honest.',
  },
  {
    kicker: 'TO BEGIN',
    title: ['Spend with ', 'intent', '.'],
    italic: 1,
    body: 'This is a prototype, but the data shape, the verdicts, and the design language are production-grade. Walk through it like you would the real app.',
    foot: '— Lumen, Vol. III · By Yasir Bucha',
  },
];

function OnboardingTour({ theme, surface = 'mobile', forceOpen = false, onDone }) {
  const [done, setDone] = _otUs(() => {
    if (forceOpen) return false;
    return localStorage.getItem('lumen.tourDone') === 'true';
  });
  const [idx, setIdx] = _otUs(0);

  _otUe(() => {
    if (forceOpen) { setDone(false); setIdx(0); }
  }, [forceOpen]);

  if (done) return null;

  const close = () => {
    localStorage.setItem('lumen.tourDone', 'true');
    setDone(true);
    if (onDone) onDone();
  };

  const next = () => {
    if (idx >= TOUR_SPREADS.length - 1) close();
    else setIdx(i => i + 1);
  };

  const prev = () => setIdx(i => Math.max(0, i - 1));

  const spread = TOUR_SPREADS[idx];
  const isLast = idx === TOUR_SPREADS.length - 1;

  const cardWidth = surface === 'desktop' ? 480 : 'calc(100% - 40px)';
  const cardMaxWidth = surface === 'desktop' ? 480 : 360;
  const titleSize = surface === 'desktop' ? 38 : 30;
  const bodySize = surface === 'desktop' ? 15 : 13.5;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: theme.bg === '#0E1623' ? 'rgba(7, 12, 20, 0.78)' : 'rgba(26, 39, 56, 0.42)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: surface === 'desktop' ? 60 : 20,
    }}>
      <div style={{
        width: cardWidth, maxWidth: cardMaxWidth,
        background: theme.bg, color: theme.text,
        border: `1px solid ${theme.borderHi}`,
        padding: surface === 'desktop' ? '30px 34px 24px' : '24px 22px 18px',
        position: 'relative',
        fontFamily: theme.fontUI,
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Top rule: kicker + counter */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          paddingBottom: 12, borderBottom: `1px solid ${theme.border}`,
        }}>
          <Mono color={theme.accent} size={9.5} tracking="0.18em">{spread.kicker}</Mono>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em">
            {String(idx + 1).padStart(2, '0')} OF {String(TOUR_SPREADS.length).padStart(2, '0')}
          </Mono>
        </div>

        {/* Title — Fraunces with italic oxblood word */}
        <div style={{
          marginTop: 18,
          fontFamily: '"Fraunces", serif', fontWeight: 700,
          fontSize: titleSize, lineHeight: 1.04, letterSpacing: '-0.035em',
          color: theme.text,
        }}>
          {spread.title.map((part, i) => i === spread.italic
            ? <em key={i} style={{ fontStyle: 'italic', fontWeight: 400, color: theme.accent }}>{part}</em>
            : <span key={i}>{part}</span>
          )}
        </div>

        {/* Body */}
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${theme.border}`,
          fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: bodySize, lineHeight: 1.5, color: theme.textMuted, letterSpacing: '-0.003em',
        }}>
          {spread.body}
        </div>

        {/* Foot — editorial caption */}
        <div style={{ marginTop: 14 }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em">{spread.foot}</Mono>
        </div>

        {/* Spread indicator dots */}
        <div style={{ marginTop: 20, display: 'flex', gap: 6, justifyContent: 'center' }}>
          {TOUR_SPREADS.map((_, i) => (
            <span key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 14 : 6, height: 2, cursor: 'pointer',
              background: i === idx ? theme.accent : theme.borderHi,
              transition: 'width 0.18s',
            }} />
          ))}
        </div>

        {/* Action row */}
        <div style={{
          marginTop: 20, paddingTop: 16, borderTop: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <button onClick={close} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0',
            color: theme.textSubtle,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>Skip tour</button>

          <div style={{ display: 'flex', gap: 8 }}>
            {idx > 0 && (
              <button onClick={prev} style={{
                background: 'transparent', border: `1px solid ${theme.border}`,
                cursor: 'pointer', padding: '8px 14px',
                color: theme.textMuted,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>← Back</button>
            )}
            <button onClick={next} style={{
              background: theme.accent, border: `1px solid ${theme.accent}`,
              cursor: 'pointer', padding: '8px 18px',
              color: theme.accentInk,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>{isLast ? 'Begin →' : 'Next →'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingTour });
