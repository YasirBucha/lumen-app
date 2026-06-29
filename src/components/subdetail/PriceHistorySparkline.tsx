import { useMemo } from 'react';
import type { Subscription, ThemeTokens } from '../../types';
import { fmt } from '../../lib/format';
import { buildPriceSeries, priceIncreasePct, priceQuote } from '../../lib/priceSeries';
import { Mono } from '../primitives';
import styles from './PriceHistorySparkline.module.css';

interface PriceHistorySparklineProps {
  theme: ThemeTokens;
  currency: 'PKR' | 'USD';
  sub: Subscription;
  width?: number;
}

export function PriceHistorySparkline({
  theme,
  currency,
  sub,
  width = 340,
}: PriceHistorySparklineProps) {
  const series = useMemo(() => buildPriceSeries(sub), [sub]);

  if (!sub.priceIncrease) return null;

  const fromStr = fmt(currency, sub.priceIncrease.fromPKR);
  const toStr = fmt(currency, sub.priceIncrease.toPKR);
  const pct = priceIncreasePct(sub);
  const bumpDate = new Date(sub.priceIncrease.date);
  const bumpLabel = bumpDate
    .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    .toUpperCase();

  const W = width;
  const H = 92;
  const padX = 10;
  const padTop = 16;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const min = Math.min(...series.map((s) => s.pkr));
  const max = Math.max(...series.map((s) => s.pkr));
  const range = max - min || 1;
  const step = innerW / (series.length - 1);

  const points = series.map((p, i) => ({
    x: padX + i * step,
    y: padTop + innerH - ((p.pkr - min) / range) * innerH,
    pkr: p.pkr,
    isAfterBump: p.isAfterBump,
    label: p.label,
  }));

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    if (cur.isAfterBump && !prev.isAfterBump) {
      d += ` L ${cur.x},${prev.y} L ${cur.x},${cur.y}`;
    } else {
      const midX = (prev.x + cur.x) / 2;
      d += ` L ${midX},${prev.y} L ${midX},${cur.y} L ${cur.x},${cur.y}`;
    }
  }

  const bumpIdx = points.findIndex((p) => p.isAfterBump);
  const bumpX = bumpIdx > 0 ? points[bumpIdx].x : null;

  return (
    <div className={styles.root} style={{ borderBottomColor: theme.border }}>
      <div className={styles.head}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          PRICE HISTORY · LAST 6 MONTHS
        </Mono>
        <div className={styles.range}>
          <span className={styles.from} style={{ color: theme.textMuted, textDecorationColor: theme.textSubtle }}>
            {fromStr}
          </span>
          <span className={styles.arrow} style={{ color: theme.textSubtle }}>
            →
          </span>
          <span className={styles.to} style={{ color: theme.accent }}>
            {toStr}
          </span>
          <span className={styles.pct} style={{ color: theme.accent }}>
            +{pct}%
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H + 4}
        preserveAspectRatio="none"
        className={styles.chart}
      >
        <line
          x1={padX}
          y1={padTop + innerH}
          x2={W - padX}
          y2={padTop + innerH}
          stroke={theme.border}
          strokeWidth="1"
        />

        {bumpX != null && (
          <line
            x1={bumpX}
            y1={padTop - 4}
            x2={bumpX}
            y2={padTop + innerH}
            stroke={theme.accent}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.7"
          />
        )}

        <path
          d={d}
          fill="none"
          stroke={theme.text}
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.isAfterBump && i === bumpIdx ? 3.2 : 2.2}
            fill={p.isAfterBump ? theme.accent : theme.text}
          />
        ))}

        {points.map((p, i) => (
          <text
            key={`lbl-${i}`}
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="8"
            fontWeight="600"
            letterSpacing="0.10em"
            fill={i === bumpIdx ? theme.accent : theme.textSubtle}
          >
            {p.label}
          </text>
        ))}

        {bumpX != null &&
          (() => {
            const cw = 64;
            const half = cw / 2;
            let cx = bumpX;
            if (cx + half > W - padX) cx = W - padX - half;
            if (cx - half < padX) cx = padX + half;
            return (
              <g>
                <rect
                  x={cx - half}
                  y={padTop - 14}
                  width={cw}
                  height="11"
                  fill={theme.bg}
                  stroke={theme.accent}
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y={padTop - 6}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="7.5"
                  fontWeight="600"
                  letterSpacing="0.14em"
                  fill={theme.accent}
                >
                  {`+${pct}%  ${bumpLabel}`}
                </text>
              </g>
            );
          })()}
      </svg>

      <div className={styles.quote} style={{ color: theme.textMuted }}>
        {priceQuote(sub, pct, fromStr, toStr)}
      </div>
    </div>
  );
}
