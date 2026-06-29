import type { ReactNode } from 'react';
import type { ThemeTokens } from '../../types';
import { BigNumber } from './BigNumber';
import { Mono } from './Mono';
import styles from './StatHero.module.css';

interface StatHeroProps {
  theme: ThemeTokens;
  label: string;
  value: string;
  ccy?: string;
  accent?: boolean;
  children?: ReactNode;
}

export function StatHero({ theme, label, value, ccy, accent, children }: StatHeroProps) {
  return (
    <div className={styles.root} style={{ borderBottomColor: theme.border }}>
      <span className={styles.tick} style={{ background: theme.accent }} />
      <div className={styles.labelWrap}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          {label}
        </Mono>
      </div>
      <div className={styles.valueWrap}>
        <BigNumber size={60} color={accent ? theme.accent : theme.text} ccy={ccy}>
          {value}
        </BigNumber>
      </div>
      {children && <div className={styles.children}>{children}</div>}
    </div>
  );
}
