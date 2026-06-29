import type { ReactNode } from 'react';
import styles from './BigNumber.module.css';

interface BigNumberProps {
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  sub?: string;
  ccy?: string;
}

export function BigNumber({
  children,
  size = 56,
  color,
  weight = 700,
  sub,
  ccy,
}: BigNumberProps) {
  return (
    <div
      className={styles.root}
      style={{ fontSize: size, fontWeight: weight, color }}
    >
      {ccy && (
        <span className={styles.ccy} style={{ fontSize: size * 0.28 }}>
          {ccy}
        </span>
      )}
      {children}
      {sub && (
        <span className={styles.sub} style={{ fontSize: size * 0.24 }}>
          {sub}
        </span>
      )}
    </div>
  );
}
