// Shared UI primitives for Lumen — Direction D · Editorial + Stats
const { useState, useEffect, useMemo, useRef } = React;

// ── Logo: "Lumen" — editorial wordmark, Fraunces with italic dot ──────
function LumenLogo({ size = 22, color, accent }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline',
      fontFamily: '"Fraunces", serif',
      fontWeight: 800, fontSize: size, letterSpacing: '-0.035em', color, lineHeight: 1 }}>
      <span>Lumen</span>
      <span style={{ color: accent, fontStyle: 'italic', fontWeight: 400 }}>.</span>
    </div>
  );
}

// ── Big number — Fraunces serif, tabular, super tight tracking ────────
function BigNumber({ children, size = 56, color, weight = 700, sub, ccy }) {
  return (
    <div style={{ fontFamily: '"Fraunces", serif',
      fontWeight: weight, fontSize: size, lineHeight: 0.95, letterSpacing: '-0.045em',
      fontVariantNumeric: 'tabular-nums', color, display: 'flex', alignItems: 'baseline', gap: 8 }}>
      {ccy && <span style={{ fontFamily: '"JetBrains Mono", monospace',
        fontSize: size * 0.28, fontWeight: 500, letterSpacing: '0.04em', opacity: 0.62 }}>{ccy}</span>}
      {children}
      {sub && <span style={{ fontFamily: '"JetBrains Mono", monospace',
        fontSize: size * 0.24, fontWeight: 500, letterSpacing: '0.04em', opacity: 0.62 }}>{sub}</span>}
    </div>
  );
}

// ── Mono caption ──────────────────────────────────────────────────────
function Mono({ children, color, size = 10, style = {}, weight = 600, tracking = '0.16em' }) {
  return (
    <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: size, letterSpacing: tracking, textTransform: 'uppercase', color, fontWeight: weight,
      ...style }}>{children}</span>
  );
}

// ── Masthead — Fraunces title with optional italic accent word ─────────
function Masthead({ children, italic, accent, theme, size = 32 }) {
  return (
    <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 900,
      fontSize: size, lineHeight: 1, letterSpacing: '-0.025em', color: theme.text }}>
      {children}
      {italic && (
        <span style={{ fontStyle: 'italic', fontWeight: 400, color: accent || theme.accent }}> {italic}</span>
      )}
      <span style={{ fontStyle: 'italic', fontWeight: 400, color: accent || theme.accent }}>.</span>
    </div>
  );
}

