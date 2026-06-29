import type { ReactNode } from 'react';
import type { ThemeTokens } from '../../types';
import styles from './Masthead.module.css';

interface MastheadProps {
  children: ReactNode;
  italic?: string;
  accent?: string;
  theme: ThemeTokens;
  size?: number;
}

export function Masthead({ children, italic, accent, theme, size = 32 }: MastheadProps) {
  const accentColor = accent ?? theme.accent;
  return (
    <div className={styles.root} style={{ fontSize: size, color: theme.text }}>
      {children}
      {italic && (
        <span className={styles.italic} style={{ color: accentColor }}>
          {' '}
          {italic}
        </span>
      )}
      <span className={styles.italic} style={{ color: accentColor }}>
        .
      </span>
    </div>
  );
}
