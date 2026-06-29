import { useMemo } from 'react';
import { daysUntil, fmt, fmtDateShort } from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import { EditorialRow, ScreenHead, Section } from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';

export function Calendar() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);

  const upcoming = useMemo(
    () =>
      subs
        .filter(
          (s) =>
            s.status === 'active' && (activeAccount === 'all' || s.account === activeAccount),
        )
        .map((s) => ({ ...s, _d: daysUntil(s.nextCharge) }))
        .filter((s) => s._d >= 0 && s._d <= 60)
        .sort((a, b) => a._d - b._d),
    [subs, activeAccount],
  );

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%' }}>
      <TopMeta theme={theme} activeAccount={activeAccount} />
      <ScreenHead
        theme={theme}
        kicker="RENEWALS"
        masthead="What renews"
        italic="when"
        meta={`${upcoming.length} CHARGES · NEXT 60 DAYS`}
      />
      <Section theme={theme} kicker="CALENDAR" noBorder>
        {upcoming.length === 0 ? (
          <div style={{ padding: '24px 20px', color: theme.textMuted }}>No renewals in the next 60 days.</div>
        ) : (
          upcoming.map((s, i) => (
            <EditorialRow
              key={s.id}
              first={i === 0}
              theme={theme}
              name={s.merchant}
              meta={fmtDateShort(s.nextCharge).toUpperCase()}
              amount={fmt(currency, s.amountPKR)}
              sub={s._d === 0 ? 'TODAY' : s._d === 1 ? 'TOMORROW' : `${s._d} DAYS`}
              onClick={() => setOpenSubId(s.id)}
            />
          ))
        )}
      </Section>
    </div>
  );
}
