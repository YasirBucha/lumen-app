import { useMemo } from 'react';
import { monthlyEquivalent, splitMoney } from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import { Mono, ScreenHead, StatHero } from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';
import { CategoryStack } from '../components/dashboard/CategoryStack';

export function Patterns() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setActiveAccount = useSubStore((s) => s.setActiveAccount);

  const scoped = useMemo(
    () => subs.filter((s) => s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount)),
    [subs, activeAccount],
  );

  const monthly = scoped.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const [ccy, num] = splitMoney(currency, monthly);

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
        kicker="SPENDING ANALYSIS"
        rightKicker={`${scoped.length} ACTIVE`}
        masthead="Spending"
        italic="shape"
        meta="BY CATEGORY · MONTHLY EQUIVALENT"
      />

      <StatHero theme={theme} label="MONTHLY TOTAL" value={num} ccy={ccy} />

      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          CATEGORY MIX
        </Mono>
        <div style={{ marginTop: 14 }}>
          <CategoryStack theme={theme} subs={scoped} currency={currency} />
        </div>
      </div>
    </div>
  );
}
