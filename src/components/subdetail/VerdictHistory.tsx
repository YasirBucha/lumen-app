import { useMemo } from 'react';
import type { Subscription, ThemeTokens } from '../../types';
import { buildVerdictHistory, vhDateStamp } from '../../lib/verdictHistory';
import { Mono } from '../primitives';
import styles from './VerdictHistory.module.css';

interface VerdictHistoryProps {
  theme: ThemeTokens;
  sub: Subscription;
  compact?: boolean;
}

function verdictColor(theme: ThemeTokens, verdict: string): string {
  const v = verdict.toUpperCase();
  if (v === 'CANCEL' || v === 'CANCELLED') return theme.accent;
  if (v === 'REVIEW') return theme.review;
  if (v === 'KEEP') return theme.good;
  return theme.textSubtle;
}

export function VerdictHistory({ theme, sub, compact }: VerdictHistoryProps) {
  const events = useMemo(() => buildVerdictHistory(sub), [sub]);
  if (!events || events.length <= 1) return null;

  const lastIdx = events.length - 1;

  return (
    <div
      className={compact ? `${styles.root} ${styles.rootCompact}` : styles.root}
      style={{ borderBottomColor: theme.border }}
    >
      <div className={styles.head}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          VERDICT HISTORY · {String(events.length).padStart(2, '0')} EVENT
          {events.length === 1 ? '' : 'S'}
        </Mono>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em">
          BY LUMEN
        </Mono>
      </div>

      <div className={styles.timeline}>
        <span className={styles.line} style={{ background: theme.border }} />

        {events.map((ev, i) => {
          const isLast = i === lastIdx;
          const nodeColor = isLast ? theme.accent : theme.textSubtle;
          const transitionColor = verdictColor(theme, ev.to);

          return (
            <div
              key={i}
              className={`${styles.event} ${isLast ? styles.eventLast : styles.eventNotLast}`}
            >
              <span
                className={`${styles.node} ${isLast ? styles.nodeSquare : styles.nodeRound}`}
                style={{
                  background: isLast ? nodeColor : theme.bg,
                  border: `1.5px solid ${nodeColor}`,
                }}
              />

              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                {vhDateStamp(ev.date)}
              </Mono>

              <div className={styles.transition}>
                <span className={styles.badgeFrom} style={{ color: theme.textSubtle, borderColor: theme.border }}>
                  {ev.from}
                </span>
                <svg width="14" height="9" viewBox="0 0 14 9" className={styles.arrow}>
                  <path
                    d="M0 4.5h12M8 1l4 3.5L8 8"
                    stroke={theme.textMuted}
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={styles.badgeTo}
                  style={{ color: transitionColor, borderColor: transitionColor }}
                >
                  {ev.to}
                </span>
              </div>

              <div
                className={`${styles.headline} ${compact ? styles.headlineCompact : ''}`}
                style={{ color: theme.text }}
              >
                {ev.headline}
              </div>

              <div className={styles.detail} style={{ color: theme.textMuted }}>
                {ev.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
