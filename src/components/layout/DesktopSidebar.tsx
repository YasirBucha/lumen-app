import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { buildMailboxOptions } from '../../lib/mailboxAccounts';
import { useTheme } from '../../hooks/useTheme';
import { useSubStore } from '../../store/subStore';
import { useUiStore } from '../../store/uiStore';
import { LumenLogo, Mono } from '../primitives';
import { AccountAvatar } from '../dashboard/AccountAvatar';
import { NavIcon, type NavIconName } from './NavIcon';
import styles from './DesktopSidebar.module.css';

const navItems: { to: string; label: string; icon: NavIconName; end?: boolean }[] = [
  { to: '/', label: 'Today', icon: 'home', end: true },
  { to: '/ledger', label: 'The Ledger', icon: 'list' },
  { to: '/alerts', label: 'Alerts', icon: 'bell' },
  { to: '/calendar', label: 'Calendar', icon: 'cal' },
  { to: '/verdicts', label: 'Verdicts', icon: 'spark' },
  { to: '/patterns', label: 'Shape', icon: 'chart' },
  { to: '/mailroom', label: 'Mailroom', icon: 'user' },
  { to: '/settings', label: 'Office', icon: 'gear' },
];

export function DesktopSidebar() {
  const theme = useTheme();
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);

  const activeSubs = subs.filter(
    (s) => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount),
  );
  const alertCount = activeSubs.filter((s) => s.priceIncrease).length;

  const mailboxes = buildMailboxOptions(gmailAccounts);

  return (
    <aside
      className={styles.sidebar}
      style={
        {
          '--border': theme.border,
          '--surface': theme.surface,
          '--accent': theme.accent,
          '--text': theme.text,
          '--text-muted': theme.textMuted,
          '--text-subtle': theme.textSubtle,
          '--bg': theme.bg,
        } as CSSProperties
      }
    >
      <LumenLogo size={22} theme={theme} />

      <button
        type="button"
        className={styles.searchBtn}
        onClick={() => setPaletteOpen(true)}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="7" r="5" />
          <path d="M10.6 10.6L14 14" />
        </svg>
        <span className={styles.searchLabel}>SEARCH</span>
        <span className={styles.searchKbd}>⌘K</span>
      </button>

      <nav className={styles.nav}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em" className={styles.navKicker}>
          SECTIONS
        </Mono>
        {navItems.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <NavIcon name={n.icon} />
            <span className={styles.navLabel}>{n.label}</span>
            {n.to === '/alerts' && alertCount > 0 && (
              <span className={styles.badge}>{String(alertCount).padStart(2, '0')}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.mailbox}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em" className={styles.mailboxKicker}>
          MAILBOX
        </Mono>
        {mailboxes.length > 0 ? mailboxes.map((a, i) => (
          <button
            key={a.id}
            type="button"
            className={`${styles.mailboxItem} ${activeAccount === a.id ? styles.mailboxItemActive : ''}`}
            style={i > 0 ? { borderTopColor: theme.border } : undefined}
            onClick={() => setActiveAccount(a.id)}
          >
            <AccountAvatar acc={a} size={18} />
            <span className={styles.mailboxLabel}>{a.label}</span>
          </button>
        )) : (
          <Mono color={theme.textSubtle} size={9} tracking="0.14em">
            NO MAILBOX CONNECTED
          </Mono>
        )}
      </div>
    </aside>
  );
}
