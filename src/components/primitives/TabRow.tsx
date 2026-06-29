import type { ThemeTokens } from '../../types';
import styles from './TabRow.module.css';

interface Tab {
  id: string;
  label: string;
  count: number;
}

interface TabRowProps {
  theme: ThemeTokens;
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function TabRow({ theme, tabs, active, onChange }: TabRowProps) {
  return (
    <div className={styles.root} style={{ borderBottomColor: theme.border }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <span
            key={t.id}
            className={styles.tab}
            onClick={() => onChange(t.id)}
            style={{
              color: on ? theme.text : theme.textMuted,
              borderBottom: on ? `2px solid ${theme.accent}` : 'none',
            }}
          >
            {t.label}
            <span className={styles.count} style={{ color: theme.textSubtle }}>
              {String(t.count).padStart(2, '0')}
            </span>
          </span>
        );
      })}
    </div>
  );
}
