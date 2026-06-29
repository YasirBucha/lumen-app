import type { ThemeTokens, TrendPoint } from '../../types';
import styles from './TrendChart.module.css';

interface TrendChartProps {
  trend: TrendPoint[];
  theme: ThemeTokens;
}

export function TrendChart({ trend, theme }: TrendChartProps) {
  const max = Math.max(...trend.map((t) => t.pkr));
  const min = Math.min(...trend.map((t) => t.pkr));
  const w = 340;
  const h = 56;
  const step = w / (trend.length - 1);
  const pts = trend.map((t, i) => [
    i * step,
    h - ((t.pkr - min) / (max - min || 1)) * (h - 8) - 4,
  ]);
  const d = 'M ' + pts.map((p) => p.join(',')).join(' L ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className={styles.svg}>
      <defs>
        <linearGradient id="dg-trend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.20" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w},${h} L 0,${h} Z`} fill="url(#dg-trend)" />
      <path d={d} fill="none" stroke={theme.accent} strokeWidth="1.5" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={theme.accent} />
    </svg>
  );
}
