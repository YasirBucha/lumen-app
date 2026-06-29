import styles from './Sparkline.module.css';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color: string;
  fill?: boolean;
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  color,
  fill = false,
}: SparklineProps) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => [
    i * step,
    height - ((v - min) / range) * height,
  ]);
  const d = 'M ' + points.map((p) => p.join(' ')).join(' L ');
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} className={styles.svg}>
      {fill && (
        <path
          d={`${d} L ${width} ${height} L 0 ${height} Z`}
          fill={color}
          opacity={0.14}
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}
