// Lumen — Sub-detail extras (session 7)
// PriceHistorySparkline: 6-month chart with annotated jump for subs with priceIncrease.
// SharedWith: avatar dot row + per-seat cost for family plans.
// Both render in Direction D's editorial grammar — hairlines, Fraunces numbers,
// JetBrains Mono labels, oxblood for the moment of change.

const { useMemo: _seMm } = React;

// ═══════════════════════════════════════════════════════════════════════
// PriceHistorySparkline — last 6 charges with the bump annotated
// Layout:
//   ┌─ kicker ────────────────── from → to · +% ──┐
//   │   svg chart with step line and oxblood     │
//   │   change marker; x-axis = month abbrevs    │
//   └────────────────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════════════
function PriceHistorySparkline({ theme, tweak, sub, width = 340 }) {
  if (!sub.priceIncrease) return null;

  // Build a 6-point series sampled from monthly history (newest last).
  // For yearly subs we synthesize 6 monthly samples bracketing the bump.
  const series = _seMm(() => buildPriceSeries(sub), [sub.id]);

  const sym = tweak.currency === 'USD' ? '$' : 'Rs ';
  const fmtPrice = (pkr) => {
    if (tweak.currency === 'USD') return '$' + (pkr / LumenData.FX).toFixed(2);
    return 'Rs ' + Math.round(pkr).toLocaleString();
  };
  const fromStr = fmtPrice(sub.priceIncrease.fromPKR);
  const toStr   = fmtPrice(sub.priceIncrease.toPKR);
  const pct = Math.round(((sub.priceIncrease.toPKR - sub.priceIncrease.fromPKR) / sub.priceIncrease.fromPKR) * 100);
  const bumpDate = new Date(sub.priceIncrease.date);
  const bumpLabel = bumpDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();

  // Chart geometry
  const W = width, H = 92;
  const padX = 10, padTop = 16, padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const min = Math.min(...series.map(s => s.pkr));
  const max = Math.max(...series.map(s => s.pkr));
  const range = max - min || 1;
  const step = innerW / (series.length - 1);

  const points = series.map((p, i) => ({
    x: padX + i * step,
    y: padTop + innerH - ((p.pkr - min) / range) * innerH,
    pkr: p.pkr,
    isAfterBump: p.isAfterBump,
    label: p.label,
  }));

  // Build a step path so the jump is visible as a vertical line
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1], cur = points[i];
    // Step at midpoint, except when the bump just happened — step on the actual bump point
    if (cur.isAfterBump && !prev.isAfterBump) {
      // Vertical jump at cur.x
      d += ` L ${cur.x},${prev.y} L ${cur.x},${cur.y}`;
    } else {
      // Horizontal hold then up/down to next
      const midX = (prev.x + cur.x) / 2;
      d += ` L ${midX},${prev.y} L ${midX},${cur.y} L ${cur.x},${cur.y}`;
    }
  }

  // Find the bump x for annotation
  const bumpIdx = points.findIndex(p => p.isAfterBump);
  const bumpX = bumpIdx > 0 ? points[bumpIdx].x : null;

  return (
    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">PRICE HISTORY · LAST 6 MONTHS</Mono>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.04em' }}>
          <span style={{ color: theme.textMuted, textDecoration: 'line-through',
            textDecorationColor: theme.textSubtle }}>{fromStr}</span>
          <span style={{ color: theme.textSubtle }}>→</span>
          <span style={{ color: theme.accent }}>{toStr}</span>
          <span style={{ color: theme.accent, paddingLeft: 4 }}>+{pct}%</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H + 4} preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible' }}>

        {/* baseline */}
        <line x1={padX} y1={padTop + innerH} x2={W - padX} y2={padTop + innerH}
          stroke={theme.border} strokeWidth="1" />

        {/* bump annotation — vertical hairline + label */}
        {bumpX != null && (
          <>
            <line x1={bumpX} y1={padTop - 4} x2={bumpX} y2={padTop + innerH}
              stroke={theme.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
          </>
        )}

        {/* step path */}
        <path d={d} fill="none" stroke={theme.text} strokeWidth="1.4"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.isAfterBump && (i === bumpIdx) ? 3.2 : 2.2}
            fill={p.isAfterBump ? theme.accent : theme.text} />
        ))}

        {/* x labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 6}
            textAnchor="middle"
            fontFamily='"JetBrains Mono", monospace'
            fontSize="8" fontWeight="600" letterSpacing="0.10em"
            fill={i === bumpIdx ? theme.accent : theme.textSubtle}>
            {p.label}
          </text>
        ))}

        {/* bump callout */}
        {bumpX != null && (() => {
          const cw = 64;
          const half = cw / 2;
          // Clamp horizontally so the box doesn't overflow the chart
          let cx = bumpX;
          if (cx + half > W - padX) cx = W - padX - half;
          if (cx - half < padX) cx = padX + half;
          return (
            <g>
              <rect x={cx - half} y={padTop - 14} width={cw} height="11"
                fill={theme.bg} stroke={theme.accent} strokeWidth="1" />
              <text x={cx} y={padTop - 6}
                textAnchor="middle"
                fontFamily='"JetBrains Mono", monospace'
                fontSize="7.5" fontWeight="600" letterSpacing="0.14em"
                fill={theme.accent}>
                {`+${pct}%  ${bumpLabel}`}
              </text>
            </g>
          );
        })()}
      </svg>

      <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
        fontSize: 13, color: theme.textMuted, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
        {priceQuote(sub, pct, fromStr, toStr)}
      </div>
    </div>
  );
}

