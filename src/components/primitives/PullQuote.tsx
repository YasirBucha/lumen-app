import type { ReactNode } from 'react';
import type { ThemeTokens } from '../../types';
import { Mono } from './Mono';
import styles from './PullQuote.module.css';

interface PullQuoteProps {
  theme: ThemeTokens;
  by?: string;
  children: ReactNode;
}

export function PullQuote({ theme, by, children }: PullQuoteProps) {
  return (
    <div
      className={styles.root}
      style={{ borderBottomColor: theme.border, color: theme.text }}
    >
      <div className={styles.glyph} style={{ color: theme.accent }}>
        “
      </div>
      {children}
      {by && (
        <div className={styles.by} style={{ color: theme.textMuted }}>
          — {by}
        </div>
      )}
    </div>
  );
}

interface GroupHeadProps {
  num: string;
  title: string;
  sub: string;
  theme: ThemeTokens;
}

export function GroupHead({ num, title, sub, theme }: GroupHeadProps) {
  return (
    <div className={styles.groupHead}>
      <div className={styles.num} style={{ color: theme.accent }}>
        {num}
      </div>
      <div className={styles.title} style={{ color: theme.text }}>
        {title}
      </div>
      <div className={styles.sub}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
          {sub}
        </Mono>
      </div>
    </div>
  );
}
