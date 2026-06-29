import type { CSSProperties, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { useUiStore } from '../store/uiStore';
import { useSubStore } from '../store/subStore';
import { LumenLogo, Mono, ScreenHead } from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';
import styles from './Settings.module.css';

function toneSub(t: string) {
  if (t === 'quiet') return 'Evidence-based';
  if (t === 'confident') return 'Clear verdicts';
  return 'Friendly';
}

function SettingsGroup({ title, theme, children }: { title: string; theme: ReturnType<typeof useTheme>; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
        {title}
      </Mono>
      <div className={styles.groupList} style={{ borderColor: theme.border }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  theme,
  icon,
  title,
  sub,
  chev,
  toggle,
  on,
  danger,
  first,
  onClick,
}: {
  theme: ReturnType<typeof useTheme>;
  icon?: React.ReactNode;
  title: string;
  sub?: string;
  chev?: boolean;
  toggle?: boolean;
  on?: boolean;
  danger?: boolean;
  first?: boolean;
  onClick?: () => void;
}) {
  const titleColor = danger ? theme.accent : theme.text;
  return (
    <div
      className={`${styles.row} ${first ? styles.rowFirst : ''} ${!toggle && onClick ? styles.rowClickable : ''}`}
      style={{ borderTopColor: first ? 'transparent' : theme.border }}
      onClick={toggle ? undefined : onClick}
    >
      {icon}
      <div className={styles.body}>
        <div className={styles.title} style={{ color: titleColor }}>
          {title}
        </div>
        {sub && (
          <div className={styles.sub} style={{ color: theme.textMuted }}>
            {sub}
          </div>
        )}
      </div>
      {chev && (
        <svg className={styles.chev} width="12" height="12" viewBox="0 0 12 12">
          <path d="M4 2l4 4-4 4" fill="none" stroke={theme.textSubtle} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {toggle && (
        <div
          className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
          style={{ '--border-hi': theme.borderHi, '--accent': theme.accent, '--surface-raised': theme.surfaceRaised } as CSSProperties}
        >
          <span className={`${styles.toggleKnob} ${on ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const currency = useUiStore((s) => s.currency);
  const aiTone = useUiStore((s) => s.aiTone);
  const uiTheme = useUiStore((s) => s.theme);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);

  const initial = user?.displayName?.[0]?.toUpperCase() ?? 'Y';

  const cycleAccount = () => {
    const ids = ['all', 'personal', 'work', 'family'];
    const idx = ids.indexOf(activeAccount);
    setActiveAccount(ids[(idx + 1) % ids.length]);
  };

  return (
    <div className={styles.root} style={{ background: theme.bg, color: theme.text, '--border': theme.border } as CSSProperties}>
      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={cycleAccount} />

      <ScreenHead
        theme={theme}
        kicker="ACCOUNT · PRIVACY · DATA"
        rightKicker="V0.5"
        masthead="The"
        italic="office"
        meta="MASTHEAD · COLOPHON · SETTINGS"
      />

      <SettingsGroup title="PROFILE" theme={theme}>
        <SettingsRow
          theme={theme}
          first
          icon={
            <div className={styles.icon} style={{ background: theme.accent, color: theme.accentInk }}>
              {initial}
            </div>
          }
          title={user?.displayName ?? 'Yasir Bucha'}
          sub={user?.email ?? 'yasir.bucha@gmail.com'}
          chev
        />
      </SettingsGroup>

      <SettingsGroup title="DISPLAY" theme={theme}>
        <SettingsRow
          theme={theme}
          first
          title="Theme"
          sub={uiTheme === 'dark' ? 'Dark · Newsprint cream on ink' : 'Light · Ink on newsprint'}
          chev
        />
        <SettingsRow
          theme={theme}
          title="Currency"
          sub={currency === 'PKR' ? 'PKR (Rs) primary' : 'USD ($) primary'}
          chev
        />
        <SettingsRow
          theme={theme}
          title="AI tone"
          sub={`${aiTone[0].toUpperCase()}${aiTone.slice(1)} · ${toneSub(aiTone)}`}
          chev
        />
      </SettingsGroup>

      <SettingsGroup title="PRIVACY" theme={theme}>
        <SettingsRow theme={theme} first title="Read-only Gmail access" sub="Receipts & subscription mail" toggle on />
        <SettingsRow theme={theme} title="On-device extraction" sub="Email contents never leave your device" toggle on />
        <SettingsRow theme={theme} title="Verified data only" sub="No estimates. No guesses." toggle on />
        <SettingsRow theme={theme} title="Notify on price increases" sub="Email + push when a renewal changes" toggle on />
      </SettingsGroup>

      <SettingsGroup title="DATA" theme={theme}>
        <SettingsRow theme={theme} first title="Re-scan all mailboxes" sub="Last full scan: today, 2:14 PM" chev />
        <SettingsRow theme={theme} title="Export to CSV" sub="All subscriptions + history" chev />
        <SettingsRow theme={theme} title="Delete account & data" danger chev />
        <SettingsRow theme={theme} title="Sign out" sub="End session on this device" onClick={() => signOut()} chev />
      </SettingsGroup>

      <div className={styles.colophon} style={{ borderTopColor: theme.border }}>
        <LumenLogo size={18} theme={theme} />
        <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ display: 'block', marginTop: 10 }}>
          VERSION 0.5 · BUILD 2026.06
        </Mono>
        <div className={styles.tagline} style={{ color: theme.textSubtle }}>
          The Subscription Ledger
        </div>
      </div>
    </div>
  );
}
