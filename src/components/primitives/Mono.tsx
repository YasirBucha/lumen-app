import type { CSSProperties, ReactNode } from 'react';
import styles from './Mono.module.css';

interface MonoProps {
  children: ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  tracking?: string;
  style?: CSSProperties;
  className?: string;
}

export function Mono({
  children,
  color,
  size = 10,
  weight = 600,
  tracking = '0.16em',
  style,
  className,
}: MonoProps) {
  return (
    <span
      className={[styles.mono, className].filter(Boolean).join(' ')}
      style={{ color, fontSize: size, fontWeight: weight, letterSpacing: tracking, ...style }}
    >
      {children}
    </span>
  );
}
