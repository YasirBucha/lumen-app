import { useMemo } from 'react';
import { ACCOUNTS, buildTrend, CARD_KINDS } from '../lib/seedData';
import {
  daysUntil,
  fmt,
  fmtCompact,
  fmtDateShort,
  monthlyEquivalent,
  splitMoney,
  yearlyEquivalent,
} from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import type { Subscription } from '../types';
import {
  EditorialRow,
  Masthead,
  Mono,
  PullQuote,
  Section,
  StatHero,
  StatStrip,
} from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';
import { CategoryStack } from '../components/dashboard/CategoryStack';
import { EmptyDashboard, PriceIncreaseCard } from '../components/dashboard/DashboardCards';
import { TrendChart } from '../components/dashboard/TrendChart';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const setConnectOpen = useUiStore((s) => s.setConnectOpen);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);

  const activeSubs = subs.filter(
    (s) => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount),
  );

  if (activeSubs.length === 0) {
    return (
      <EmptyDashboard
        theme={theme}
        activeAccount={activeAccount}
        onConnect={() => setConnectOpen(true)}
        onSwitch={() => {
          const ids = ACCOUNTS.map((a) => a.id);
          const idx = ids.indexOf(activeAccount);
          setActiveAccount(ids[(idx + 1) % ids.length]);
        }}
      />
    );
  }

  const monthly = activeSubs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = activeSubs.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const trend = useMemo(() => buildTrend(activeSubs), [activeSubs]);
  const upcoming = activeSubs
    .map((s) => ({ ...s, _d: daysUntil(s.nextCharge) }))
    .filter((s) => s._d >= 0 && s._d <= 14)
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  const reviewSubs = activeSubs.filter((s) => s.verdict !== 'keep');
  const monthlyReviewSaving = reviewSubs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const cancelSubs = activeSubs.filter((s) => s.verdict === 'cancel');
  const featured = cancelSubs[0] || reviewSubs[0];
  const [ccy, num] = splitMoney(currency, monthly);
  const acc = ACCOUNTS.find((a) => a.id === activeAccount) ?? ACCOUNTS[0];

  const cycleAccount = () => {
    const ids = ACCOUNTS.map((a) => a.id);
    const idx = ids.indexOf(activeAccount);
    setActiveAccount(ids[(idx + 1) % ids.length]);
  };

  return (
    <div className={styles.root} style={{ background: theme.bg, color: theme.text }}>
      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={cycleAccount} />

      <div className={styles.masthead} style={{ borderBottomColor: theme.border }}>
        <div className={styles.mastheadRow}>
          <Masthead theme={theme} size={36}>
            Lumen
          </Masthead>
          <button
            className={styles.searchBtn}
            style={{ borderColor: theme.border, color: theme.textMuted }}
            aria-label="Search all inboxes"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5" />
              <path d="M10.6 10.6L14 14" />
            </svg>
            SEARCH
          </button>
        </div>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
          DAILY · MORNING EDITION · {acc.label.toUpperCase()} · {activeSubs.length} ACTIVE
        </Mono>
      </div>

      <StatHero theme={theme} label="MONTHLY SPEND" value={num} ccy={ccy}>
        <TrendChart trend={trend} theme={theme} />
      </StatHero>

      <StatStrip
        theme={theme}
        cells={[
          { k: 'YEARLY', v: fmtCompact(currency, yearly), s: 'at cadence' },
          { k: 'ACTIVE', v: String(activeSubs.length).padStart(2, '0'), s: 'subscriptions' },
          {
            k: 'RECLAIM',
            v: fmtCompact(currency, monthlyReviewSaving),
            s: `${reviewSubs.length} to review`,
            accent: true,
          },
        ]}
      />

      {featured && (
        <PullQuote theme={theme} by={`Lumen, on ${featured.merchant}`}>
          {featured.evidence[0]}
        </PullQuote>
      )}

      <PriceIncreaseCard
        theme={theme}
        currency={currency}
        subs={activeSubs}
        onOpenSub={(s: Subscription) => setOpenSubId(s.id)}
      />

      <Section
        theme={theme}
        kicker="UP NEXT · 14 DAYS"
        action={
          <span className={styles.sectionLink} style={{ color: theme.accent }}>
            SEE ALL →
          </span>
        }
      >
        {upcoming.length === 0 ? (
          <div className={styles.emptyUpcoming} style={{ color: theme.textMuted }}>
            Nothing renews in the next two weeks.
          </div>
        ) : (
          upcoming.map((s, i) => (
            <EditorialRow
              key={s.id}
              first={i === 0}
              onClick={() => setOpenSubId(s.id)}
              theme={theme}
              name={s.merchant}
              meta={`${fmtDateShort(s.nextCharge).toUpperCase()} · ${CARD_KINDS[s.card].label}·${s.last4}`}
              amount={fmt(currency, s.amountPKR)}
              sub={`${s._d === 0 ? 'TODAY' : s._d === 1 ? 'TOMORROW' : `${s._d} DAYS`}`}
            />
          ))
        )}
      </Section>

      <Section
        theme={theme}
        kicker="WHERE IT GOES"
        action={
          <span className={styles.sectionLink} style={{ color: theme.accent }}>
            PATTERNS →
          </span>
        }
        noBorder
      >
        <CategoryStack subs={activeSubs} currency={currency} theme={theme} />
      </Section>
    </div>
  );
}
