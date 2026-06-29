import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import { Mono, ScreenHead, Section } from '../components/primitives';
import { AccountAvatar, TopMeta } from '../components/dashboard/AccountAvatar';

export function Mailroom() {
  const theme = useTheme();
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const subs = useSubStore((s) => s.subscriptions);
  const setConnectOpen = useUiStore((s) => s.setConnectOpen);

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%' }}>
      <TopMeta theme={theme} activeAccount="all" />
      <ScreenHead
        theme={theme}
        kicker="ACCOUNTS"
        masthead="The"
        italic="mailroom"
        meta={`${gmailAccounts.length} CONNECTED MAILBOX${gmailAccounts.length === 1 ? '' : 'ES'}`}
      />

      {gmailAccounts.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: theme.text, letterSpacing: '-0.02em' }}>
            No mailbox connected yet.
          </div>
          <Mono color={theme.textMuted} size={10} tracking="0.16em" style={{ display: 'block', marginTop: 12 }}>
            SIGN-IN DOES NOT READ YOUR INBOX — CONNECT GMAIL BELOW
          </Mono>
        </div>
      ) : (
        <Section theme={theme} kicker="MAILBOXES" noBorder>
          {gmailAccounts.map((a, i) => {
            const count = subs.filter((s) => s.account === a.id && s.status === 'active').length;
            const avatar = { id: a.id, label: a.label ?? a.email, email: a.email, color: a.color };
            const statusColor =
              a.status === 'error' ? theme.accent : a.status === 'syncing' ? theme.review : theme.textMuted;
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                }}
              >
                <AccountAvatar acc={avatar} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16, color: theme.text }}>
                    {a.label ?? a.email}
                  </div>
                  <Mono color={theme.textSubtle} size={9} tracking="0.12em">
                    {a.email.toUpperCase()}
                  </Mono>
                  <Mono color={statusColor} size={9} tracking="0.14em" style={{ display: 'block', marginTop: 4 }}>
                    {a.status === 'error'
                      ? 'SYNC FAILED — TAP CONNECT GMAIL BELOW'
                      : a.status === 'syncing'
                        ? 'SYNCING…'
                        : count > 0
                          ? 'SYNCED'
                          : 'CONNECTED · NO SUBS YET — RE-SYNC BELOW'}
                  </Mono>
                </div>
                <Mono color={theme.textMuted} size={9.5} tracking="0.14em">
                  {String(count).padStart(2, '0')} ACTIVE
                </Mono>
              </div>
            );
          })}
        </Section>
      )}

      <div style={{ padding: '20px' }}>
        <button
          type="button"
          onClick={() => setConnectOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: theme.accent,
            color: theme.accentInk,
            border: `1px solid ${theme.accent}`,
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Connect Gmail →
        </button>
        {gmailAccounts.some((a) => a.status === 'error' || (a.status === 'synced' && subs.filter((s) => s.account === a.id).length === 0)) && (
          <Mono color={theme.textMuted} size={9} tracking="0.14em" style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>
            RE-SYNC CLEARS OLD DEMO DATA AND SCANS YOUR INBOX
          </Mono>
        )}
      </div>
    </div>
  );
}
