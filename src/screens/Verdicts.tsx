import { useMemo } from 'react';
import { fmt, fmtCompact, monthlyEquivalent, splitMoney, yearlyEquivalent } from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import {
  EditorialRow,
  GroupHead,
  PullQuote,
  ScreenHead,
  Section,
  StatHero,
  StatStrip,
  VerdictTag,
} from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';

export function Verdicts() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);

  const scoped = useMemo(
    () => subs.filter((s) => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount)),
    [subs, activeAccount],
  );

  const consider = scoped.filter((s) => s.verdict === 'cancel');
  const review = scoped.filter((s) => s.verdict === 'review');
  const considerMonthly = consider.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const considerYearly = consider.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const [ccy, num] = splitMoney(currency, considerMonthly);

  const cycleAccount = () => {
    const ids = ['all', 'personal', 'work', 'family'];
    const idx = ids.indexOf(activeAccount);
    setActiveAccount(ids[(idx + 1) % ids.length]);
  };

  return (
    <div style={{ minHeight: '100%', background: theme.bg, color: theme.text, overflowY: 'auto' }}>
      <TopMeta theme={theme} activeAccount={activeAccount} onAccountSwitcher={cycleAccount} />

      <ScreenHead
        theme={theme}
        kicker="EDITORIAL · EVIDENCE-BASED"
        rightKicker="VOL. III"
        masthead="What to"
        italic="drop"
        meta={`${consider.length} RECOMMENDATIONS · ${consider.length > 0 ? '1 PRIORITY' : 'NOTHING URGENT'}`}
      />

      <StatHero theme={theme} label="POTENTIAL TO RECLAIM" value={num} ccy={ccy} accent />

      <StatStrip
        theme={theme}
        cells={[
          {
            k: 'MONTHLY',
            v: considerMonthly === 0 ? '—' : fmtCompact(currency, considerMonthly),
            s: '/month saved',
            accent: true,
          },
          { k: 'YEARLY', v: fmtCompact(currency, considerYearly), s: '/year saved' },
          { k: 'SUBS', v: String(consider.length).padStart(2, '0'), s: 'flagged' },
        ]}
      />

      <PullQuote theme={theme}>
        Lumen does not auto-cancel. Each verdict is grounded in your transaction and usage history.
      </PullQuote>

      {consider.length > 0 && (
        <>
          <GroupHead
            theme={theme}
            num={String(consider.length).padStart(2, '0')}
            title="Consider cancelling"
            sub="PRIORITY"
          />
          <Section theme={theme} padding="0 24px 18px">
            {consider.map((s, i) => (
              <EditorialRow
                key={s.id}
                first={i === 0}
                onClick={() => setOpenSubId(s.id)}
                theme={theme}
                name={s.merchant}
                meta={s.evidence[0]?.toUpperCase() ?? ''}
                amount={fmt(currency, s.amountPKR)}
                sub={`/${s.cycle === 'yearly' ? 'YR' : 'MO'}`}
                verdict={<VerdictTag verdict="cancel" theme={theme} />}
              />
            ))}
          </Section>
        </>
      )}

      {review.length > 0 && (
        <>
          <GroupHead theme={theme} num={String(review.length).padStart(2, '0')} title="Worth reviewing" sub="WATCH" />
          <Section theme={theme} padding="0 24px 18px">
            {review.map((s, i) => (
              <EditorialRow
                key={s.id}
                first={i === 0}
                onClick={() => setOpenSubId(s.id)}
                theme={theme}
                name={s.merchant}
                meta={s.evidence[0]?.toUpperCase() ?? ''}
                amount={fmt(currency, s.amountPKR)}
                verdict={<VerdictTag verdict="review" theme={theme} />}
              />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}
