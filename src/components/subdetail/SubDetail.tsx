import type { ReactNode } from 'react';
import type { AiTone, Subscription, ThemeTokens } from '../../types';
import { ACCOUNTS, CATEGORIES } from '../../lib/seedData';
import {
  daysUntil,
  fmt,
  fmtDateShort,
  monthlyEquivalent,
  splitMoney,
  yearlyEquivalent,
} from '../../lib/format';
import { verdictHeadline } from '../../lib/verdictCopy';
import {
  BigNumber,
  CardChip,
  CategoryDot,
  MerchantGlyph,
  Mono,
  PullQuote,
  Section,
  StatHero,
  StatPair,
} from '../primitives';
import { AccountAvatar } from '../dashboard/AccountAvatar';
import { PriceHistorySparkline } from './PriceHistorySparkline';
import { SharedWith } from './SharedWith';
import { VerdictHistory } from './VerdictHistory';
import styles from './SubDetail.module.css';

interface SubDetailProps {
  theme: ThemeTokens;
  currency: 'PKR' | 'USD';
  aiTone: AiTone;
  sub: Subscription;
  onClose: () => void;
  onCancel: (sub: Subscription) => void;
  compact?: boolean;
}

function CancelledStamp() {
  return (
    <div className={styles.stamp}>
      <span className={styles.stampDot} />
      Cancelled
    </div>
  );
}

