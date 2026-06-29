// ═══════════════════════════════════════════════════════════════════════
// ConnectGmailFlow — 3-step "connect another Gmail" overlay
// Used by mobile ScreenAccounts and desktop DeskMailroom.
// Steps: pick → consent → scan & merge
// ═══════════════════════════════════════════════════════════════════════
const { useState: _cgs, useEffect: _cge } = React;

// Three fictitious accounts the user "could" connect (the real ACCOUNTS in
// data.jsx are the ALREADY-connected ones; these are the candidates).
const CANDIDATE_INBOXES = [
  { id: 'meta_circle',  label: 'Meta Circle',        email: 'yasir@metacircle.health', color: '#2E7D5B', initial: 'M',
    hint: 'WORK · HEALTHCARE AI' },
  { id: 'payfor',       label: 'PayFor BNPL',        email: 'yasir@payfor.pk',          color: '#C8413A', initial: 'P',
    hint: 'COMPANY · FINTECH' },
  { id: 'archive',      label: 'Archive',            email: 'yasir.archive@gmail.com',  color: '#6B7A8F', initial: 'A',
    hint: 'OLDER · STILL ACTIVE' },
];

// Subs that "appear" once the new mailbox is merged. These never persist;
// they're just animation fodder for the scanning step.
const MERGE_SAMPLE = [
  { merchant: 'Vercel Pro',          amountPKR: 5_580, cycle: 'monthly' },
  { merchant: 'Linear Standard',     amountPKR: 2_240, cycle: 'monthly' },
  { merchant: 'GitHub Team',         amountPKR: 1_120, cycle: 'monthly' },
  { merchant: 'AWS · EC2',           amountPKR: 8_400, cycle: 'monthly' },
];

