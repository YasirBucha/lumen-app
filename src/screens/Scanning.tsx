import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { fmtMoney } from '../lib/format';
import { BigNumber, Mono, ScreenHead } from '../components/primitives';
import { MerchantGlyph } from '../components/primitives/MerchantGlyph';
import styles from './Scanning.module.css';

const TOTAL_EMAILS = 14_823;

export function Scanning() {
  const theme = useTheme();
  const navigate = useNavigate();
  const subs = useSubStore((s) => s.subscriptions);
  const [pct, setPct] = useState(8);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 1.5)), 60);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!subs.length) return;
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % subs.length), 700);
    return () => clearInterval(t);
  }, [subs.length]);

  const found = Math.min(subs.length, Math.floor((pct / 100) * subs.length) + 1);
  const scanned = Math.floor((pct / 100) * TOTAL_EMAILS);
  const current = subs[tickerIdx];
  const ready = pct >= 100;

  return (
    <div className={styles.root} style={{ background: theme.bg, color: theme.text, '--border': theme.border } as CSSProperties}>
      <div className={styles.headPad}>
        <ScreenHead
          theme={theme}
          kicker="EDITION IN PROGRESS"
          rightKicker="LIVE"
          masthead="Filing the"
          italic="ledger"
          meta="READING · PERSONAL@GMAIL.COM"
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
              stroke={theme.accent}
              strokeWidth="1.5"
              strokeDasharray={`${(pct / 100) * 578} 578`}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <div className={styles.ringCenter}>
            <BigNumber size={68} color={theme.text} sub="%">
              {Math.round(pct)}
            </BigNumber>
            <div style={{ marginTop: 10 }}>
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                SCANNING
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

        {current && (
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
            background: ready ? theme.accent : 'transparent',
            color: ready ? theme.accentInk : theme.textMuted,
          }}
        >
          {ready ? 'See your subscriptions →' : `Scanning ${scanned.toLocaleString()} emails…`}
        </button>
      </div>
    </div>
  );
}
