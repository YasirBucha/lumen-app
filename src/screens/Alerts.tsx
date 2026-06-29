import { useMemo } from 'react';
import { fmt, fmtDateShort } from '../lib/format';
import { useTheme } from '../hooks/useTheme';
import { useSubStore } from '../store/subStore';
import { useUiStore } from '../store/uiStore';
import { EditorialRow, ScreenHead, Section } from '../components/primitives';
import { TopMeta } from '../components/dashboard/AccountAvatar';

export function Alerts() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const subs = useSubStore((s) => s.subscriptions);
  const activeAccount = useSubStore((s) => s.activeAccount);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);

  const alerts = useMemo(
    () =>
      subs.filter(
        (s) =>
          s.status === 'active' &&
          (activeAccount === 'all' || s.account === activeAccount) &&
          (s.priceIncrease || s.verdict !== 'keep'),
      ),
    [subs, activeAccount],
  );

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%' }}>
      <TopMeta theme={theme} activeAccount={activeAccount} />
      <ScreenHead
        theme={theme}
        kicker="INBOX"
        masthead="What needs"
        italic="attention"
        meta={`${alerts.length} ITEMS · PRICE HIKES & VERDICTS`}
      />
      <Section theme={theme} kicker="ALERTS" noBorder>
        {alerts.length === 0 ? (
          <div style={{ padding: '24px 20px', color: theme.textMuted }}>Nothing flagged right now.</div>
        ) : (
          alerts.map((s, i) => (
            <EditorialRow
              key={s.id}
              first={i === 0}
              theme={theme}
              name={s.merchant}
              meta={s.priceIncrease ? `HIKE · ${fmtDateShort(s.priceIncrease.date)}` : s.verdict.toUpperCase()}
              amount={fmt(currency, s.amountPKR)}
              onClick={() => setOpenSubId(s.id)}
            />
          ))
        )}
      </Section>
    </div>
  );
}