function ConnectGmailFlow({ open, theme, onClose, surface = 'mobile' }) {
  const [step, setStep] = _cgs('pick'); // pick | consent | scan | done
  const [picked, setPicked] = _cgs(null);
  const [pct, setPct] = _cgs(0);
  const [foundIdx, setFoundIdx] = _cgs(0);

  // Reset when reopened
  _cge(() => {
    if (open) { setStep('pick'); setPicked(null); setPct(0); setFoundIdx(0); }
  }, [open]);

  // Scan animation
  _cge(() => {
    if (step !== 'scan') return;
    const t = setInterval(() => setPct(p => {
      const next = Math.min(100, p + 2);
      if (next >= 100) { clearInterval(t); setTimeout(() => setStep('done'), 600); }
      return next;
    }), 60);
    const f = setInterval(() => setFoundIdx(i => (i + 1) % MERGE_SAMPLE.length), 700);
    return () => { clearInterval(t); clearInterval(f); };
  }, [step]);

  if (!open) return null;

  // Width differs by surface
  const wide = surface === 'desktop';

  const overlay = {
    position: 'absolute', inset: 0, zIndex: 50,
    background: 'rgba(7, 12, 20, 0.66)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    display: 'flex', alignItems: wide ? 'center' : 'stretch', justifyContent: 'center',
    padding: wide ? 36 : 0,
  };

  const sheetStyle = wide ? {
    width: 560, maxHeight: '92%',
    background: theme.bg,
    border: `1px solid ${theme.borderHi}`,
    boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  } : {
    width: '100%', height: '100%',
    background: theme.bg,
    display: 'flex', flexDirection: 'column',
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget && wide) onClose(); }}>
      <div style={sheetStyle}>
        {/* Title bar — same for all steps */}
        <FlowHeader theme={theme} step={step} surface={surface} onClose={onClose} />

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {step === 'pick' && (
            <StepPick theme={theme} surface={surface}
              onPick={(acc) => { setPicked(acc); setStep('consent'); }} />
          )}
          {step === 'consent' && picked && (
            <StepConsent theme={theme} surface={surface} picked={picked}
              onBack={() => setStep('pick')}
              onAllow={() => setStep('scan')} />
          )}
          {step === 'scan' && picked && (
            <StepScan theme={theme} surface={surface} picked={picked}
              pct={pct} foundIdx={foundIdx} />
          )}
          {step === 'done' && picked && (
            <StepDone theme={theme} surface={surface} picked={picked} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Header with stepper ──────────────────────────────────────────────
function FlowHeader({ theme, step, surface, onClose }) {
  const order = ['pick', 'consent', 'scan', 'done'];
  const labels = { pick: 'PICK', consent: 'CONSENT', scan: 'SCAN', done: 'DONE' };
  const idx = order.indexOf(step);
  const top = surface === 'mobile' ? 48 : 18;
  return (
    <div style={{ padding: `${top}px 24px 14px`, borderBottom: `1px solid ${theme.border}`,
      background: theme.bgRaised }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">CONNECT MAILBOX · STEP {String(idx + 1).padStart(2, '0')} / 04</Mono>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          color: theme.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase',
          padding: 0,
        }}>{step === 'done' ? 'Close' : 'Cancel'}</button>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {order.map((s, i) => (
          <div key={s} style={{
            height: 2, background: i <= idx ? theme.accent : theme.border,
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {order.map((s, i) => (
          <Mono key={s} color={i === idx ? theme.accent : (i < idx ? theme.textMuted : theme.textSubtle)}
            size={8.5} tracking="0.16em" style={{ textAlign: 'left' }}>
            {String(i + 1).padStart(2, '0')} · {labels[s]}
          </Mono>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1 — Pick a mailbox ─────────────────────────────────────────
function StepPick({ theme, surface, onPick }) {
  return (
    <div style={{ padding: '28px 28px 36px' }}>
      <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">FRIDAY · 29 JUN 2026</Mono>
      <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontSize: surface === 'desktop' ? 38 : 30,
        fontWeight: 700, letterSpacing: '-0.035em', color: theme.text, lineHeight: 1.05 }}>
        Pick a <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>Gmail</span> to add.
      </div>
      <div style={{ marginTop: 12, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: surface === 'desktop' ? 16 : 14, color: theme.textMuted, lineHeight: 1.5,
        letterSpacing: '-0.005em', maxWidth: 460 }}>
        Lumen reads only receipts and renewal mail from this inbox. Nothing else is touched.
      </div>

      <div style={{ marginTop: 24, borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}` }}>
        {CANDIDATE_INBOXES.map((acc, i) => (
          <button key={acc.id} onClick={() => onPick(acc)} style={{
            width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
            padding: '16px 6px', cursor: 'pointer',
            borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
            fontFamily: theme.fontUI,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: acc.color,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 18 }}>
              {acc.initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17,
                letterSpacing: '-0.02em', color: theme.text, lineHeight: 1.1 }}>{acc.label}</div>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.10em" style={{ display: 'block', marginTop: 4 }}>
                {acc.email}
              </Mono>
              <Mono color={theme.textMuted} size={8.5} tracking="0.16em" style={{ display: 'block', marginTop: 4 }}>
                {acc.hint}
              </Mono>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke={theme.textMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* Use a different account */}
      <button style={{
        marginTop: 16, width: '100%', padding: '14px',
        background: 'transparent', border: `1.5px dashed ${theme.border}`,
        color: theme.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14,
            letterSpacing: '-0.015em', color: theme.text }}>Use a different account</div>
          <Mono color={theme.textSubtle} size={8.5} tracking="0.14em" style={{ display: 'block', marginTop: 2 }}>
            OPENS GOOGLE SIGN-IN
          </Mono>
        </div>
      </button>

      {/* Read-only assurance */}
      <div style={{ marginTop: 22, padding: '14px 16px', background: theme.surface,
        border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <rect x="3" y="7" width="10" height="7" stroke={theme.semantic.good} strokeWidth="1.4" />
            <path d="M5 7V5a3 3 0 016 0v2" stroke={theme.semantic.good} strokeWidth="1.4" />
          </svg>
          <div>
            <Mono color={theme.semantic.good} size={9} tracking="0.18em">READ-ONLY ACCESS</Mono>
            <div style={{ marginTop: 4, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
              fontSize: 13, color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
              Lumen cannot send mail, mark as read, or open threads outside receipts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Consent ─────────────────────────────────────────────────
function StepConsent({ theme, surface, picked, onBack, onAllow }) {
  const allowed = [
    { ok: true,  label: 'Read receipts & renewal emails',
      caption: 'Senders matching billing@, no-reply@, receipts@, and 240 known merchants.' },
    { ok: true,  label: 'Read price-change notifications',
      caption: 'Track when a subscription quietly bumps its rate.' },
    { ok: true,  label: 'Read cancellation confirmations',
      caption: 'So Lumen knows when something has ended.' },
  ];
  const denied = [
    { label: 'Send email on your behalf' },
    { label: 'Read personal threads, drafts, or chat' },
    { label: 'Modify, delete, or label messages' },
    { label: 'Access contacts or calendar' },
  ];

  return (
    <div style={{ padding: '28px 28px 36px' }}>
      {/* Mini cover */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: picked.color,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20 }}>
          {picked.initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17,
            color: theme.text, letterSpacing: '-0.02em' }}>{picked.label}</div>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.10em">{picked.email}</Mono>
        </div>
      </div>

      <div style={{ marginTop: 22, fontFamily: '"Fraunces", serif', fontSize: surface === 'desktop' ? 32 : 26,
        fontWeight: 700, letterSpacing: '-0.035em', color: theme.text, lineHeight: 1.1 }}>
        Lumen will <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>read</span>.<br/>
        Never <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>write</span>.
      </div>

      <div style={{ marginTop: 22 }}>
        <Mono color={theme.semantic.good} size={9.5} tracking="0.18em">WILL ACCESS</Mono>
        <div style={{ marginTop: 8, borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}` }}>
          {allowed.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12,
              alignItems: 'flex-start', padding: '12px 6px',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginTop: 4 }}>
                <path d="M3 8l3 3 7-7" stroke={theme.semantic.good} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                  color: theme.text, letterSpacing: '-0.015em' }}>{row.label}</div>
                <div style={{ marginTop: 3, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
                  fontSize: 12.5, color: theme.textSubtle, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
                  {row.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">WILL NEVER</Mono>
        <div style={{ marginTop: 8, borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}` }}>
          {denied.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12,
              alignItems: 'center', padding: '10px 6px',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ fontFamily: theme.fontUI, fontSize: 13.5, color: theme.textMuted,
                letterSpacing: '-0.005em' }}>{row.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial note */}
      <div style={{ marginTop: 18, padding: '14px 16px',
        borderLeft: `2px solid ${theme.accent}` }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 13.5, color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
          You can disconnect this mailbox at any time from <span style={{ color: theme.text, fontStyle: 'normal' }}>The mailroom</span>.
          When you do, its ledger entries are wiped from Lumen.
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10 }}>
        <button onClick={onBack} style={{
          height: 50, padding: '0 22px', background: 'transparent',
          border: `1px solid ${theme.border}`, color: theme.text, cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>← Back</button>
        <button onClick={onAllow} style={{
          height: 50, border: 'none', background: theme.accent, color: theme.accentInk,
          cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Allow read-only access</button>
      </div>
    </div>
  );
}

// ─── Step 3 — Scanning & merging ─────────────────────────────────────
function StepScan({ theme, surface, picked, pct, foundIdx }) {
  const found = Math.min(MERGE_SAMPLE.length, Math.floor((pct / 100) * MERGE_SAMPLE.length) + 1);
  const scanned = Math.floor((pct / 100) * 9_412);
  const item = MERGE_SAMPLE[foundIdx];
  return (
    <div style={{ padding: '28px 28px 36px' }}>
      <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">READING · {picked.email.toUpperCase()}</Mono>
      <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontSize: surface === 'desktop' ? 34 : 28,
        fontWeight: 700, letterSpacing: '-0.035em', color: theme.text, lineHeight: 1.05 }}>
        Adding <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>{picked.label}</span> to the ledger.
      </div>

      {/* Big % */}
      <div style={{ marginTop: 28, position: 'relative', width: 180, height: 180,
        marginInline: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="180" height="180" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r="82" fill="none" stroke={theme.border} strokeWidth="1" />
          <circle cx="90" cy="90" r="82" fill="none" stroke={theme.accent} strokeWidth="1.5"
            strokeDasharray={`${(pct / 100) * 515} 515`} strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.2s ease' }} />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 56,
            letterSpacing: '-0.04em', color: theme.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {Math.round(pct)}<span style={{ fontSize: 22, color: theme.textMuted, marginLeft: 2 }}>%</span>
          </div>
          <Mono color={theme.textMuted} size={9} tracking="0.18em" style={{ marginTop: 8, display: 'block' }}>MERGING</Mono>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ marginTop: 22, borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '14px 16px', borderRight: `1px solid ${theme.border}` }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">EMAILS READ</Mono>
            <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontWeight: 600,
              fontSize: 22, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>
              {scanned.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">NEW SUBS FOUND</Mono>
            <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontWeight: 600,
              fontSize: 22, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.accent }}>
              +{String(found).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div style={{ marginTop: 22 }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.18em">LATEST VERIFICATION</Mono>
        <div style={{ marginTop: 10, padding: '12px 0', borderTop: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, background: theme.surface,
            border: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 15, color: theme.text }}>
            {item.merchant.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
              color: theme.text, letterSpacing: '-0.015em' }}>{item.merchant}</div>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.12em" style={{ marginTop: 2, display: 'block' }}>
              {item.cycle.toUpperCase()} · RS {item.amountPKR.toLocaleString()}
            </Mono>
          </div>
          <Mono color={theme.semantic.good} size={9} tracking="0.16em">MERGED</Mono>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Done ────────────────────────────────────────────────────
function StepDone({ theme, surface, picked, onClose }) {
  const totalMonthly = MERGE_SAMPLE.reduce((a, s) => a + s.amountPKR, 0);
  const totalYearly = totalMonthly * 12;
  return (
    <div style={{ padding: '28px 28px 36px' }}>
      <Mono color={theme.semantic.good} size={9.5} tracking="0.18em">▲ MERGED · {picked.email.toUpperCase()}</Mono>
      <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontSize: surface === 'desktop' ? 38 : 30,
        fontWeight: 700, letterSpacing: '-0.035em', color: theme.text, lineHeight: 1.05 }}>
        Added to the <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>ledger</span>.
      </div>
      <div style={{ marginTop: 12, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: surface === 'desktop' ? 16 : 14, color: theme.textMuted, lineHeight: 1.5,
        letterSpacing: '-0.005em', maxWidth: 460 }}>
        {picked.label}'s subscriptions are now visible alongside your other mailboxes.
        Switch between them from the chip in the top-right.
      </div>

      {/* Stat pair */}
      <div style={{ marginTop: 26, borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '18px 16px', borderRight: `1px solid ${theme.border}` }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">NEW SUBS</Mono>
            <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 700,
              fontSize: 38, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', color: theme.text, lineHeight: 1 }}>
              +{String(MERGE_SAMPLE.length).padStart(2, '0')}
            </div>
            <Mono color={theme.textMuted} size={9} tracking="0.16em" style={{ marginTop: 6, display: 'block' }}>
              ALL ACTIVE
            </Mono>
          </div>
          <div style={{ padding: '18px 16px' }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">+ PER MONTH</Mono>
            <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 700,
              fontSize: 38, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', color: theme.accent, lineHeight: 1 }}>
              Rs {totalMonthly.toLocaleString()}
            </div>
            <Mono color={theme.textMuted} size={9} tracking="0.16em" style={{ marginTop: 6, display: 'block' }}>
              RS {totalYearly.toLocaleString()} /YR
            </Mono>
          </div>
        </div>
      </div>

      {/* New subs found list */}
      <div style={{ marginTop: 22 }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">NEW IN THE LEDGER</Mono>
        <div style={{ marginTop: 8, borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}` }}>
          {MERGE_SAMPLE.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12,
              alignItems: 'center', padding: '12px 6px',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
              <div style={{ width: 28, height: 28, background: theme.surface,
                border: `1px solid ${theme.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 13, color: theme.text }}>
                {s.merchant.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 14,
                  color: theme.text, letterSpacing: '-0.015em' }}>{s.merchant}</div>
                <Mono color={theme.textSubtle} size={9} tracking="0.10em">MONTHLY</Mono>
              </div>
              <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
                Rs {s.amountPKR.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pull quote */}
      <div style={{ marginTop: 22, padding: '14px 16px',
        borderLeft: `2px solid ${theme.accent}` }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 14, color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
          “Verdicts and category tags travel with each subscription — even if it switches mailboxes later.”
        </div>
        <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ marginTop: 8, display: 'block' }}>— BY LUMEN</Mono>
      </div>

      {/* Done CTA */}
      <button onClick={onClose} style={{
        marginTop: 26, width: '100%', height: 50, border: 'none',
        background: theme.accent, color: theme.accentInk, cursor: 'pointer',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>Return to the mailroom →</button>
    </div>
  );
}

Object.assign(window, { ConnectGmailFlow });
