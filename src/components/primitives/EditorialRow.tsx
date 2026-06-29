import type { ReactNode } from 'react';
import type { AiTone, ThemeTokens, Verdict } from '../../types';
import { Mono } from './Mono';
import styles from './EditorialRow.module.css';

interface EditorialRowProps {
  name: string;
  meta?: string;
  amount: string;
  sub?: string;
  theme: ThemeTokens;
  onClick?: () => void;
  verdict?: ReactNode;
  first?: boolean;
}

export function EditorialRow({
  name,
  meta,
  amount,
  sub,
  theme,
  onClick,
  verdict,
  first,
}: EditorialRowProps) {
  return (
    <div
      className={styles.root}
      onClick={onClick}
      style={{
        borderTop: first ? 'none' : `1px solid ${theme.border}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className={styles.left}>
        <div className={styles.name} style={{ color: theme.text }}>
          {name}
        </div>
        {meta && (
          <div className={styles.meta} style={{ color: theme.textSubtle }}>
            {meta}
          </div>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.amount} style={{ color: theme.text }}>
          {amount}
        </div>
        {(sub || verdict) && (
          <div className={styles.subRow}>
            {sub && (
              <Mono color={theme.textSubtle} size={9} tracking="0.10em">
                {sub}
              </Mono>
            )}
            {verdict}
          </div>
        )}
      </div>
    </div>
  );
}

interface VerdictTagProps {
  verdict: Verdict;
  tone?: AiTone;
  theme: ThemeTokens;
}

export function VerdictTag({ verdict, theme }: VerdictTagProps) {
  const colorMap = {
    keep: { color: theme.good, label: 'KEEP' },
    review: { color: theme.review, label: 'REVIEW' },
    cancel: { color: theme.cancel, label: 'CANCEL' },
  };
  const v = colorMap[verdict] ?? colorMap.keep;
  return (
    <span className={styles.tag} style={{ borderColor: v.color, color: v.color }}>
      {v.label}
    </span>
  );
}