// ── Editorial header (sits at top of every screen) ─────────────────────
function ScreenHead({ theme, kicker, rightKicker, masthead, italic, meta }) {
  return (
    <div style={{ padding: '8px 24px 18px', borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.16em">{kicker}</Mono>
        {rightKicker && <Mono color={theme.textMuted} size={9.5} tracking="0.16em">{rightKicker}</Mono>}
      </div>
      <Masthead theme={theme} italic={italic} size={30}>{masthead}</Masthead>
      {meta && <div style={{ marginTop: 8 }}><Mono color={theme.textSubtle} size={9.5} tracking="0.12em">{meta}</Mono></div>}
    </div>
  );
}

// ── Stat hero — one big serif KPI, with hairline tick mark and label ───
function StatHero({ theme, label, value, ccy, accent, children }) {
  return (
    <div style={{ padding: '22px 24px 24px', borderBottom: `1px solid ${theme.border}`,
      position: 'relative' }}>
      <span style={{ position: 'absolute', top: 26, left: 24, width: 18, height: 1.5,
        background: theme.accent, display: 'block' }} />
      <div style={{ paddingLeft: 26 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{label}</Mono>
      </div>
      <div style={{ marginTop: 10 }}>
        <BigNumber size={60} color={accent ? theme.accent : theme.text} ccy={ccy}>{value}</BigNumber>
      </div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}

// ── Stat strip — 3 cells divided by hairlines ──────────────────────────
function StatStrip({ theme, cells }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
      borderBottom: `1px solid ${theme.border}` }}>
      {cells.map((c, i) => (
        <div key={i} style={{ padding: '14px 16px 16px',
          borderRight: i < cells.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">{c.k}</Mono>
          <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 600,
            fontSize: 22, letterSpacing: '-0.025em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: c.accent ? theme.accent : theme.text }}>{c.v}</div>
          {c.s && <div style={{ marginTop: 5, fontSize: 10.5, color: theme.textMuted, lineHeight: 1.3 }}>{c.s}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Stat pair — 2 cells, larger numbers ───────────────────────────────
function StatPair({ theme, cells }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderBottom: `1px solid ${theme.border}` }}>
      {cells.map((c, i) => (
        <div key={i} style={{ padding: '16px 24px 18px',
          borderRight: i === 0 ? `1px solid ${theme.border}` : 'none' }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">{c.k}</Mono>
          <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontWeight: 600,
            fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: c.accent ? theme.accent : theme.text }}>{c.v}</div>
          {c.s && <div style={{ marginTop: 6, fontSize: 11, color: theme.textMuted, lineHeight: 1.3 }}>{c.s}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Editorial section (hairline-divided rows) ─────────────────────────
function Section({ theme, kicker, action, children, noBorder, padding = '18px 24px' }) {
  return (
    <div style={{ padding, borderBottom: noBorder ? 'none' : `1px solid ${theme.border}` }}>
      {(kicker || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{kicker}</Mono>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Editorial row — name (serif) · meta (mono) · amount (serif) ───────
function EditorialRow({ name, meta, amount, sub, theme, onClick, verdict, first }) {
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, padding: '12px 0',
      borderTop: first ? 'none' : `1px solid ${theme.border}`,
      alignItems: 'center', cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
          letterSpacing: '-0.015em', color: theme.text, lineHeight: 1.15 }}>{name}</div>
        {meta && <div style={{ marginTop: 3, fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, color: theme.textSubtle, letterSpacing: '0.08em',
          textTransform: 'uppercase', lineHeight: 1.3 }}>{meta}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18,
          letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: theme.text }}>{amount}</div>
        {(sub || verdict) && (
          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
            {sub && <Mono color={theme.textSubtle} size={9} tracking="0.10em">{sub}</Mono>}
            {verdict}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Verdict tag — bordered rectangle, mono caps (NO rounded pill) ─────
function VerdictTag({ verdict, tone, theme }) {
  const colorMap = {
    keep:   { color: theme.semantic.good,   label: 'KEEP' },
    review: { color: theme.semantic.review, label: 'REVIEW' },
    cancel: { color: theme.semantic.cancel, label: tone === 'confident' ? 'CANCEL' : 'CANCEL' },
  };
  const v = colorMap[verdict] || colorMap.keep;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', padding: '3px 6px',
      border: `1px solid ${v.color}`, color: v.color, lineHeight: 1,
    }}>{v.label}</span>
  );
}

// VerdictPill kept as alias (back-compat — uses tag)
function VerdictPill(props) { return <VerdictTag {...props} />; }

// ── Pull quote — Fraunces italic with oxblood quote mark ──────────────
function PullQuote({ theme, by, children }) {
  return (
    <div style={{ padding: '22px 24px', borderBottom: `1px solid ${theme.border}`,
      fontFamily: '"Fraunces", serif', fontStyle: 'italic',
      fontSize: 19, lineHeight: 1.35, letterSpacing: '-0.015em', color: theme.text }}>
      <div style={{ fontFamily: '"Fraunces", serif', fontSize: 44, lineHeight: 0.5,
        color: theme.accent, marginBottom: 14, fontStyle: 'normal', fontWeight: 700 }}>“</div>
      {children}
      {by && (
        <div style={{ marginTop: 14, fontFamily: '"JetBrains Mono", monospace',
          fontStyle: 'normal', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.18em',
          color: theme.textMuted, textTransform: 'uppercase' }}>
          — {by}
        </div>
      )}
    </div>
  );
}

// ── Group head — "03 Consider cancelling · PRIORITY" ──────────────────
function GroupHead({ num, title, sub, theme }) {
  return (
    <div style={{ padding: '18px 24px 10px', display: 'flex',
      alignItems: 'baseline', gap: 12, fontFamily: '"Fraunces", serif' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: theme.accent,
        letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{num}</div>
      <div style={{ fontStyle: 'italic', fontSize: 18, fontWeight: 400,
        letterSpacing: '-0.01em', color: theme.text }}>{title}</div>
      <div style={{ marginLeft: 'auto' }}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">{sub}</Mono>
      </div>
    </div>
  );
}

// ── Editorial tab row (hairline underline on active) ──────────────────
function TabRow({ theme, tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 18, padding: '14px 24px',
      borderBottom: `1px solid ${theme.border}` }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <span key={t.id} onClick={() => onChange(t.id)} style={{
            fontFamily: '"Inter Tight", sans-serif', fontWeight: 600, fontSize: 12.5,
            letterSpacing: '-0.01em', color: on ? theme.text : theme.textMuted,
            paddingBottom: 4, borderBottom: on ? `2px solid ${theme.accent}` : 'none',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: 5,
          }}>
            {t.label}
            <span style={{ fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, color: theme.textSubtle, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums' }}>{String(t.count).padStart(2, '0')}</span>
          </span>
        );
      })}
    </div>
  );
}

// ── Merchant glyph — bold square (kept; needed by sub-detail) ─────────
function MerchantGlyph({ sub, size = 44, radius = 4 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius,
      background: sub.glyphBg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fraunces", serif',
      fontWeight: 800, fontSize: size * 0.48, letterSpacing: '-0.04em',
      flexShrink: 0 }}>
      {sub.glyph}
    </div>
  );
}

// ── Card chip art (simplified for editorial) ──────────────────────────
function CardChip({ kind, last4, theme, size = 'sm' }) {
  const k = LumenData.CARD_KINDS[kind] || LumenData.CARD_KINDS.visa;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: size === 'sm' ? 10 : 12, fontWeight: 500,
      color: theme ? theme.textMuted : 'currentColor',
      letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      <span style={{ width: 14, height: 9, borderRadius: 1,
        background: `linear-gradient(135deg, ${k.tint[0]}, ${k.tint[1]})`,
        display: 'inline-block', flexShrink: 0 }} />
      {k.label}·{last4}
    </span>
  );
}

// ── Category dot ──────────────────────────────────────────────────────
function CategoryDot({ id, size = 8 }) {
  const c = LumenData.CATEGORIES.find(c => c.id === id);
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: c ? c.swatch : '#888' }} />;
}

// ── Editorial sparkline (thin, accent-colored line, no fill) ──────────
function Sparkline({ values, width = 80, height = 24, color, fill = false }) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => [i * step, height - ((v - min) / range) * height]);
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={color} opacity={0.14} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2.5} fill={color} />
    </svg>
  );
}

// ── Section header (kept for back-compat) ─────────────────────────────
function SectionHeader({ kicker, title, action, theme, padding = '0 24px' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding }}>
      <div>
        {kicker && <div style={{ marginBottom: 6 }}><Mono color={theme.textMuted} size={9.5} tracking="0.18em">{kicker}</Mono></div>}
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 700,
          letterSpacing: '-0.025em', color: theme.text }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

// ── Date helpers ──────────────────────────────────────────────────────
function daysUntil(iso) {
  const today = new Date('2026-06-29');
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
function fmtDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

Object.assign(window, {
  LumenLogo, BigNumber, Mono, Masthead, ScreenHead,
  StatHero, StatStrip, StatPair, Section, EditorialRow,
  VerdictTag, VerdictPill, PullQuote, GroupHead, TabRow,
  MerchantGlyph, CardChip, CategoryDot,
  Sparkline, SectionHeader,
  daysUntil, fmtDateShort, fmtDateLong,
});
