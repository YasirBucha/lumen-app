import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { CARD_KINDS, CATEGORIES } from '../lib/seedData';
import {
  daysUntil,
  fmt,
  monthlyEquivalent,
  yearlyEquivalent,
} from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import {
  EditorialRow,
  ScreenHead,
  Section,
  StatPair,
  TabRow,
  VerdictTag,
} from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';
import styles from './Ledger.module.css';

export function Ledger() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');

  const scoped = subs.filter((s) => activeAccount === 'all' || s.account === activeAccount);

  const counts = useMemo(
    () => ({
      active: scoped.filter((s) => s.status === 'active').length,
      upcoming: scoped.filter(
        (s) => s.status === 'active' && daysUntil(s.nextCharge) >= 0 && daysUntil(s.nextCharge) <= 30,
      ).length,
      past: scoped.filter((s) => s.status !== 'active').length,
    }),
    [scoped],
  );

  const filtered = useMemo(() => {
    const list = scoped
      .filter((s) => {
        if (tab === 'active') return s.status === 'active';
        if (tab === 'upcoming') {
          return s.status === 'active' && daysUntil(s.nextCharge) >= 0 && daysUntil(s.nextCharge) <= 30;
        }
        if (tab === 'past') return s.status !== 'active';
        return true;
      })
      .filter((s) => !query || s.merchant.toLowerCase().includes(query.toLowerCase()));

    list.sort((a, b) =>
      tab === 'upcoming'
        ? daysUntil(a.nextCharge) - daysUntil(b.nextCharge)
        : monthlyEquivalent(b) - monthlyEquivalent(a),
    );
    return list;
  }, [scoped, tab, query]);

  const activeScope = scoped.filter((s) => s.status === 'active');
  const monthly = activeScope.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = activeScope.reduce((a, s) => a + yearlyEquivalent(s), 0);

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
        kicker="THE SUBSCRIPTION LEDGER"
        rightKicker={`${counts.active} ACTIVE`}
        masthead="All"
        italic="subs"
        meta="SORTED BY MONTHLY COST"
      />

      <StatPair
        theme={theme}
        cells={[
          { k: 'THIS MONTH', v: fmt(currency, monthly), s: `across ${counts.active} subs` },
          { k: 'YEARLY', v: fmt(currency, yearly), s: 'at current cadence' },
        ]}
      />

      <div className={styles.search} style={{ borderBottomColor: theme.border }}>
        <div className={styles.searchRow}>
          <svg width="13" height="13" viewBox="0 0 14 14">
            <circle cx="6" cy="6" r="4.5" fill="none" stroke={theme.textMuted} strokeWidth="1.3" />
            <path d="M9.5 9.5L12.5 12.5" stroke={theme.textMuted} strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchants…"
            className={`${styles.input} ${query ? '' : styles.inputEmpty}`}
            style={{ color: theme.text }}
          />
        </div>
      </div>

      <TabRow
        theme={theme}
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'active', label: 'Active', count: counts.active },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'past', label: 'Past', count: counts.past },
        ]}
      />

      <Section theme={theme} padding="14px 24px" noBorder>
        {filtered.length === 0 ? (
          <div className={styles.empty} style={{ color: theme.textMuted }}>
            Nothing here.
          </div>
        ) : (
          filtered.map((s, i) => {
            const cat = CATEGORIES.find((c) => c.id === s.category)?.label.toUpperCase() ?? s.category.toUpperCase();
            const card = CARD_KINDS[s.card].label;
            return (
              <EditorialRow
                key={s.id}
                first={i === 0}
                onClick={() => setOpenSubId(s.id)}
                theme={theme}
                name={s.merchant}
                meta={`${cat} · ${card}·${s.last4} · ${s.cycle.toUpperCase()}`}
                amount={fmt(currency, s.amountPKR)}
                verdict={<VerdictTag verdict={s.verdict} theme={theme} />}
              />
            );
          })
        )}
      </Section>
    </div>
  );
}
