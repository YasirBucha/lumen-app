import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import {
  clearUserSubscriptions,
  connectGmailMailbox,
  parseCallableError,
  triggerGmailInitialSync,
} from '../../lib/gmailConnect';
import { accountIdFromEmail } from '../../lib/mailboxAccounts';
import { BigNumber, Mono } from '../primitives';
import styles from './ConnectGmailFlow.module.css';

type Step = 'consent' | 'scan' | 'done' | 'error';
type SyncPhase = 'authorizing' | 'clearing' | 'scanning';

const PHASE_LABEL: Record<SyncPhase, string> = {
  authorizing: 'WAITING FOR GOOGLE APPROVAL…',
  clearing: 'CLEARING OLD DATA…',
  scanning: 'SCANNING RECEIPTS — CAN TAKE 2–5 MIN…',
};

export function ConnectGmailFlow() {
  const theme = useTheme();
  const open = useUiStore((s) => s.connectOpen);
  const setConnectOpen = useUiStore((s) => s.setConnectOpen);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('consent');
  const [syncPhase, setSyncPhase] = useState<SyncPhase>('authorizing');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');
  const [syncStats, setSyncStats] = useState<{ scanned: number; parsed: number } | null>(null);

  const target = useMemo(() => {
    if (!user?.email) return null;
    const email = user.email;
    return {
      id: accountIdFromEmail(email),
      label: email.split('@')[0] ?? 'Primary',
      email,
      color: '#E94F3B',
    };
  }, [user]);

  useEffect(() => {
    if (open) {
      setStep('consent');
      setSyncPhase('authorizing');
      setPct(0);
      setError('');
      setSyncStats(null);
    }
  }, [open]);

  useEffect(() => {
    if (step !== 'scan' || !target || !user) return;

    let cancelled = false;
    let anim: ReturnType<typeof setInterval> | undefined;

    const startScanAnim = () => {
      setPct(8);
      anim = setInterval(() => {
        setPct((p) => Math.min(95, p + 0.35));
      }, 400);
    };

    void (async () => {
      try {
        setSyncPhase('authorizing');
        setPct(0);
        const { accessToken } = await connectGmailMailbox(user.uid, target.id, target.color, target.label);
        if (cancelled) return;

        setSyncPhase('clearing');
        setPct(5);
        await clearUserSubscriptions(user.uid);
        if (cancelled) return;

        setSyncPhase('scanning');
        startScanAnim();
        const result = await triggerGmailInitialSync(target.id, accessToken);
        if (cancelled) return;
        if (anim) clearInterval(anim);
        setSyncStats(result);
        setPct(100);
        setStep('done');
      } catch (e) {
        if (cancelled) return;
        if (anim) clearInterval(anim);
        setError(parseCallableError(e));
        setPct(100);
        setStep('error');
      }
    })();

    return () => {
      cancelled = true;
      if (anim) clearInterval(anim);
    };
  }, [step, target, user]);

  if (!open || !target) return null;

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
              CONNECT GMAIL · {step === 'consent' ? 'CONSENT' : step === 'scan' ? 'SYNC' : step === 'done' ? 'DONE' : 'ERROR'}
            </Mono>
            <button
              type="button"
              className={styles.cancelBtn}
              style={{ color: theme.textMuted }}
              onClick={() => setConnectOpen(false)}
            >
              {step === 'done' || step === 'error' ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {step === 'consent' && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                READ-ONLY ACCESS
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                Connect <span className={styles.italic} style={{ color: theme.accent }}>your Gmail</span>.
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted }}>
                Lumen will read billing and renewal emails only. Sign-in alone does not grant inbox access — this step does.
              </div>
              <div style={{ marginTop: 24, padding: '16px 0', borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                <Mono color={theme.textMuted} size={9} tracking="0.14em">
                  MAILBOX
                </Mono>
                <div style={{ marginTop: 8, fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, color: theme.text }}>
                  {target.email}
                </div>
              </div>
            </>
          )}

          {step === 'scan' && (
            <div style={{ textAlign: 'center' }}>
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                LIVE SYNC · {target.email.toUpperCase()}
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
                {PHASE_LABEL[syncPhase]}
              </Mono>
              {syncPhase === 'scanning' && pct >= 90 && (
                <Mono color={theme.textMuted} size={9} tracking="0.14em" style={{ display: 'block', marginTop: 10 }}>
                  STILL WORKING — DO NOT CLOSE THIS TAB
                </Mono>
              )}
            </div>
          )}

          {step === 'done' && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                SYNC COMPLETE
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                <span className={styles.italic} style={{ color: theme.accent }}>{syncStats?.parsed ?? 0}</span> subscriptions filed.
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted }}>
                Scanned {syncStats?.scanned ?? 0} receipt emails from {target.email}. Your ledger now shows real data only.
              </div>
            </>
          )}

          {step === 'error' && (
            <>
              <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
                SYNC FAILED
              </Mono>
              <div className={styles.headline} style={{ color: theme.text }}>
                Could not <span className={styles.italic} style={{ color: theme.accent }}>sync</span>.
              </div>
              <div className={styles.dek} style={{ color: theme.accent }}>
                {error}
              </div>
              <div className={styles.dek} style={{ color: theme.textMuted, marginTop: 12 }}>
                Check OAuth consent has gmail.readonly scope, then try again.
              </div>
            </>
          )}
        </div>

        {step === 'consent' && (
          <div className={styles.footer} style={{ borderTopColor: theme.border }}>
            <button
              type="button"
              className={styles.primary}
              style={{ background: theme.accent, color: theme.accentInk }}
              onClick={() => setStep('scan')}
            >
              Allow read-only access
            </button>
          </div>
        )}

        {(step === 'done' || step === 'error') && (
          <div className={styles.footer} style={{ borderTopColor: theme.border }}>
            {step === 'error' && (
              <button
                type="button"
                className={styles.primary}
                style={{ background: theme.accent, color: theme.accentInk, marginBottom: 8 }}
                onClick={() => setStep('consent')}
              >
                Try again
              </button>
            )}
            <button
              type="button"
              className={styles.primary}
              style={{ background: theme.accent, color: theme.accentInk }}
              onClick={() => setConnectOpen(false)}
            >
              {step === 'done' ? 'Open ledger' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