function TagRow({
  theme,
  label,
  children,
  onClick,
  first,
}: {
  theme: ThemeTokens;
  label: string;
  children: ReactNode;
  onClick?: () => void;
  first?: boolean;
}) {
  return (
    <div
      className={`${styles.tagRow} ${first ? '' : styles.tagRowBorder}`}
      style={{ borderTopColor: theme.border, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Mono color={theme.textMuted} size={9.5} tracking="0.16em">
        {label}
      </Mono>
      <div className={styles.tagValue}>
        {children}
        {onClick && (
          <svg width="7" height="11" viewBox="0 0 8 12">
            <path
              d="M1 1l5 5-5 5"
              stroke={theme.textMuted}
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export function SubDetail({ theme, currency, aiTone, sub, onClose, onCancel, compact }: SubDetailProps) {
  const account = ACCOUNTS.find((a) => a.id === sub.account) ?? ACCOUNTS[0];
  const monthly = monthlyEquivalent(sub);
  const yearly = yearlyEquivalent(sub);
  const d = daysUntil(sub.nextCharge);
  const [ccy, num] = splitMoney(currency, sub.cycle === 'yearly' ? yearly : monthly);
  const isCancelled = sub.status === 'past' && sub.verdict === 'cancel';

  const verdictLabel =
    sub.verdict === 'cancel' ? 'Cancel' : sub.verdict === 'review' ? 'Review' : 'Keep';
  const toneSub =
    aiTone === 'quiet' ? 'evidence-based' : aiTone === 'confident' ? 'with confidence' : 'with care';

  return (
    <div
      className={compact ? `${styles.root} ${styles.rootCompact}` : styles.root}
      style={{ background: theme.bg, color: theme.text }}
    >
      <div className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          style={{ borderColor: theme.border, color: theme.text }}
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 14 14">
            <path
              d="M8.5 2L3.5 7l5 5"
              stroke={theme.text}
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          FILE NO. {sub.id.toUpperCase()}
        </Mono>
        <button
          type="button"
          className={styles.iconBtn}
          style={{ borderColor: theme.border, color: theme.text }}
          aria-label="More options"
        >
          <svg width="11" height="11" viewBox="0 0 14 14">
            <circle cx="7" cy="3" r="1.1" fill={theme.text} />
            <circle cx="7" cy="7" r="1.1" fill={theme.text} />
            <circle cx="7" cy="11" r="1.1" fill={theme.text} />
          </svg>
        </button>
      </div>

      <div
        className={`${styles.masthead} ${isCancelled ? styles.mastheadCancelled : ''}`}
        style={{ borderBottomColor: theme.border }}
      >
        <div className={styles.mastheadRow}>
          <MerchantGlyph sub={sub} size={52} radius={2} />
          <div className={styles.mastheadInfo}>
            <div
              className={styles.merchantName}
              style={{ color: isCancelled ? theme.textMuted : theme.text }}
            >
              {sub.merchant}
              <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>.</span>
            </div>
            <div className={styles.merchantMeta}>
              <Mono color={theme.textMuted} size={9} tracking="0.14em">
                SINCE {sub.since.toUpperCase()} · {(account.email || account.label).toUpperCase()}
              </Mono>
            </div>
          </div>
        </div>
        {isCancelled && (
          <div className={styles.cancelledRow}>
            <CancelledStamp />
            <Mono color={theme.textSubtle} size={9} tracking="0.16em">
              MOVED TO PAST · NO RENEWAL
            </Mono>
          </div>
        )}
      </div>

      {isCancelled ? (
        <div className={styles.cancelledPrice} style={{ borderBottomColor: theme.border }}>
          <span className={styles.cancelledTick} style={{ background: theme.textSubtle }} />
          <div className={styles.cancelledLabel}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
              WAS {sub.cycle === 'yearly' ? 'PER YEAR' : 'PER MONTH'}
            </Mono>
          </div>
          <div className={styles.cancelledAmount}>
            <BigNumber size={46} color={theme.textMuted} ccy={ccy}>
              {num}
            </BigNumber>
            <div className={styles.strike} style={{ background: theme.accent }} />
          </div>
          <div className={styles.reclaimed}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.14em">
              RECLAIMED · {fmt(currency, yearly)} / YEAR
            </Mono>
          </div>
        </div>
      ) : (
        <StatHero
          theme={theme}
          label={sub.cycle === 'yearly' ? 'PER YEAR' : 'PER MONTH'}
          value={num}
          ccy={ccy}
        >
          <Mono color={theme.textMuted} size={9.5} tracking="0.14em">
            ≈ {fmt(currency, sub.cycle === 'yearly' ? monthly : yearly)} /{' '}
            {sub.cycle === 'yearly' ? 'MONTH' : 'YEAR'}
          </Mono>
        </StatHero>
      )}

      <StatPair
        theme={theme}
        cells={[
          {
            k: 'NEXT CHARGE',
            v: fmtDateShort(sub.nextCharge),
            s: d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`,
            accent: d <= 3,
          },
          {
            k: 'VERDICT',
            v: verdictLabel,
            s: toneSub,
            accent: sub.verdict !== 'keep',
          },
        ]}
      />

      <PullQuote theme={theme} by={`Lumen verdict · ${aiTone}`}>
        {verdictHeadline(sub, aiTone)}
      </PullQuote>

      {sub.priceIncrease && (
        <PriceHistorySparkline theme={theme} currency={currency} sub={sub} />
      )}

      {sub.sharedWith && <SharedWith theme={theme} currency={currency} sub={sub} />}

      <Section theme={theme} kicker="THE EVIDENCE">
        {sub.evidence.map((e, i) => (
          <div
            key={i}
            className={`${styles.evidenceRow} ${i === 0 ? '' : styles.evidenceRowBorder}`}
            style={{ borderTopColor: theme.border }}
          >
            <span className={styles.evidenceNum} style={{ color: theme.textSubtle }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.evidenceText} style={{ color: theme.text }}>
              {e}
            </span>
          </div>
        ))}
      </Section>

      <Section theme={theme} kicker="VERIFIED TAGS">
        <TagRow theme={theme} label="Payment method" first>
          <CardChip kind={sub.card} last4={sub.last4} theme={theme} />
        </TagRow>
        <TagRow theme={theme} label="Category">
          <div className={styles.tagCategory}>
            <CategoryDot id={sub.category} />
            <span className={styles.categoryLabel} style={{ color: theme.text }}>
              {CATEGORIES.find((c) => c.id === sub.category)?.label}
            </span>
          </div>
        </TagRow>
        <TagRow theme={theme} label="Gmail">
          <div className={styles.tagGmail}>
            <AccountAvatar acc={account} size={14} />
            <span className={styles.gmailLabel} style={{ color: theme.text }}>
              {account.email || account.label}
            </span>
          </div>
        </TagRow>
      </Section>

      <Section theme={theme} kicker={`TRANSACTION HISTORY · LAST ${sub.history.length}`}>
        {sub.history.map((h, i) => (
          <div
            key={i}
            className={`${styles.historyRow} ${i === 0 ? '' : styles.historyRowBorder}`}
            style={{ borderTopColor: theme.border }}
          >
            <span className={styles.historyDot} style={{ background: theme.good }} />
            <span className={styles.historyDate} style={{ color: theme.text }}>
              {fmtDateShort(h.date)}
            </span>
            <Mono color={theme.textSubtle} size={9} tracking="0.16em">
              VERIFIED
            </Mono>
            <span className={styles.historyAmount} style={{ color: theme.text }}>
              {fmt(currency, h.pkr)}
            </span>
          </div>
        ))}
      </Section>

      <VerdictHistory theme={theme} sub={sub} />

      <div className={styles.actions}>
        {isCancelled ? (
          <>
            <div className={styles.filed} style={{ borderColor: theme.border, color: theme.textMuted }}>
              <svg width="11" height="11" viewBox="0 0 14 14">
                <path
                  d="M3 7l3 3 5-6"
                  stroke={theme.good}
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filed as cancelled
            </div>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              style={{ color: theme.textMuted }}
            >
              Back to the ledger
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.btnPrimary} ${sub.verdict === 'cancel' ? styles.btnPrimaryAccent : ''}`}
              onClick={() => onCancel(sub)}
              style={{
                borderColor: theme.borderHi,
                color: sub.verdict === 'cancel' ? '#fff' : theme.text,
                background: sub.verdict === 'cancel' ? theme.accent : 'transparent',
              }}
            >
              Open cancel link
              <svg width="11" height="11" viewBox="0 0 12 12">
                <path
                  d="M4 2h6v6M10 2L3 9"
                  stroke={sub.verdict === 'cancel' ? '#fff' : theme.text}
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onCancel(sub)}
              style={{ color: theme.textMuted }}
            >
              Mark as cancelled manually
            </button>
          </>
        )}
      </div>
    </div>
  );
}
