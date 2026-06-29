import type { ThemeTokens } from '../../types';
import { buildMailboxOptions, type MailboxOption } from '../../lib/mailboxAccounts';
import { useSubStore } from '../../store/subStore';
import { Mono } from '../primitives';
import styles from './AccountAvatar.module.css';

interface AccountAvatarProps {
  acc: MailboxOption;
  size?: number;
}

export function AccountAvatar({ acc, size = 22 }: AccountAvatarProps) {
  if (acc.id === 'all') {
    return <div className={styles.all} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={styles.single}
      style={{
        width: size,
        height: size,
        background: acc.color,
        fontSize: size * 0.5,
      }}
    >
      {acc.label.charAt(0).toUpperCase()}
    </div>
  );
}

interface TopMetaProps {
  theme: ThemeTokens;
  activeAccount: string;
  onAccountSwitcher?: () => void;
}

export function TopMeta({ theme, activeAccount, onAccountSwitcher }: TopMetaProps) {
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const options = buildMailboxOptions(gmailAccounts);
  const acc = options.find((a) => a.id === activeAccount) ?? options[0];

  return (
    <div className={styles.topMeta}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
        MONDAY · 29 JUN 2026
      </Mono>
      {acc && onAccountSwitcher ? (
        <div className={styles.switcher} onClick={onAccountSwitcher} style={{ borderColor: theme.border }}>
          <AccountAvatar acc={acc} size={16} />
          <Mono color={theme.text} size={9.5} tracking="0.12em">
            {acc.label}
          </Mono>
          <svg width="8" height="5" viewBox="0 0 8 5">
            <path d="M1 1l3 3 3-3" stroke={theme.textMuted} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <Mono color={theme.textMuted} size={9.5} tracking="0.12em">
          LUMEN
        </Mono>
      )}
    </div>
  );
}
