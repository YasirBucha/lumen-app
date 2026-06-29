// Renewal Calendar — week strip + month grid where each renewal is a stamp.
// Editorial newspaper grammar — same DNA as the rest of the app.
//
// Mobile: ScreenCalendar (full screen with bottom-tab room)
// Desktop: DeskCalendar (sidebar list + month grid)
//
// Date model: "today" is hard-pinned to 2026-06-29 to match daysUntil().

const { useMemo: _cm, useState: _cs } = React;

// ───────────────────────────────────────────────────────────────────────
// Date helpers
// ───────────────────────────────────────────────────────────────────────
const CAL_TODAY = new Date('2026-06-29');
CAL_TODAY.setHours(0, 0, 0, 0);

function calStartOfMonth(y, m) { return new Date(y, m, 1); }
function calDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function calIsSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function calFmtMonthYear(y, m) {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function calFmtMonthShort(y, m) {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

// Build a 6-row × 7-col grid for a given month. Week starts on Monday.
// Returns array of { date, inMonth }.
function calBuildMonthGrid(y, m) {
  const first = calStartOfMonth(y, m);
  // Mon=0, Sun=6
  const firstDow = (first.getDay() + 6) % 7;
  const days = calDaysInMonth(y, m);
  const cells = [];
  // Leading days from previous month
  for (let i = 0; i < firstDow; i++) {
    const d = new Date(y, m, 1 - (firstDow - i));
    cells.push({ date: d, inMonth: false });
  }
  for (let i = 1; i <= days; i++) {
    cells.push({ date: new Date(y, m, i), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last); d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  return cells;
}

// Project a sub's renewal forward into upcoming months.
// Returns array of Date instances within window [from, to].
// Monthly subs recur once per cycle starting at nextCharge; yearly subs
// only renew on their nextCharge date.
function calProjectRenewals(sub, fromDate, toDate) {
  const out = [];
  if (!sub.nextCharge) return out;
  const start = new Date(sub.nextCharge);
  start.setHours(0, 0, 0, 0);
  const advance = (d) => {
    const next = new Date(d);
    if (sub.cycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return next;
  };
  let cur = new Date(start);
  // Rewind to from
  while (cur > fromDate) {
    const prev = new Date(cur);
    if (sub.cycle === 'yearly') prev.setFullYear(prev.getFullYear() - 1);
    else prev.setMonth(prev.getMonth() - 1);
    if (prev < fromDate) break;
    cur = prev;
  }
  // If first occurrence is in the future, push forward to from window
  while (cur < fromDate) cur = advance(cur);
  // Collect forward until past toDate
  let safety = 0;
  while (cur <= toDate && safety < 50) {
    out.push(new Date(cur));
    cur = advance(cur);
    safety++;
  }
  return out;
}

// Build a date-keyed map: 'YYYY-MM-DD' -> [{sub, date}, ...]
function calBuildRenewalMap(subs, fromDate, toDate) {
  const map = new Map();
  subs.forEach(s => {
    if (s.status !== 'active') return;
    const dates = calProjectRenewals(s, fromDate, toDate);
    dates.forEach(d => {
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ sub: s, date: d });
    });
  });
  // Sort each cell by amount desc so the biggest stamp surfaces first
  map.forEach(list => list.sort((a, b) =>
    yearlyEquivalent(b.sub) - yearlyEquivalent(a.sub)));
  return map;
}

function calKey(d) { return d.toISOString().slice(0, 10); }

// Stamp color — use category swatch as the chip background, fallback ink.
function calStampColor(sub) {
  const cat = LumenData.CATEGORIES.find(c => c.id === sub.category);
  return cat ? cat.swatch : '#888';
}

// ───────────────────────────────────────────────────────────────────────
// WeekStrip — horizontal 14-day scroller with renewal stamps stacked
// ───────────────────────────────────────────────────────────────────────
function CalWeekStrip({ theme, renewalMap, onPickDay, selectedKey, days = 14, currency }) {
  const cells = _cm(() => {
    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(CAL_TODAY); d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, [days]);

  return (
    <div style={{ display: 'flex', overflowX: 'auto', gap: 0,
      borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
      {cells.map((d, i) => {
        const key = calKey(d);
        const list = renewalMap.get(key) || [];
        const isToday = calIsSameDay(d, CAL_TODAY);
        const total = list.reduce((a, x) => a + x.sub.amountPKR, 0);
        const isSelected = selectedKey === key;
        return (
          <button key={i} onClick={() => onPickDay && onPickDay(key)} style={{
            flex: '0 0 56px', minHeight: 96, padding: '10px 6px 8px',
            border: 'none',
            borderRight: i === cells.length - 1 ? 'none' : `1px solid ${theme.border}`,
            background: isSelected ? theme.surface : 'transparent',
            color: theme.text, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            position: 'relative',
          }}>
            <Mono color={isToday ? theme.accent : theme.textSubtle} size={8.5} tracking="0.18em">
              {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase()}
            </Mono>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: isToday ? 700 : 500,
              fontSize: 18, lineHeight: 1, letterSpacing: '-0.02em',
              color: isToday ? theme.accent : theme.text,
              fontVariantNumeric: 'tabular-nums' }}>
              {String(d.getDate()).padStart(2, '0')}
            </div>
            {isToday && <span style={{ width: 14, height: 1.5, background: theme.accent, marginTop: -2 }} />}
            {/* Stamps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, width: '100%' }}>
              {list.slice(0, 3).map((r, j) => (
                <span key={j} style={{
                  display: 'block', height: 4, width: '100%',
                  background: calStampColor(r.sub), opacity: 0.95,
                }} title={r.sub.merchant} />
              ))}
              {list.length > 3 && (
                <Mono color={theme.textSubtle} size={7.5} tracking="0.10em">+{list.length - 3}</Mono>
              )}
            </div>
            {list.length > 0 && (
              <div style={{ marginTop: 'auto', fontFamily: '"Fraunces", serif',
                fontSize: 10, color: theme.textMuted, fontVariantNumeric: 'tabular-nums',
                paddingTop: 2 }}>
                {currency === 'USD' ? '$' : 'Rs'}
                {' '}
                {currency === 'USD'
                  ? Math.round(total / LumenData.FX).toLocaleString()
                  : Math.round(total).toLocaleString()}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// MonthGrid — 6×7 grid; each cell has up to 2 visible stamps + overflow
// ───────────────────────────────────────────────────────────────────────
function CalMonthGrid({ theme, year, month, renewalMap, onPickDay, selectedKey, mode = 'mobile' }) {
  const cells = _cm(() => calBuildMonthGrid(year, month), [year, month]);
  const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const cellMinH = mode === 'desktop' ? 86 : 64;
  const stampMaxLines = mode === 'desktop' ? 3 : 2;

  return (
    <div>
      {/* DOW header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}` }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ padding: '8px 4px', textAlign: 'center',
            borderRight: i === 6 ? 'none' : `1px solid ${theme.border}`,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
            color: theme.textSubtle, letterSpacing: '0.18em', fontWeight: 500 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((c, i) => {
          const key = calKey(c.date);
          const list = renewalMap.get(key) || [];
          const isToday = calIsSameDay(c.date, CAL_TODAY);
          const isSelected = selectedKey === key;
          const isWeekEnd = i % 7 === 6;
          const isLastRow = i >= 35;
          return (
            <button key={i} onClick={() => onPickDay && onPickDay(key)} style={{
              minHeight: cellMinH, padding: '5px 5px 5px',
              border: 'none',
              borderRight: isWeekEnd ? 'none' : `1px solid ${theme.border}`,
              borderBottom: isLastRow ? 'none' : `1px solid ${theme.border}`,
              background: isSelected ? theme.surface : 'transparent',
              opacity: c.inMonth ? 1 : 0.34,
              color: theme.text, cursor: c.inMonth ? 'pointer' : 'default',
              display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 3,
              position: 'relative', textAlign: 'left',
            }}>
              {/* Date number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: isToday ? 700 : 500,
                  fontSize: 13, lineHeight: 1, letterSpacing: '-0.02em',
                  color: isToday ? theme.accent : (c.inMonth ? theme.text : theme.textSubtle),
                  fontVariantNumeric: 'tabular-nums',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {isToday && <span style={{ width: 4, height: 4, background: theme.accent, borderRadius: 0 }} />}
                  {String(c.date.getDate()).padStart(2, '0')}
                </span>
                {list.length > 0 && (
                  <Mono color={theme.textSubtle} size={8} tracking="0.10em">
                    {String(list.length).padStart(2, '0')}
                  </Mono>
                )}
              </div>

              {/* Stamps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                {list.slice(0, stampMaxLines).map((r, j) => (
                  <div key={j} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'transparent',
                    borderLeft: `2px solid ${calStampColor(r.sub)}`,
                    paddingLeft: 4,
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
                    fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: theme.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {r.sub.merchant.split(' ')[0].slice(0, 7)}
                  </div>
                ))}
                {list.length > stampMaxLines && (
                  <Mono color={theme.textSubtle} size={8} tracking="0.10em">
                    +{list.length - stampMaxLines} more
                  </Mono>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Selected-day detail block — list of renewals on the picked day
// ───────────────────────────────────────────────────────────────────────
function CalDayDetail({ theme, dayKey, renewalMap, currency, onOpenSub }) {
  if (!dayKey) return null;
  const list = renewalMap.get(dayKey) || [];
  const d = new Date(dayKey);
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const total = list.reduce((a, x) => a + x.sub.amountPKR, 0);

  return (
    <div style={{ borderTop: `1px solid ${theme.border}`, padding: '18px 24px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Mono color={theme.accent} size={9.5} tracking="0.18em">SELECTED</Mono>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
          {String(list.length).padStart(2, '0')} CHARGES
        </Mono>
      </div>
      <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500,
        letterSpacing: '-0.025em', color: theme.text }}>
        {dateLabel}
      </div>
      {list.length === 0 ? (
        <div style={{ marginTop: 14, paddingTop: 14, paddingBottom: 14,
          borderTop: `1px dashed ${theme.border}`,
          fontFamily: '"Fraunces", serif', fontSize: 15, fontStyle: 'italic',
          color: theme.textSubtle }}>
          No renewals on this day.
        </div>
      ) : (
        <>
          <div style={{ marginTop: 6,
            fontFamily: '"Fraunces", serif', fontSize: 14, fontStyle: 'italic',
            color: theme.textMuted }}>
            Combined charge — <span style={{ color: theme.accent, fontWeight: 600 }}>
              {currency === 'USD' ? '$' : 'Rs '}
              {currency === 'USD'
                ? Math.round(total / LumenData.FX).toLocaleString()
                : Math.round(total).toLocaleString()}
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            {list.map((r, i) => (
              <button key={i} onClick={() => onOpenSub && onOpenSub(r.sub)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${theme.border}` : 'none',
                borderBottom: `1px solid ${theme.border}`,
                background: 'transparent', textAlign: 'left', cursor: 'pointer',
                color: theme.text,
              }}>
                <span style={{ width: 6, height: 36, background: calStampColor(r.sub) }} />
                <MerchantGlyph sub={r.sub} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 500,
                    letterSpacing: '-0.015em', color: theme.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.sub.merchant}
                  </div>
                  <Mono color={theme.textSubtle} size={9} tracking="0.14em">
                    {r.sub.cycle === 'yearly' ? 'YEARLY' : 'MONTHLY'} · {r.sub.category.toUpperCase()}
                  </Mono>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <BigNumber size={16} color={theme.text}>
                    {fmt(currency, r.sub.amountPKR)}
                  </BigNumber>
                  <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">
                    {r.sub.verdict.toUpperCase()}
                  </Mono>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOBILE — ScreenCalendar
// ═══════════════════════════════════════════════════════════════════════
function ScreenCalendar({ theme, tweak, subs, activeAccount, onAccountSwitcher, onOpenSub, onBack }) {
  const currency = tweak.currency || 'PKR';
  const scoped = subs.filter(s => (activeAccount === 'all' || s.account === activeAccount));
  const active = scoped.filter(s => s.status === 'active');

  // Month navigator
  const [cursor, setCursor] = _cs(() => ({ y: CAL_TODAY.getFullYear(), m: CAL_TODAY.getMonth() }));
  const [selected, setSelected] = _cs(null);

  // Build map covering today + 90 days (3 months) for the week strip and
  // the month grid + neighbouring months.
  const renewalMap = _cm(() => {
    const from = new Date(cursor.y, cursor.m - 1, 1);
    const to   = new Date(cursor.y, cursor.m + 2, 0);
    // Also include current today so week-strip 14d window is covered
    const fromAll = from < CAL_TODAY ? from : CAL_TODAY;
    return calBuildRenewalMap(active, fromAll, to);
  }, [active, cursor.y, cursor.m]);

  // Week-strip uses CAL_TODAY-anchored window — build separate window if cursor month differs
  const stripMap = _cm(() => {
    const to = new Date(CAL_TODAY); to.setDate(to.getDate() + 14);
    return calBuildRenewalMap(active, CAL_TODAY, to);
  }, [active]);

  // Stats for masthead
  const next14 = _cm(() => {
    let count = 0, sum = 0;
    stripMap.forEach((list) => {
      list.forEach(r => { count++; sum += r.sub.amountPKR; });
    });
    return { count, sum };
  }, [stripMap]);

  const monthSum = _cm(() => {
    let sum = 0;
    const monthStart = new Date(cursor.y, cursor.m, 1);
    const monthEnd = new Date(cursor.y, cursor.m + 1, 0);
    renewalMap.forEach((list, key) => {
      const d = new Date(key);
      if (d >= monthStart && d <= monthEnd) {
        list.forEach(r => { sum += r.sub.amountPKR; });
      }
    });
    return sum;
  }, [renewalMap, cursor.y, cursor.m]);

  const prevMonth = () => setCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const nextMonth = () => setCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text,
      fontFamily: theme.fontUI, overflowY: 'auto', paddingBottom: 110 }}>

      {/* Top meta */}
      <div style={{ padding: '56px 24px 12px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between' }}>
        {onBack ? (
          <button onClick={onBack} style={{
            width: 28, height: 28, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14">
              <path d="M8.5 2L3.5 7l5 5" stroke={theme.text} strokeWidth="1.6"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONDAY · 29 JUN 2026</Mono>}
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">THE CALENDAR</Mono>
      </div>

      {/* Masthead */}
      <div style={{ padding: '4px 24px 16px', borderBottom: `1px solid ${theme.border}` }}>
        <Masthead theme={theme} italic="renewals" size={38}>The</Masthead>
        <div style={{ marginTop: 6 }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
            EVERY CHARGE LUMEN EXPECTS · NEXT 90 DAYS
          </Mono>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${theme.border}` }}>
          <Mono color={theme.textMuted} size={9} tracking="0.18em">NEXT 14 DAYS</Mono>
          <div style={{ marginTop: 4 }}>
            <BigNumber size={22} color={theme.accent}>
              {fmtCompact(currency, next14.sum)}
            </BigNumber>
          </div>
          <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">
            {String(next14.count).padStart(2, '0')} CHARGES
          </Mono>
        </div>
        <div style={{ padding: '14px 16px', borderRight: `1px solid ${theme.border}` }}>
          <Mono color={theme.textMuted} size={9} tracking="0.18em">THIS MONTH</Mono>
          <div style={{ marginTop: 4 }}>
            <BigNumber size={22} color={theme.text}>
              {fmtCompact(currency, monthSum)}
            </BigNumber>
          </div>
          <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">
            {calFmtMonthShort(cursor.y, cursor.m)} {cursor.y}
          </Mono>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <Mono color={theme.textMuted} size={9} tracking="0.18em">ACTIVE</Mono>
          <div style={{ marginTop: 4 }}>
            <BigNumber size={22} color={theme.text}>
              {String(active.length).padStart(2, '0')}
            </BigNumber>
          </div>
          <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">SUBS WATCHED</Mono>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <Mono color={theme.text} size={10} tracking="0.18em">THE NEXT FORTNIGHT</Mono>
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">29 JUN → 12 JUL</Mono>
        </div>
      </div>
      <div style={{ padding: '0 0 0' }}>
        <CalWeekStrip theme={theme} renewalMap={stripMap}
          onPickDay={(k) => setSelected(k)}
          selectedKey={selected} currency={currency} />
      </div>

      {/* Selected day detail */}
      <CalDayDetail theme={theme} dayKey={selected} renewalMap={stripMap}
        currency={currency} onOpenSub={onOpenSub} />

      {/* Month grid header */}
      <div style={{ padding: '20px 24px 10px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Mono color={theme.text} size={10} tracking="0.18em">MONTH OVERVIEW</Mono>
          <div style={{ marginTop: 4, fontFamily: '"Fraunces", serif',
            fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em' }}>
            {calFmtMonthYear(cursor.y, cursor.m)}.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          <button onClick={prevMonth} style={{
            width: 30, height: 30, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14">
              <path d="M8.5 2L3.5 7l5 5" stroke={theme.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={nextMonth} style={{
            width: 30, height: 30, border: `1px solid ${theme.border}`, borderLeft: 'none',
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14">
              <path d="M5.5 2l5 5-5 5" stroke={theme.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Month grid */}
      <CalMonthGrid theme={theme} year={cursor.y} month={cursor.m}
        renewalMap={renewalMap}
        onPickDay={(k) => setSelected(k)}
        selectedKey={selected} mode="mobile" />

      {/* Legend */}
      <div style={{ padding: '18px 24px 24px' }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.18em">LEGEND</Mono>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          {LumenData.CATEGORIES.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 2, background: c.swatch }} />
              <Mono color={theme.textMuted} size={8.5} tracking="0.14em">
                {c.label.toUpperCase()}
              </Mono>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: '"Fraunces", serif',
          fontSize: 13, fontStyle: 'italic', color: theme.textMuted, lineHeight: 1.5 }}>
          <span style={{ color: theme.accent, fontWeight: 700 }}>“</span>
          Tap any day to see what Lumen expects. Recurring renewals are projected from the most recent receipt — not predicted.
          <span style={{ color: theme.accent, fontWeight: 700 }}>”</span>
          <div style={{ marginTop: 4 }}>
            <Mono color={theme.textSubtle} size={8.5} tracking="0.18em">— BY LUMEN</Mono>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DESKTOP — DeskCalendar
// ═══════════════════════════════════════════════════════════════════════
function DeskCalendar({ theme, tweak, subs, onOpenSub }) {
  const currency = tweak.currency || 'PKR';
  const active = subs.filter(s => s.status === 'active');

  const [cursor, setCursor] = _cs(() => ({ y: CAL_TODAY.getFullYear(), m: CAL_TODAY.getMonth() }));
  const [selected, setSelected] = _cs(null);

  const renewalMap = _cm(() => {
    const from = new Date(cursor.y, cursor.m - 1, 1);
    const to   = new Date(cursor.y, cursor.m + 2, 0);
    const fromAll = from < CAL_TODAY ? from : CAL_TODAY;
    return calBuildRenewalMap(active, fromAll, to);
  }, [active, cursor.y, cursor.m]);

  const stripMap = _cm(() => {
    const to = new Date(CAL_TODAY); to.setDate(to.getDate() + 14);
    return calBuildRenewalMap(active, CAL_TODAY, to);
  }, [active]);

  // Upcoming list — next 30 days flat
  const upcoming = _cm(() => {
    const out = [];
    const from = new Date(CAL_TODAY);
    const to = new Date(CAL_TODAY); to.setDate(to.getDate() + 30);
    const map = calBuildRenewalMap(active, from, to);
    const keys = [...map.keys()].sort();
    keys.forEach(k => {
      map.get(k).forEach(r => out.push({ ...r, key: k }));
    });
    return out;
  }, [active]);

  const next14 = _cm(() => {
    let count = 0, sum = 0;
    stripMap.forEach((list) => list.forEach(r => { count++; sum += r.sub.amountPKR; }));
    return { count, sum };
  }, [stripMap]);

  const monthSum = _cm(() => {
    let sum = 0;
    const monthStart = new Date(cursor.y, cursor.m, 1);
    const monthEnd = new Date(cursor.y, cursor.m + 1, 0);
    renewalMap.forEach((list, key) => {
      const d = new Date(key);
      if (d >= monthStart && d <= monthEnd) list.forEach(r => { sum += r.sub.amountPKR; });
    });
    return sum;
  }, [renewalMap, cursor.y, cursor.m]);

  const prevMonth = () => setCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const nextMonth = () => setCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });
  const goToday   = () => setCursor({ y: CAL_TODAY.getFullYear(), m: CAL_TODAY.getMonth() });

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22,
        paddingBottom: 18, borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">EVERY CHARGE LUMEN EXPECTS · NEXT 90 DAYS</Mono>
          <div style={{ marginTop: 8 }}>
            <Masthead theme={theme} italic="renewals" size={40}>The</Masthead>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={goToday} style={{
            padding: '7px 12px', border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>TODAY</button>
          <button onClick={prevMonth} style={{
            width: 32, height: 30, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14">
              <path d="M8.5 2L3.5 7l5 5" stroke={theme.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={nextMonth} style={{
            width: 32, height: 30, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14">
              <path d="M5.5 2l5 5-5 5" stroke={theme.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: `1px solid ${theme.border}`, marginBottom: 28 }}>
        <KPICard theme={theme} kicker="NEXT 14 DAYS"
          big={fmtCompact(currency, next14.sum)}
          sub={`${String(next14.count).padStart(2, '0')} CHARGES`}
          accent accentText={theme.accent} flat />
        <KPICard theme={theme} kicker={`${calFmtMonthShort(cursor.y, cursor.m)} ${cursor.y}`}
          big={fmtCompact(currency, monthSum)}
          sub="MONTH TOTAL" flat />
        <KPICard theme={theme} kicker="ACTIVE"
          big={String(active.length).padStart(2, '0')}
          sub="SUBS WATCHED" flat />
        <KPICard theme={theme} kicker="UNIQUE DAYS"
          big={String([...renewalMap.keys()].filter(k => {
            const d = new Date(k);
            return d.getMonth() === cursor.m && d.getFullYear() === cursor.y;
          }).length).padStart(2, '0')}
          sub="THIS MONTH" />
      </div>

      {/* Layout: left = upcoming list, right = month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28, alignItems: 'flex-start' }}>

        {/* Upcoming list */}
        <div style={{ borderTop: `1px solid ${theme.border}` }}>
          <div style={{ padding: '12px 0 10px', borderBottom: `1px solid ${theme.border}` }}>
            <Mono color={theme.text} size={10} tracking="0.18em">UP NEXT · 30 DAYS</Mono>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '20px 0', fontFamily: '"Fraunces", serif',
              fontSize: 14, fontStyle: 'italic', color: theme.textSubtle }}>
              Nothing on the horizon.
            </div>
          ) : upcoming.map((r, i) => {
            const d = new Date(r.key);
            const isSel = selected === r.key;
            return (
              <button key={i} onClick={() => { setSelected(r.key); onOpenSub && onOpenSub(r.sub); }}
                style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 6px',
                borderBottom: `1px solid ${theme.border}`,
                background: isSel ? theme.surface : 'transparent',
                textAlign: 'left', cursor: 'pointer', color: theme.text, border: 'none',
                borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme.border,
              }}>
                <div style={{ width: 40, textAlign: 'center', flexShrink: 0,
                  borderRight: `1px solid ${theme.border}`, paddingRight: 8 }}>
                  <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">
                    {d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Mono>
                  <div style={{ fontFamily: '"Fraunces", serif', fontSize: 18,
                    fontWeight: 600, letterSpacing: '-0.02em',
                    color: calIsSameDay(d, CAL_TODAY) ? theme.accent : theme.text,
                    fontVariantNumeric: 'tabular-nums' }}>
                    {String(d.getDate()).padStart(2, '0')}
                  </div>
                </div>
                <span style={{ width: 3, height: 28, background: calStampColor(r.sub) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 500,
                    letterSpacing: '-0.01em', color: theme.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.sub.merchant}
                  </div>
                  <Mono color={theme.textSubtle} size={8.5} tracking="0.14em">
                    {fmt(currency, r.sub.amountPKR)} · {r.sub.cycle === 'yearly' ? 'YEARLY' : 'MONTHLY'}
                  </Mono>
                </div>
              </button>
            );
          })}
        </div>

        {/* Month grid */}
        <div>
          {/* Week strip header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <Mono color={theme.text} size={10} tracking="0.18em">THE NEXT FORTNIGHT</Mono>
              <Mono color={theme.textSubtle} size={9} tracking="0.18em">29 JUN → 12 JUL · TAP A DAY</Mono>
            </div>
            <CalWeekStrip theme={theme} renewalMap={stripMap}
              onPickDay={(k) => setSelected(k)}
              selectedKey={selected} currency={currency} days={14} />
          </div>

          {/* Month grid title */}
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em' }}>
              {calFmtMonthYear(cursor.y, cursor.m)}.
            </div>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">MONTH OVERVIEW</Mono>
          </div>

          <CalMonthGrid theme={theme} year={cursor.y} month={cursor.m}
            renewalMap={renewalMap}
            onPickDay={(k) => setSelected(k)}
            selectedKey={selected} mode="desktop" />

          {/* Selected day detail (inline, desktop variant) */}
          {selected && (
            <div style={{ marginTop: 22, border: `1px solid ${theme.border}` }}>
              <CalDayDetail theme={theme} dayKey={selected}
                renewalMap={(renewalMap.has(selected) ? renewalMap : stripMap)}
                currency={currency}
                onOpenSub={onOpenSub} />
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">LEGEND · CATEGORY STAMPS</Mono>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
              {LumenData.CATEGORIES.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 2, background: c.swatch }} />
                  <Mono color={theme.textMuted} size={9} tracking="0.14em">
                    {c.label.toUpperCase()}
                  </Mono>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Expose
// ───────────────────────────────────────────────────────────────────────
Object.assign(window, {
  ScreenCalendar, DeskCalendar,
});
