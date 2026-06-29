import type { ReactNode } from 'react';
import type { ThemeTokens } from '../../types';
import { Masthead } from './Masthead';
import { Mono } from './Mono';
import styles from './ScreenHead.module.css';

interface ScreenHeadProps {
  theme: ThemeTokens;
  kicker?: string;
  rightKicker?: string;
  masthead: string;
  italic?: string;
  meta?: string;
}

export function ScreenHead({
  theme,
  kicker,
  rightKicker,
  masthead,
  italic,
  meta,
}: ScreenHeadProps) {
  return (
    <div className={styles.root} style={{ borderBottomColor: theme.border }}>
      <div className={styles.kickerRow}>
        {kicker && (
          <Mono color={theme.textMuted} size={9.5} tracking="0.16em">
            {kicker}
          </Mono>
        )}
        {rightKicker && (
          <Mono color={theme.textMuted} size={9.5} tracking="0.16em">
            {rightKicker}
          </Mono>
        )}
      </div>
      <Masthead theme={theme} italic={italic} size={30}>
        {masthead}
      </Masthead>
      {meta && (
        <div className={styles.meta}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.12em">
            {meta}
          </Mono>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  theme: ThemeTokens;
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
  noBorder?: boolean;
  padding?: string;
}

export function Section({
  theme,
  kicker,
  action,
  children,
  noBorder,
  padding = '18px 24px',
}: SectionProps) {
  return (
    <div
      className={styles.section}
      style={{
        padding,
        borderBottom: noBorder ? 'none' : `1px solid ${theme.border}`,
      }}
    >
      {(kicker || action) && (
        <div className={styles.sectionHead}>
          {kicker && (
            <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
              {kicker}
            </Mono>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
