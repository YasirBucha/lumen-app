import type { ThemeTokens } from '../../types';
import { Mono } from './Mono';
import styles from './StatStrip.module.css';

interface Cell {
  k: string;
  v: string;
  s?: string;
  accent?: boolean;
}

interface StatStripProps {
  theme: ThemeTokens;
  cells: Cell[];
}

export function StatStrip({ theme, cells }: StatStripProps) {
  return (
    <div
      className={styles.root}
      style={{
        gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
        borderBottomColor: theme.border,
      }}
    >
      {cells.map((c, i) => (
        <div
          key={c.k}
          className={styles.cell}
          style={{
            borderRight: i < cells.length - 1 ? `1px solid ${theme.border}` : 'none',
          }}
        >
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">
            {c.k}
          </Mono>
          <div
            className={styles.value}
            style={{ color: c.accent ? theme.accent : theme.text }}
          >
            {c.v}
          </div>
          {c.s && (
            <div className={styles.sub} style={{ color: theme.textMuted }}>
              {c.s}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface StatPairProps {
  theme: ThemeTokens;
  cells: Cell[];
}

export function StatPair({ theme, cells }: StatPairProps) {
  return (
    <div className={styles.pair} style={{ borderBottomColor: theme.border }}>
      {cells.map((c, i) => (
        <div
          key={c.k}
          className={styles.pairCell}
          style={{ borderRight: i === 0 ? `1px solid ${theme.border}` : 'none' }}
        >
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            {c.k}
          </Mono>
          <div
            className={styles.pairValue}
            style={{ color: c.accent ? theme.accent : theme.text }}
          >
            {c.v}
          </div>
          {c.s && (
            <div className={styles.sub} style={{ color: theme.textMuted }}>
              {c.s}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
