import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { connectGmailMailbox, triggerGmailInitialSync } from '../../lib/gmailConnect';
import { BigNumber, Mono } from '../primitives';
import styles from './ConnectGmailFlow.module.css';

type Step = 'pick' | 'consent' | 'scan' | 'done';

const CANDIDATES = [
  { id: 'personal', label: 'Personal', email: 'yasir.bucha@gmail.com', color: '#E94F3B', initial: 'P', hint: 'PRIMARY · PERSONAL' },
  { id: 'work', label: 'Buch Hospital', email: 'yasir@buchhospital.com', color: '#3B7AE9', initial: 'B', hint: 'WORK · HEALTHCARE' },
  { id: 'family', label: 'Family', email: 'bucha.family@gmail.com', color: '#7A3BE9', initial: 'F', hint: 'SHARED · HOUSEHOLD' },
];

const STEP_ORDER: Step[] = ['pick', 'consent', 'scan', 'done'];
const STEP_LABELS = { pick: 'PICK', consent: 'CONSENT', scan: 'SCAN', done: 'DONE' };

export function ConnectGmailFlow() {
  const theme = useTheme();
  const open = useUiStore((s) => s.connectOpen);
  const setConnectOpen = useUiStore((s) => s.setConnectOpen);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('pick');
  const [picked, setPicked] = useState<(typeof CANDIDATES)[0] | null>(null);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep('pick');
      setPicked(null);
      setPct(0);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (step !== 'scan' || !picked || !user) return;

    let cancelled = false;
    setPct(8);

    const anim = setInterval(() => {
      setPct((p) => Math.min(95, p + 1.5));
    }, 60);

    void (async () => {
      try {
        await connectGmailMailbox(user.uid, picked.id, picked.color, picked.label);
        const result = await triggerGmailInitialSync(picked.id);
        if (!cancelled) {
          setPct(100);
          setTimeout(() => setStep('done'), 500);
        }
        if (result) return;
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Connection failed');
          setPct(100);
          setTimeout(() => setStep('done'), 800);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(anim);
    };
  }, [step, picked, user]);

  if (!open) return null;

  const stepIdx = STEP_ORDER.indexOf(step);
  const cssVars = {
    '--bg': theme.bg,
    '--border': theme.border,
    '--border-hi': theme.borderHi,
    '--surface-raised': theme.surfaceRaised,
  } as CSSProperties;

  return (
    <div className={styles.overlay} style={cssVars}>
      <div className={styles.sheet}>
        <div className={styles.header} style={{ borderBottomColor: theme.border, background: theme.surfaceRaised }}>
          <div className={styles.headerRow}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
              CONNECT MAILBOX · STEP {String(stepIdx + 1).padStart(2, '0')} / 04
            </Mono>
            <button
              type="button"
              className={styles.cancelBtn}
              style={{ color: theme.textMuted }}
              onClick={() => setConnectOpen(false)}
            >
              {step === 'done' ? 'Close' : 'Cancel'}
            </button>
          </div>
          <div className={styles.steps}>
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={styles.stepBar}
                style={{ background: i <= stepIdx ? theme.accent : theme.border }}
              />
            ))}
          </div>
          <div className={styles.stepLabels}>
            {STEP_ORDER.map((s, i) => (
              <Mono
                key={s}
                color={i === stepIdx ? theme.accent : i < stepIdx ? theme.textMuted : theme.textSubtle}
                size={8.5}
                tracking="0.16em"
              >
                {String(i + 1).padStart(2, '0')} · {STEP_LABELS[s]}
              </Mono>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          {step === 'pick' && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                FRIDAY · 29 JUN 2026
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                Pick a <span className={styles.italic} style={{ color: theme.accent }}>Gmail</span> to add.
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted }}>
                Lumen reads only receipts and renewal mail from this inbox. Nothing else is touched.
              </div>
              <div className={styles.list} style={{ borderColor: theme.border }}>
                {CANDIDATES.map((acc, i) => (
                  <button
                    key={acc.id}
                    type="button"
                    className={`${styles.pickRow} ${i === 0 ? styles.pickRowFirst : ''}`}
                    style={{ borderTopColor: theme.border }}
                    onClick={() => {
                      setPicked(acc);
                      setStep('consent');
                    }}
                  >
                    <div className={styles.avatar} style={{ background: acc.color }}>
                      {acc.initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className={styles.pickName} style={{ color: theme.text }}>
                        {acc.label}
                      </div>
                      <Mono color={theme.textSubtle} size={9.5} tracking="0.10em" style={{ display: 'block', marginTop: 4 }}>
                        {acc.email}
                      </Mono>
                      <Mono color={theme.textSubtle} size={8.5} tracking="0.12em" style={{ display: 'block', marginTop: 2 }}>
                        {acc.hint}
                      </Mono>
                    </div>
                    <Mono color={theme.textSubtle} size={9} tracking="0.16em">
                      →
                    </Mono>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'consent' && picked && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                READ-ONLY ACCESS
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                Allow Lumen to read <span className={styles.italic} style={{ color: theme.accent }}>receipts</span>?
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted }}>
                Scope: Gmail readonly · billing, renewal, and invoice mail only. Lumen never sends mail or modifies labels.
              </div>
              <div style={{ marginTop: 24, padding: '16px 0', borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                <Mono color={theme.textMuted} size={9} tracking="0.14em">
                  MAILBOX
                </Mono>
                <div style={{ marginTop: 8, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, color: theme.text }}>
                  {picked.email}
                </div>
              </div>
            </>
          )}

          {step === 'scan' && picked && (
            <div style={{ textAlign: 'center' }}>
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                MERGING · {picked.label.toUpperCase()}
              </Mono>
              <div className={styles.scanRing}>
                <svg className={styles.scanSvg} width="160" height="160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke={theme.border} strokeWidth="1" />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth="1.5"
                    strokeDasharray={`${(pct / 100) * 452} 452`}
                  />
                </svg>
                <BigNumber size={48} color={theme.text} sub="%">
                  {Math.round(pct)}
                </BigNumber>
              </div>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
                INDEXING RECEIPTS…
              </Mono>
            </div>
          )}

          {step === 'done' && picked && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                MAILBOX CONNECTED
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                <span className={styles.italic} style={{ color: theme.accent }}>{picked.label}</span> is live.
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted }}>
                {error
                  ? `Connected with demo sync. ${error}`
                  : 'Receipts from this inbox will appear in your ledger after the next sync pass.'}
              </div>
            </>
          )}
        </div>

        {step === 'consent' && picked && (
          <div className={styles.footer} style={{ borderTopColor: theme.border }}>
            <button
              type="button"
              className={styles.primary}
              style={{ background: theme.accent, color: theme.accentInk }}
              onClick={() => setStep('scan')}
            >
              Allow read-only access
            </button>
            <button type="button" className={styles.secondary} style={{ borderColor: theme.borderHi, color: theme.text }} onClick={() => setStep('pick')}>
              Back
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.footer} style={{ borderTopColor: theme.border }}>
            <button
              type="button"
              className={styles.primary}
              style={{ background: theme.accent, color: theme.accentInk }}
              onClick={() => setConnectOpen(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
