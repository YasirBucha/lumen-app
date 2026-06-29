import type { ReactNode } from 'react';
import type { ThemeTokens } from '../../types';
import { Mono } from './Mono';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  action?: ReactNode;
  theme: ThemeTokens;
  padding?: string;
}

export function SectionHeader({
  kicker,
  title,
  action,
  theme,
  padding = '0 24px',
}: SectionHeaderProps) {
  return (
    <div className={styles.root} style={{ padding }}>
      <div>
        {kicker && (
          <div className={styles.kicker}>
            <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
              {kicker}
            </Mono>
          </div>
        )}
        <div className={styles.title} style={{ color: theme.text }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}
