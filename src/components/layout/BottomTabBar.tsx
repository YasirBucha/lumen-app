import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { NavIcon } from './NavIcon';
import styles from './BottomTabBar.module.css';

const tabs = [
  { to: '/', label: 'Today', icon: 'home' as const, end: true },
  { to: '/ledger', label: 'Ledger', icon: 'list' as const, end: false },
  { to: '/verdicts', label: 'Verdicts', icon: 'spark' as const, end: false },
  { to: '/patterns', label: 'Shape', icon: 'chart' as const, end: false },
  { to: '/settings', label: 'Office', icon: 'gear' as const, end: false },
];

export function BottomTabBar() {
  const theme = useTheme();

  return (
    <nav
      className={styles.root}
      style={
        {
          '--bg': theme.bg,
          '--border': theme.border,
          '--accent': theme.accent,
          '--text-muted': theme.textMuted,
        } as CSSProperties
      }
    >
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            {({ isActive }) => (
              <>
                <NavIcon name={t.icon} />
                <span className={styles.label}>{t.label}</span>
                {isActive && <span className={styles.indicator} />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
