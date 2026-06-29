import { FX } from '../../lib/seedData';
import { buildMailboxOptions } from '../../lib/mailboxAccounts';
import { useSubStore } from '../../store/subStore';
import { fmtDateShort } from '../../lib/format';
import type { Subscription, ThemeTokens } from '../../types';
import { Masthead, Mono } from '../primitives';
import { TopMeta } from './AccountAvatar';
import styles from './DashboardCards.module.css';

function numberWord(n: number) {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return words[n] ?? String(n);
}

interface PriceIncreaseCardProps {
  theme: ThemeTokens;
  currency: 'PKR' | 'USD';
  subs: Subscription[];
  onOpenSub?: (sub: Subscription) => void;
  onOpenAlerts?: () => void;
}

export function PriceIncreaseCard({
  theme,
  currency,
  subs,
  onOpenSub,
  onOpenAlerts,
}: PriceIncreaseCardProps) {
  const increases = subs.filter((s) => s.status === 'active' && s.priceIncrease);
  if (increases.length === 0) return null;

  const fmtPi = (sub: Subscription, kind: 'from' | 'to') => {
    const pi = sub.priceIncrease!;
    const v = currency === 'USD' ? (kind === 'from' ? pi.fromUSD : pi.toUSD) : kind === 'from' ? pi.fromPKR : pi.toPKR;
    const sym = currency === 'USD' ? '$' : 'Rs ';
    return sym + Math.round(v).toLocaleString();
  };

  const monthlyDelta = increases.reduce((a, s) => {
    const pi = s.priceIncrease!;
    const mFrom = s.cycle === 'yearly' ? pi.fromPKR / 12 : pi.fromPKR;
    const mTo = s.cycle === 'yearly' ? pi.toPKR / 12 : pi.toPKR;
    return a + (mTo - mFrom);
  }, 0);
  const yearlyDeltaStr =
    currency === 'USD'
      ? '$' + Math.round((monthlyDelta * 12) / FX).toLocaleString()
      : 'Rs ' + Math.round(monthlyDelta * 12).toLocaleString();

  return (
    <div className={styles.priceCard} style={{ borderBottomColor: theme.border }}>
      <div className={styles.priceKicker}>
        <div className={styles.priceKickerLeft}>
          <span className={styles.diamond} style={{ background: theme.accent }} />
          <Mono color={theme.accent} size={9.5} tracking="0.20em">
            PRICE WATCH
          </Mono>
          <Mono color={theme.textSubtle} size={9} tracking="0.16em">
            {String(increases.length).padStart(2, '0')} ALERTS · +{yearlyDeltaStr}/YR
          </Mono>
        </div>
        {onOpenAlerts && (
          <span className={styles.link} style={{ color: theme.accent }} onClick={onOpenAlerts}>
            INBOX →
          </span>
        )}
      </div>

      <div className={styles.priceHeadline} style={{ color: theme.text }}>
        {increases.length === 1 ? (
          <>
            One subscription <em style={{ color: theme.accent, fontWeight: 400 }}>raised its price.</em>
          </>
        ) : (
          <>
            {numberWord(increases.length)} subscriptions{' '}
            <em style={{ color: theme.accent, fontWeight: 400 }}>raised their prices.</em>
          </>
        )}
      </div>

      <div className={styles.strips}>
        {increases.map((s, i) => (
          <div
            key={s.id}
            className={styles.strip}
            style={{ borderTopColor: theme.border }}
            onClick={() => onOpenSub?.(s)}
          >
            <Mono color={theme.textSubtle} size={9} tracking="0.12em" style={{ paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </Mono>
            <div className={styles.stripBody}>
              <div className={styles.merchant} style={{ color: theme.text }}>
                {s.merchant}
              </div>
              <div className={styles.changeStrip}>
                <span className={styles.oldPrice} style={{ color: theme.textMuted }}>
                  {fmtPi(s, 'from')}
                </span>
                <span style={{ color: theme.textSubtle }}>→</span>
                <span style={{ color: theme.accent, fontWeight: 600 }}>{fmtPi(s, 'to')}</span>
                <span style={{ color: theme.textSubtle, paddingLeft: 4 }}>
                  +
                  {Math.round(
                    ((s.priceIncrease!.toPKR - s.priceIncrease!.fromPKR) / s.priceIncrease!.fromPKR) * 100,
                  )}
                  %
                </span>
              </div>
              <div className={styles.effective} style={{ color: theme.textSubtle }}>
                EFFECTIVE {fmtDateShort(s.priceIncrease!.date).toUpperCase()} · {s.cycle.toUpperCase()}
              </div>
            </div>
            <svg width="7" height="11" viewBox="0 0 8 12">
              <path
                d="M1 1l5 5-5 5"
                stroke={theme.textMuted}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
        <div className={styles.note} style={{ borderTopColor: theme.border, color: theme.textMuted }}>
          Lumen detected these from renewal emails. Tap any row to review the verdict before the next charge.
        </div>
      </div>
    </div>
  );
}

interface EmptyDashboardProps {
  theme: ThemeTokens;
  activeAccount: string;
  onConnect?: () => void;
  onSwitch?: () => void;
}

export function EmptyDashboard({ theme, activeAccount, onConnect, onSwitch }: EmptyDashboardProps) {
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const options = buildMailboxOptions(gmailAccounts);
  const acc = options.find((a) => a.id === activeAccount) ?? options[0] ?? { id: 'all', label: 'All Mail', email: '' };
  const isSpecificAccount = activeAccount !== 'all';
  const hasConnectedMailbox = gmailAccounts.length > 0;

  return (
    <div className={styles.empty} style={{ background: theme.bg, color: theme.text }}>
      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={onSwitch} />
      <div className={styles.emptyHead} style={{ borderBottomColor: theme.border }}>
        <Masthead theme={theme} size={36}>
          Lumen
        </Masthead>
        <div className={styles.emptyMeta}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            DAILY · MORNING EDITION · {acc.label.toUpperCase()} · 00 ACTIVE
          </Mono>
        </div>
      </div>
      <div className={styles.emptyBody}>
        <div className={styles.emDash} style={{ color: theme.accent }}>
          —
        </div>
        <div className={styles.emptyTitle} style={{ color: theme.text }}>
          Nothing to <em style={{ color: theme.accent, fontWeight: 400 }}>report</em> yet.
        </div>
        <div className={styles.emptyCopy} style={{ color: theme.textMuted }}>
          {isSpecificAccount ? (
            <>
              No subscriptions found in <em>{acc.email || acc.label}</em>. Either this mailbox is genuinely clean, or
              it needs a fresh scan.
            </>
          ) : hasConnectedMailbox ? (
            <>
              Gmail is connected but no subscriptions synced yet. Open Mailroom and tap Connect Gmail to run a fresh
              scan.
            </>
          ) : (
            <>
              No subscriptions are filed against your name today. Connect a Gmail to begin the ledger, or wait — Lumen
              will pick up the next renewal.
            </>
          )}
        </div>
        <div className={styles.emptyStats}>
          {[
            { k: 'MONTHLY', v: '—' },
            { k: 'YEARLY', v: '—' },
            { k: 'ACTIVE', v: '00' },
          ].map((c, i) => (
            <div
              key={c.k}
              className={styles.emptyStatCell}
              style={{ borderLeft: i > 0 ? `1px solid ${theme.border}` : 'none', paddingLeft: i > 0 ? 14 : 0 }}
            >
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">
                {c.k}
              </Mono>
              <div className={styles.emptyStatVal} style={{ color: theme.textMuted }}>
                {c.v}
              </div>
            </div>
          ))}
        </div>
        <button
          className={styles.emptyCta}
          style={{ background: theme.accent, color: '#fff' }}
          onClick={onConnect}
        >
          {isSpecificAccount ? 'Re-scan this mailbox' : hasConnectedMailbox ? 'Sync Gmail now' : 'Connect a Gmail'}
          <svg width="11" height="11" viewBox="0 0 12 12">
            <path
              d="M2 6h8M7 3l3 3-3 3"
              stroke="#fff"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.colophon} style={{ borderTopColor: theme.border }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">
            — A QUIET DAY AT THE LEDGER —
          </Mono>
        </div>
      </div>
    </div>
  );
}