// Build 6 evenly-spaced monthly price points around the bump
function buildPriceSeries(sub) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date('2026-06-29');
  const bump = new Date(sub.priceIncrease.date);
  const fromPKR = sub.priceIncrease.fromPKR;
  const toPKR = sub.priceIncrease.toPKR;
  // 6 points, ending on current month
  const series = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(1); // avoid month-end overflow (e.g. Jun 29 - 4mo → Feb 29 → Mar 01)
    d.setMonth(d.getMonth() - i);
    d.setDate(15);
    const afterBump = d >= bump;
    series.push({
      pkr: afterBump ? toPKR : fromPKR,
      label: months[d.getMonth()].toUpperCase().slice(0, 3),
      isAfterBump: afterBump,
    });
  }
  return series;
}

function priceQuote(sub, pct, fromStr, toStr) {
  return `${sub.merchant} held at ${fromStr} for months before the jump to ${toStr} — a ${pct}% step. ` +
         `Lumen logged the change from the renewal email.`;
}

// ═══════════════════════════════════════════════════════════════════════
// SharedWith — avatar dots for family / shared plans + per-seat cost line
// ═══════════════════════════════════════════════════════════════════════
function SharedWith({ theme, tweak, sub, compact }) {
  if (!sub.sharedWith) return null;
  const { plan, members, note } = sub.sharedWith;
  const activeSeats = members.filter(m => !m.empty).length;
  const monthly = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
  const perSeatPKR = monthly / Math.max(activeSeats, 1);
  const perSeatStr = tweak.currency === 'USD'
    ? '$' + (perSeatPKR / LumenData.FX).toFixed(2)
    : 'Rs ' + Math.round(perSeatPKR).toLocaleString();

  return (
    <div style={{ padding: compact ? '14px 22px' : '18px 24px',
      borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">SHARED WITH</Mono>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em">{plan.toUpperCase()}</Mono>
      </div>

      {/* Avatar row + cost */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {members.map((m, i) => (
            <SharedAvatar key={i} member={m} index={i} theme={theme} />
          ))}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18,
            color: theme.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {perSeatStr}
          </div>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em"
            style={{ marginTop: 4, display: 'block' }}>
            /SEAT · MO
          </Mono>
        </div>
      </div>

      {/* Detail row — names + seat status */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`,
        display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: m.empty ? 'transparent' : m.color,
              border: m.empty ? `1px dashed ${theme.textSubtle}` : 'none',
            }} />
            <Mono color={m.empty ? theme.textSubtle : (m.you ? theme.accent : theme.textMuted)}
              size={9} tracking="0.12em">
              {m.you ? `${m.label.toUpperCase()} (YOU)` : m.label.toUpperCase()}
            </Mono>
          </div>
        ))}
      </div>

      {/* Editorial note */}
      {note && (
        <div style={{ marginTop: 12, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
          fontSize: 13, color: theme.textMuted, lineHeight: 1.45, letterSpacing: '-0.005em' }}>
          {note}
        </div>
      )}
    </div>
  );
}

function SharedAvatar({ member, index, theme }) {
  const size = 30;
  const overlap = -8;
  const style = {
    width: size, height: size, borderRadius: '50%',
    border: `2px solid ${theme.bg}`,
    marginLeft: index === 0 ? 0 : overlap,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: member.empty ? 'transparent' : member.color,
    color: '#fff',
    fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 13,
    boxShadow: member.empty ? 'none' : `0 0 0 0.5px ${theme.borderHi}`,
    position: 'relative', zIndex: 10 - index,
  };
  if (member.empty) {
    return (
      <div style={{ ...style, border: `2px dashed ${theme.textSubtle}`, color: theme.textSubtle }}>
        <span style={{ fontSize: 14, fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 400, opacity: 0.7 }}>+</span>
      </div>
    );
  }
  return <div style={style}>{member.initial}</div>;
}

// ═══════════════════════════════════════════════════════════════════════
// CSV export — turn the active scope into a downloadable file.
// Triggered from DeskLedger and mobile ScreenSettings.
// ═══════════════════════════════════════════════════════════════════════
function exportSubsToCSV(subs, currency, filename) {
  const today = new Date('2026-06-29').toISOString().slice(0, 10);
  const header = [
    'merchant', 'category', 'status', 'verdict', 'cycle',
    'amount_pkr', 'amount_usd',
    `amount_${currency.toLowerCase()}`,
    'monthly_equivalent_pkr', 'yearly_equivalent_pkr',
    'card', 'last4', 'gmail_account', 'next_charge', 'since',
    'price_change', 'shared_seats', 'evidence',
  ];

  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const rows = subs.map(s => {
    const monthly = s.cycle === 'yearly' ? s.amountPKR / 12 : s.amountPKR;
    const yearly = s.cycle === 'yearly' ? s.amountPKR : s.amountPKR * 12;
    const acc = LumenData.ACCOUNTS.find(a => a.id === s.account);
    const priceChange = s.priceIncrease
      ? `Rs ${s.priceIncrease.fromPKR} -> Rs ${s.priceIncrease.toPKR} on ${s.priceIncrease.date}`
      : '';
    const shared = s.sharedWith
      ? `${s.sharedWith.members.filter(m => !m.empty).length} of ${s.sharedWith.members.length} seats — ${s.sharedWith.plan}`
      : '';
    return [
      s.merchant,
      LumenData.CATEGORIES.find(c => c.id === s.category)?.label || s.category,
      s.status,
      s.verdict,
      s.cycle,
      s.amountPKR,
      s.amountUSD,
      currency === 'USD' ? s.amountUSD : s.amountPKR,
      Math.round(monthly),
      Math.round(yearly),
      LumenData.CARD_KINDS[s.card]?.label || s.card,
      s.last4,
      acc?.email || acc?.label || s.account,
      s.nextCharge,
      s.since,
      priceChange,
      shared,
      s.evidence.join(' | '),
    ].map(escape).join(',');
  });

  // BOM so Excel reads UTF-8 correctly.
  const csv = '\ufeff' + header.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `lumen-ledger-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}

// Small toast component used by both surfaces.
function ExportToast({ open, theme, count }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 80, transform: 'translateX(-50%)',
      background: theme.text, color: theme.bg,
      padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      boxShadow: '0 14px 40px rgba(0,0,0,0.35)', zIndex: 200,
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      <svg width="11" height="11" viewBox="0 0 14 14">
        <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.6" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Exported {count} entries · CSV
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PriceJumpRow — editorial row + inline mini sparkline as evidence.
// Used in ScreenRecs (mobile) and DeskVerdicts (desktop) so the price
// increase reads as a piece of evidence, not a separate alert.
//
// Layout on mobile:
//   ┌─ merchant ──────────────── amount ──┐
//   │  "Used X of last 30 days."   /MO    │
//   │                              CANCEL │
//   ├─ mini sparkline (chart) ────────────┤
//   │  PRICE +20%   Rs1,499 → Rs1,800     │
//   │  ──╮          ┌─ +20% JUN 26 ─┐     │
//   │    │          │   ▔▔▔▔▔▔▔     │     │
//   │    ╰──────────╯               │     │
//   │  JAN  FEB  MAR  APR  MAY  JUN       │
//   └─────────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════════════
function PriceJumpRow({ sub, theme, tweak, onClick, first, verdict, mode = 'mobile' }) {
  const has = !!sub.priceIncrease;
  const isDesk = mode === 'desktop';
  const monthly = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
  const yearly = sub.cycle === 'yearly' ? sub.amountPKR : sub.amountPKR * 12;

  // Mobile: small chart inline. Desktop: medium chart in a side cell.
  return (
    <div onClick={onClick} style={{
      padding: isDesk ? '18px 0' : '14px 0',
      borderTop: first ? 'none' : `1px solid ${theme.border}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {/* Top row: merchant + amount + verdict — matches EditorialRow / DeskVerdictRow grammar */}
      {isDesk ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center' }}>
          <MerchantGlyph sub={sub} size={42} radius={2} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 19,
              letterSpacing: '-0.02em', color: theme.text, lineHeight: 1.1 }}>{sub.merchant}</div>
            <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
              fontSize: 14, color: theme.textMuted, lineHeight: 1.4, letterSpacing: '-0.005em',
              maxWidth: 600 }}>
              “{sub.evidence[0]}.”
              {sub.evidence[1] && <span style={{ color: theme.textSubtle }}> {sub.evidence[1]}.</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 20,
              letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>
              {fmt(tweak.currency, sub.cycle === 'yearly' ? yearly : monthly)}
            </div>
            <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 4, display: 'block' }}>
              /{sub.cycle === 'yearly' ? 'YR' : 'MO'} · RECLAIMABLE
            </Mono>
          </div>
          {verdict}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
              letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.15 }}>{sub.merchant}</div>
            <div style={{ marginTop: 3, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, color: theme.textSubtle, letterSpacing: '0.08em',
              textTransform: 'uppercase', lineHeight: 1.3 }}>
              {sub.evidence[0].toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18,
              letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>
              {fmt(tweak.currency, sub.amountPKR)}
            </div>
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
              <Mono color={theme.textSubtle} size={9} tracking="0.10em">
                /{sub.cycle === 'yearly' ? 'YR' : 'MO'}
              </Mono>
              {verdict}
            </div>
          </div>
        </div>
      )}

      {/* Inline mini sparkline strip — only when sub has priceIncrease */}
      {has && (
        <div style={{
          marginTop: isDesk ? 14 : 12,
          paddingTop: isDesk ? 14 : 10,
          borderTop: `1px dashed ${theme.border}`,
          display: 'grid',
          gridTemplateColumns: isDesk ? '180px 1fr' : '1fr',
          gap: isDesk ? 24 : 0,
          alignItems: 'center',
        }}>
          <div>
            <Mono color={theme.accent} size={9} tracking="0.18em">
              EVIDENCE · PRICE +{Math.round(((sub.priceIncrease.toPKR - sub.priceIncrease.fromPKR) / sub.priceIncrease.fromPKR) * 100)}%
            </Mono>
            <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'baseline', gap: 6,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.04em' }}>
              <span style={{ color: theme.textMuted, textDecoration: 'line-through',
                textDecorationColor: theme.textSubtle }}>
                {fmtPriceShort(sub.priceIncrease.fromPKR, tweak.currency)}
              </span>
              <span style={{ color: theme.textSubtle }}>→</span>
              <span style={{ color: theme.accent }}>
                {fmtPriceShort(sub.priceIncrease.toPKR, tweak.currency)}
              </span>
            </div>
            <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 6, display: 'block' }}>
              EFFECTIVE {fmtMonthShort(sub.priceIncrease.date)}
            </Mono>
          </div>
          <MiniSparkline sub={sub} theme={theme} width={isDesk ? 320 : 280} />
        </div>
      )}
    </div>
  );
}

// Compact sparkline for the recs row — same logic as PriceHistorySparkline
// but stripped of header/caption and tightly sized.
function MiniSparkline({ sub, theme, width = 280 }) {
  const series = _seMm(() => buildPriceSeries(sub), [sub.id]);

  const W = width, H = 56;
  const padX = 6, padTop = 12, padBottom = 16;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const min = Math.min(...series.map(s => s.pkr));
  const max = Math.max(...series.map(s => s.pkr));
  const range = max - min || 1;
  const step = innerW / (series.length - 1);

  const points = series.map((p, i) => ({
    x: padX + i * step,
    y: padTop + innerH - ((p.pkr - min) / range) * innerH,
    pkr: p.pkr,
    isAfterBump: p.isAfterBump,
    label: p.label,
  }));

  // Step path
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1], cur = points[i];
    if (cur.isAfterBump && !prev.isAfterBump) {
      d += ` L ${cur.x},${prev.y} L ${cur.x},${cur.y}`;
    } else {
      const midX = (prev.x + cur.x) / 2;
      d += ` L ${midX},${prev.y} L ${midX},${cur.y} L ${cur.x},${cur.y}`;
    }
  }

  const bumpIdx = points.findIndex(p => p.isAfterBump);
  const bumpX = bumpIdx > 0 ? points[bumpIdx].x : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}>
      {/* baseline */}
      <line x1={padX} y1={padTop + innerH} x2={W - padX} y2={padTop + innerH}
        stroke={theme.border} strokeWidth="1" />

      {/* bump vertical line */}
      {bumpX != null && (
        <line x1={bumpX} y1={padTop - 2} x2={bumpX} y2={padTop + innerH}
          stroke={theme.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
      )}

      {/* step path */}
      <path d={d} fill="none" stroke={theme.text} strokeWidth="1.4"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.isAfterBump && (i === bumpIdx) ? 2.8 : 1.8}
          fill={p.isAfterBump ? theme.accent : theme.text} />
      ))}

      {/* x labels — only first, bump, last to avoid crowding */}
      {points.map((p, i) => {
        const show = i === 0 || i === bumpIdx || i === points.length - 1;
        if (!show) return null;
        return (
          <text key={i} x={p.x} y={H - 3}
            textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
            fontFamily='"JetBrains Mono", monospace'
            fontSize="7.5" fontWeight="600" letterSpacing="0.10em"
            fill={i === bumpIdx ? theme.accent : theme.textSubtle}>
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

function fmtPriceShort(pkr, currency) {
  if (currency === 'USD') return '$' + (pkr / LumenData.FX).toFixed(2);
  return 'Rs ' + Math.round(pkr).toLocaleString();
}

function fmtMonthShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════
// VerdictHistory — timeline of when Lumen's verdict changed for a sub.
// Each event has: date, fromVerdict, toVerdict, headline, evidence[].
// Built deterministically from sub fields (priceIncrease, usage, status,
// since, sharedWith) so the story matches what's elsewhere on the page.
//
// Layout (editorial):
//   ┌──── kicker: VERDICT HISTORY · N CHANGES ────┐
//   │ ◉  21 MAR 2024                              │
//   │ │  ADDED → KEEP                             │
//   │ │  "First charge verified from Gmail."      │
//   │ │  ── EVIDENCE · 01 Receipt logged          │
//   │ ◉  12 JUN 2026                              │
//   │ │  KEEP → REVIEW                            │
//   │ │  "Price up 20% — Rs 1,499 → 1,800."       │
//   │ ...                                          │
//   └─────────────────────────────────────────────┘
// Oxblood node only on the most recent change; others use textSubtle.
// ═══════════════════════════════════════════════════════════════════════

// Format a date object as "12 JUN 2026"
function _vhDateStamp(d) {
  if (!(d instanceof Date)) d = new Date(d);
  const day = String(d.getDate()).padStart(2, '0');
  const mo = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yr = d.getFullYear();
  return `${day} ${mo} ${yr}`;
}

// Deterministic verdict-change log built from sub data.
// Returns events oldest-first. Always includes the initial "Added → Keep"
// event (dated from sub.since) and a current verdict reaffirmation as the
// last event. Intermediate events come from priceIncrease, usage drops,
// and (for cancelled subs) the cancellation moment.
function buildVerdictHistory(sub) {
  const events = [];
  const NOW = new Date('2026-06-29');

  // 01 — Added to the ledger when the first receipt landed.
  // sub.since is "YYYY-MM" — use the 15th as a stand-in for the first charge.
  const sinceParts = (sub.since || '2023-01').split('-');
  const addedDate = new Date(parseInt(sinceParts[0], 10), parseInt(sinceParts[1], 10) - 1, 15);
  events.push({
    date: addedDate,
    from: 'NEW',
    to: 'KEEP',
    headline: 'Added to the ledger.',
    detail: `First charge verified from ${sub.merchant} receipt.`,
    kind: 'added',
  });

  // 02 — Price increase, if logged.
  if (sub.priceIncrease) {
    const pct = Math.round(
      ((sub.priceIncrease.toPKR - sub.priceIncrease.fromPKR) / sub.priceIncrease.fromPKR) * 100
    );
    const fromTxt = 'Rs ' + sub.priceIncrease.fromPKR.toLocaleString();
    const toTxt = 'Rs ' + sub.priceIncrease.toPKR.toLocaleString();
    events.push({
      date: new Date(sub.priceIncrease.date),
      from: 'KEEP',
      to: sub.verdict === 'keep' ? 'KEEP' : 'REVIEW',
      headline: sub.verdict === 'keep'
        ? `Price up ${pct}% — kept on usage.`
        : `Price up ${pct}% — moved to review.`,
      detail: `${fromTxt} → ${toTxt}. Renewal email logged.`,
      kind: 'price',
    });
  }

  // 03 — Usage-driven shifts. Heuristic from sub.usage.sessionsLast30.
  // Triggered for review or cancel verdicts (incl. already-cancelled subs,
  // so the timeline tells the full story instead of jumping Keep→Cancelled).
  // For currently-cancelled subs we place this decision ~3 weeks back; for
  // already-filed (past) subs we place it further back so it precedes the
  // filing event.
  const sessions = (sub.usage && sub.usage.sessionsLast30) || 0;
  if ((sub.verdict === 'review' || sub.verdict === 'cancel') && sessions <= 8) {
    const daysBack = sub.status === 'past' ? 35 : 21;
    const d = new Date(NOW);
    d.setDate(d.getDate() - daysBack);
    events.push({
      date: d,
      from: 'KEEP',
      to: sub.verdict === 'cancel' ? 'CANCEL' : 'REVIEW',
      headline: sub.verdict === 'cancel'
        ? 'Usage collapsed — cancel suggested.'
        : 'Usage softening — flagged for review.',
      detail: `Used ${sessions} of last 30 days. Last session ${(sub.usage && sub.usage.lastUsed) || 'unknown'}.`,
      kind: 'usage',
    });
  }

  // 04 — Cancelled flow run.
  if (sub.status === 'past' && sub.verdict === 'cancel') {
    const d = new Date(NOW);
    d.setDate(d.getDate() - 9);
    events.push({
      date: d,
      from: 'CANCEL',
      to: 'CANCELLED',
      headline: 'You filed it as cancelled.',
      detail: 'No further renewals expected. Moved to past.',
      kind: 'filed',
    });
  }

  // Re-sort oldest-first and de-dupe back-to-back identical transitions.
  events.sort((a, b) => a.date - b.date);
  const cleaned = [];
  events.forEach(e => {
    const last = cleaned[cleaned.length - 1];
    if (last && last.to === e.to && last.kind === e.kind) return;
    cleaned.push(e);
  });
  return cleaned;
}

// Verdict colour token resolver (matches the rest of the app).
function _vhVerdictColor(theme, verdict) {
  const v = (verdict || '').toUpperCase();
  if (v === 'CANCEL' || v === 'CANCELLED') return theme.accent;
  if (v === 'REVIEW') return theme.semantic.review;
  if (v === 'KEEP') return theme.semantic.good;
  return theme.textSubtle;
}

function VerdictHistory({ theme, sub, compact }) {
  const events = _seMm(() => buildVerdictHistory(sub), [sub.id]);
  if (!events || events.length <= 1) return null; // nothing interesting to show

  const padX = compact ? 22 : 24;
  const lastIdx = events.length - 1;

  return (
    <div style={{
      padding: `18px ${padX}px 22px`,
      borderBottom: `1px solid ${theme.border}`,
    }}>
      {/* Kicker */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 14 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          VERDICT HISTORY · {String(events.length).padStart(2, '0')} EVENT{events.length === 1 ? '' : 'S'}
        </Mono>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em">BY LUMEN</Mono>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 22 }}>
        {/* Vertical hairline running through the nodes */}
        <span style={{
          position: 'absolute', left: 5.5, top: 8, bottom: 8,
          width: 1, background: theme.border,
        }} />

        {events.map((ev, i) => {
          const isLast = i === lastIdx;
          const nodeColor = isLast ? theme.accent : theme.textSubtle;
          const transitionColor = _vhVerdictColor(theme, ev.to);
          return (
            <div key={i} style={{ position: 'relative', paddingBottom: i === lastIdx ? 0 : 20 }}>
              {/* Node */}
              <span style={{
                position: 'absolute', left: -22, top: 4,
                width: 11, height: 11,
                borderRadius: isLast ? 0 : '50%', // square for current, dot for past
                background: isLast ? nodeColor : theme.bg,
                border: `1.5px solid ${nodeColor}`,
                boxSizing: 'border-box',
              }} />

              {/* Date */}
              <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
                {_vhDateStamp(ev.date)}
              </Mono>

              {/* Transition line: FROM → TO */}
              <div style={{
                marginTop: 6, display: 'flex', alignItems: 'center', gap: 9,
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.14em', color: theme.textSubtle,
                  padding: '3px 7px', border: `1px solid ${theme.border}`,
                }}>
                  {ev.from}
                </span>
                <svg width="14" height="9" viewBox="0 0 14 9" style={{ flexShrink: 0 }}>
                  <path d="M0 4.5h12M8 1l4 3.5L8 8" stroke={theme.textMuted}
                    strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.14em', color: transitionColor,
                  padding: '3px 7px', border: `1px solid ${transitionColor}`,
                }}>
                  {ev.to}
                </span>
              </div>

              {/* Headline (Fraunces) */}
              <div style={{
                marginTop: 8,
                fontFamily: '"Fraunces", serif', fontWeight: 600,
                fontSize: compact ? 15 : 15.5, letterSpacing: '-0.015em',
                lineHeight: 1.3, color: theme.text,
              }}>
                {ev.headline}
              </div>

              {/* Detail — italic, smaller, like an editorial caption */}
              <div style={{
                marginTop: 4,
                fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontWeight: 400,
                fontSize: 12.5, letterSpacing: '0', lineHeight: 1.4,
                color: theme.textMuted,
              }}>
                {ev.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  PriceHistorySparkline,
  SharedWith,
  exportSubsToCSV,
  ExportToast,
  PriceJumpRow,
  MiniSparkline,
  VerdictHistory,
  buildVerdictHistory,
});
