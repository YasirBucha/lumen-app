import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCallableError, triggerGmailInitialSync } from '../lib/gmailConnect';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import { fmtMoney } from '../lib/format';
import { BigNumber, Mono, ScreenHead } from '../components/primitives';
import { MerchantGlyph } from '../components/primitives/MerchantGlyph';
import styles from './Scanning.module.css';

export function Scanning() {
  const theme = useTheme();
  const navigate = useNavigate();
  const setConnectOpen = useUiStore((s) => s.setConnectOpen);
  const subs = useSubStore((s) => s.subscriptions);
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const [pct, setPct] = useState(8);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [scannedTotal, setScannedTotal] = useState(0);
  const [parsedTotal, setParsedTotal] = useState(0);
  const [error, setError] = useState('');
  const syncStarted = useRef(false);

  const account = gmailAccounts.find((a) => a.status === 'syncing') ?? gmailAccounts[0];

  useEffect(() => {
    if (!account || syncStarted.current) return;
    syncStarted.current = true;

    let cancelled = false;
    setPct(12);

    const anim = setInterval(() => {
      setPct((p) => Math.min(92, p + 1.5));
    }, 70);

    void (async () => {
      try {
        const result = await triggerGmailInitialSync(account.id);
        if (cancelled) return;
        clearInterval(anim);
        setScannedTotal(result.scanned);
        setParsedTotal(result.parsed);
        setPct(100);
      } catch (e) {
        if (cancelled) return;
        clearInterval(anim);
        setError(parseCallableError(e));
        setPct(100);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(anim);
    };
  }, [account]);

  useEffect(() => {
    if (!subs.length) return;
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % subs.length), 700);
    return () => clearInterval(t);
  }, [subs.length]);

  if (!account) {
    return (
      <div className={styles.root} style={{ background: theme.bg, color: theme.text, '--border': theme.border } as CSSProperties}>
        <div className={styles.headPad}>
          <ScreenHead theme={theme} kicker="NO MAILBOX" masthead="Connect" italic="Gmail" meta="INBOX ACCESS REQUIRED" />
        </div>
        <div className={styles.body} style={{ padding: '40px 24px', textAlign: 'center' }}>
          <Mono color={theme.textMuted} size={10} tracking="0.16em">
            SIGN-IN ONLY VERIFIES YOU — CONNECT GMAIL TO SCAN RECEIPTS
          </Mono>
        </div>
        <div className={styles.footer} style={{ borderTopColor: theme.border }}>
          <button
            type="button"
            className={`${styles.cta} ${styles.ctaReady}`}
            style={{ background: theme.accent, color: theme.accentInk }}
            onClick={() => setConnectOpen(true)}
          >
            Connect Gmail →
          </button>
        </div>
      </div>
    );
  }

  const found = parsedTotal || subs.length;
  const scanned = scannedTotal || Math.floor((pct / 100) * 500);
  const current = subs[tickerIdx];
  const ready = pct >= 100;

  return (
    <div className={styles.root} style={{ background: theme.bg, color: theme.text, '--border': theme.border } as CSSProperties}>
      <div className={styles.headPad}>
        <ScreenHead
          theme={theme}
          kicker="EDITION IN PROGRESS"
          rightKicker={error ? 'ERROR' : 'LIVE SYNC'}
          masthead="Filing the"
          italic="ledger"
          meta={`READING · ${account.email.toUpperCase()}`}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.ringWrap}>
          <svg className={styles.ringSvg} width="200" height="200">
            <circle cx="100" cy="100" r="92" fill="none" stroke={theme.border} strokeWidth="1" />
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke={error ? theme.cancel : theme.accent}
              strokeWidth="1.5"
              strokeDasharray={`${(pct / 100) * 578} 578`}
              strokeLinecap="butt"
            />
          </svg>
          <div className={styles.ringCenter}>
            <BigNumber size={68} color={theme.text} sub="%">
              {Math.round(pct)}
            </BigNumber>
            <div style={{ marginTop: 10 }}>
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                {error ? 'FAILED' : 'SCANNING'}
              </Mono>
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCell} ${styles.statCellBorder}`}>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">
                EMAILS READ
              </Mono>
              <div className={styles.statValue} style={{ color: theme.text }}>
                {scanned.toLocaleString()}
              </div>
            </div>
            <div className={styles.statCell}>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">
                SUBS FOUND
              </Mono>
              <div className={styles.statValue} style={{ color: theme.accent }}>
                {String(found).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Mono color={theme.cancel} size={9.5} tracking="0.14em" style={{ display: 'block', textAlign: 'center', padding: '0 24px' }}>
            {error}
          </Mono>
        )}

        {current && !error && (
          <div className={styles.ticker}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ display: 'block', marginBottom: 10 }}>
              LATEST VERIFICATION
            </Mono>
            <div className={styles.tickerRow} style={{ borderTopColor: theme.border }}>
              <MerchantGlyph sub={current} size={36} radius={2} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.tickerName} style={{ color: theme.text }}>
                  {current.merchant}
                </div>
                <Mono color={theme.textSubtle} size={9.5} tracking="0.12em" className={styles.tickerMeta}>
                  {current.cycle.toUpperCase()} · {fmtMoney(current.amountPKR, 'PKR').toUpperCase()}
                </Mono>
              </div>
              <Mono color={theme.good} size={9} tracking="0.16em">
                VERIFIED
              </Mono>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer} style={{ borderTopColor: theme.border }}>
        <button
          type="button"
          disabled={!ready}
          onClick={() => navigate('/')}
          className={`${styles.cta} ${ready ? styles.ctaReady : styles.ctaPending}`}
          style={{
            background: ready && !error ? theme.accent : 'transparent',
            color: ready && !error ? theme.accentInk : theme.textMuted,
          }}
        >
          {error ? 'Back to dashboard' : ready ? 'See your subscriptions →' : `Scanning ${scanned.toLocaleString()} emails…`}
        </button>
      </div>
    </div>
  );
}
