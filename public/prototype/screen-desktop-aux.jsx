// Desktop views — Shape / Mailroom / Office / SubPanel
const { useState: _das, useMemo: _dam, useEffect: _dae } = React;

// ═══════════════════════════════════════════════════════════════════════
// DeskShape — spending patterns
// ═══════════════════════════════════════════════════════════════════════
function DeskShape({ theme, tweak, subs }) {
  const trend = _dam(() => LumenData.buildTrend(subs), [subs]);
  const monthly = subs.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = subs.reduce((a, s) => a + yearlyEquivalent(s), 0);

  const max = Math.max(...trend.map(t => t.pkr));
  const min = Math.min(...trend.map(t => t.pkr));
  const volatility = max > 0 ? Math.round(((max - min) / max) * 100) : 0;
  const avg = trend.reduce((a, t) => a + t.pkr, 0) / trend.length;

  const catTotals = LumenData.CATEGORIES.map(c => ({
    ...c, total: subs.filter(s => s.category === c.id).reduce((a, s) => a + monthlyEquivalent(s), 0),
    count: subs.filter(s => s.category === c.id).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const catGrand = catTotals.reduce((a, c) => a + c.total, 0) || 1;

  const cardTotals = Object.entries(LumenData.CARD_KINDS).map(([id, k]) => ({
    id, label: k.label,
    total: subs.filter(s => s.card === id).reduce((a, s) => a + monthlyEquivalent(s), 0),
    count: subs.filter(s => s.card === id).length,
    last4: subs.find(s => s.card === id)?.last4 || '••••',
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const cardGrand = cardTotals.reduce((a, c) => a + c.total, 0) || 1;

  return (
    <div style={{ padding: '32px 36px' }}>
      <DeskMasthead theme={theme}
        kicker="ANALYSIS · LAST 12 MONTHS"
        rightKicker="MONTHLY OUTFLOW · CATEGORY · METHOD"
        masthead="Spending"
        italic="shape"
      />

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 18,
        borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <KPICard theme={theme} kicker="MONTHLY" big={fmt(tweak.currency, monthly)} sub="AT CADENCE" accent flat />
        <KPICard theme={theme} kicker="ANNUALIZED" big={fmt(tweak.currency, yearly)} sub="COMMITMENT" flat />
        <KPICard theme={theme} kicker="12-MO AVERAGE" big={fmt(tweak.currency, avg)} sub="ACTUAL OUTFLOW" flat />
        <KPICard theme={theme} kicker="VOLATILITY" big={`${volatility}%`} sub="PEAK VS. TROUGH" flat />
      </div>

      {/* Big trend bars */}
      <div style={{ marginTop: 22, padding: '22px 24px 18px', border: `1px solid ${theme.border}`, background: theme.surface }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <Mono color={theme.textMuted} size={9.5} tracking="0.18em">MONTHLY OUTFLOW · JUL 2025 — JUN 2026</Mono>
            <div style={{ marginTop: 6, fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 700,
              letterSpacing: '-0.025em', color: theme.text }}>The shape of the year.</div>
          </div>
          <Mono color={theme.accent} size={10} tracking="0.18em">▲ PEAK · {fmt(tweak.currency, max)}</Mono>
        </div>
        <DeskBarChart trend={trend} theme={theme} currency={tweak.currency} />
      </div>

      {/* Two-col: category donut + payment bars */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <DeskCard theme={theme} kicker="BY CATEGORY" title="Where it goes">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 14 }}>
            <Donut totals={catTotals} grand={catGrand}
              center={fmtCompact(tweak.currency, monthly)} subLabel="/MONTH" theme={theme} size={160} />
            <div style={{ flex: 1 }}>
              {catTotals.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.swatch }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 500, color: theme.text, letterSpacing: '-0.01em' }}>{c.label}</div>
                    <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ marginTop: 2, display: 'block' }}>
                      {c.count} {c.count === 1 ? 'SUB' : 'SUBS'}
                    </Mono>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: '"Fraunces", serif', fontSize: 14, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{fmt(tweak.currency, c.total)}</div>
                    <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ marginTop: 2, display: 'block' }}>
                      {Math.round(c.total / catGrand * 100)}%
                    </Mono>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DeskCard>

        <DeskCard theme={theme} kicker="BY PAYMENT METHOD" title="Which card carries it">
          <div style={{ marginTop: 14 }}>
            {cardTotals.map((c, i) => (
              <div key={c.id} style={{ padding: '14px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CardChip kind={c.id} last4={c.last4} theme={theme} />
                    <Mono color={theme.textSubtle} size={9} tracking="0.10em">{c.count} {c.count === 1 ? 'SUB' : 'SUBS'}</Mono>
                  </div>
                  <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
                    color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
                    {fmt(tweak.currency, c.total)}<span style={{ fontSize: 10, color: theme.textMuted, marginLeft: 4,
                      fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, letterSpacing: '0.08em' }}>/MO</span>
                  </span>
                </div>
                <div style={{ height: 3, background: theme.border, position: 'relative' }}>
                  <div style={{ width: `${(c.total / cardGrand) * 100}%`, height: '100%',
                    background: theme.accent }} />
                </div>
                <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ marginTop: 6, display: 'block' }}>
                  {Math.round(c.total / cardGrand * 100)}% OF CARDED OUTFLOW
                </Mono>
              </div>
            ))}
          </div>
        </DeskCard>
      </div>

      {/* Annualized commitment */}
      <div style={{ marginTop: 22, padding: '24px 24px 26px', borderTop: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">ANNUALIZED COMMITMENT</Mono>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <BigNumber size={64} color={theme.text}
            ccy={tweak.currency === 'USD' ? '$' : 'Rs'}>
            {splitMoney(tweak.currency, yearly)[1]}
          </BigNumber>
          <div style={{ maxWidth: 420, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 15, color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
            Based on currently active subscriptions billed at their stated cadence. No estimates, no projections.
          </div>
        </div>
      </div>
    </div>
  );
}

// Larger editorial bar chart for desktop
function DeskBarChart({ trend, theme, currency }) {
  const max = Math.max(...trend.map(t => t.pkr));
  const min = Math.min(...trend.map(t => t.pkr));
  const h = 200;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: h,
        borderBottom: `1px solid ${theme.border}` }}>
        {trend.map((t, i) => {
          const pct = ((t.pkr - min) / (max - min || 1));
          const bh = 18 + pct * (h - 22);
          const peak = t.pkr === max;
          return (
            <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              {peak && (
                <span style={{ position: 'absolute', top: 0,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: theme.accent,
                  fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  ▲ {LumenData.fmtMoney(t.pkr / (currency === 'USD' ? LumenData.FX : 1), currency)}
                </span>
              )}
              <div style={{
                width: '100%', height: bh,
                background: peak ? theme.accent : (theme.themeName === 'dark' ? 'rgba(242,234,214,0.32)' : 'rgba(26,39,56,0.32)'),
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        {trend.map((t, i) => (
          <Mono key={i} color={t.pkr === Math.max(...trend.map(x => x.pkr)) ? theme.accent : theme.textSubtle}
            size={9.5} tracking="0.10em" style={{ flex: 1, textAlign: 'center' }}>
            {t.month}
          </Mono>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskMailroom — connected mailboxes
// ═══════════════════════════════════════════════════════════════════════
function DeskMailroom({ theme, tweak, subs, onConnect }) {
  const accounts = LumenData.ACCOUNTS.filter(a => a.id !== 'all');
  const totalDetected = subs.length;
  const activeDetected = subs.filter(s => s.status === 'active').length;

  return (
    <div style={{ padding: '32px 36px' }}>
      <DeskMasthead theme={theme}
        kicker="CONNECTED INBOXES"
        rightKicker={`${accounts.length} MAILBOXES · ONE SIGN-IN`}
        masthead="The"
        italic="mailroom"
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 18,
        borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <KPICard theme={theme} kicker="INBOXES" big={String(accounts.length).padStart(2, '0')} sub="ALL SYNCED" accent flat />
        <KPICard theme={theme} kicker="SUBS DETECTED" big={String(totalDetected).padStart(2, '0')} sub={`${activeDetected} ACTIVE · ${totalDetected - activeDetected} CLOSED`} flat />
        <KPICard theme={theme} kicker="LAST SCAN" big="2 hrs" sub="MONDAY · 29 JUN 2026" flat />
      </div>

      {/* Mailbox rows */}
      <div style={{ marginTop: 22 }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">ALL MAILBOXES</Mono>
        <div style={{ marginTop: 14, borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}` }}>
          {accounts.map((a, i) => {
            const count = subs.filter(s => s.account === a.id && s.status === 'active').length;
            const monthly = subs.filter(s => s.account === a.id && s.status === 'active').reduce((x, s) => x + monthlyEquivalent(s), 0);
            return (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: 22, padding: '20px 6px', alignItems: 'center',
                borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <AccountAvatar acc={a} size={44} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 19,
                    letterSpacing: '-0.02em', color: theme.text, lineHeight: 1.1 }}>{a.label}</div>
                  <Mono color={theme.textMuted} size={9.5} tracking="0.10em" style={{ marginTop: 6, display: 'block' }}>
                    {a.email}
                  </Mono>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17,
                    color: theme.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {String(count).padStart(2, '0')}
                  </div>
                  <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 3, display: 'block' }}>SUBS</Mono>
                </div>
                <div style={{ textAlign: 'right', minWidth: 110 }}>
                  <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17,
                    color: theme.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(tweak.currency, monthly)}
                  </div>
                  <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 3, display: 'block' }}>/MONTH</Mono>
                </div>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.16em',
                  textTransform: 'uppercase', padding: '4px 8px',
                  border: `1px solid ${theme.semantic.good}`, color: theme.semantic.good,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.semantic.good }} />
                  SYNCED
                </span>
              </div>
            );
          })}
        </div>

        {/* Connect another */}
        <div onClick={onConnect} style={{ marginTop: 18, border: `1px dashed ${theme.borderHi}`,
          padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
          background: 'transparent' }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 22,
            letterSpacing: '-0.025em', color: theme.text }}>
            Connect another <span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>Gmail</span>
          </div>
          <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 14, color: theme.textMuted, letterSpacing: '-0.005em' }}>
            Lumen reads receipts read-only. Nothing is sent. Nothing is stored beyond your ledger.
          </div>
        </div>

        {/* Editorial hint */}
        <div style={{ marginTop: 26, padding: '0 0 8px' }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">A NOTE FROM LUMEN</Mono>
          <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 16, color: theme.textMuted, lineHeight: 1.5, letterSpacing: '-0.005em',
            maxWidth: 620 }}>
            Adding another mailbox merges its subscriptions into the same ledger. Cards, categories, and verdicts
            stay attached to their inbox of origin — switch context any time from the rail above.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskOffice — settings
// ═══════════════════════════════════════════════════════════════════════
function DeskOffice({ theme, tweak, setTweak, subs }) {
  const [exportCount, setExportCount] = _das(0);
  _dae(() => {
    if (!exportCount) return;
    const t = setTimeout(() => setExportCount(0), 2400);
    return () => clearTimeout(t);
  }, [exportCount]);
  const onExport = () => {
    const count = exportSubsToCSV(subs || [], tweak.currency);
    setExportCount(count);
  };
  return (
    <div style={{ padding: '32px 36px' }}>
      <DeskMasthead theme={theme}
        kicker="PREFERENCES · DATA · LEGAL"
        rightKicker="LUMEN · VOL. III"
        masthead="The"
        italic="office"
      />

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        borderTop: `1px solid ${theme.border}` }}>
        <SettingsColumn theme={theme} title="Display & data">
          <SettingsRow theme={theme} title="Currency" caption="ALL FIGURES CONVERTED ON RENDER">
            <DeskSegmented theme={theme} value={tweak.currency} onChange={v => setTweak('currency', v)}
              options={[{ id: 'PKR', label: 'PKR' }, { id: 'USD', label: 'USD' }]} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Theme" caption="EDITORIAL · INK NAVY OR NEWSPRINT">
            <DeskSegmented theme={theme} value={tweak.theme} onChange={v => setTweak('theme', v)}
              options={[{ id: 'dark', label: 'Dark' }, { id: 'light', label: 'Light' }]} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Density" caption="BREATHE OR PACK">
            <DeskSegmented theme={theme} value={tweak.density} onChange={v => setTweak('density', v)}
              options={[{ id: 'airy', label: 'Airy' }, { id: 'compact', label: 'Compact' }]} />
          </SettingsRow>
        </SettingsColumn>

        <SettingsColumn theme={theme} title="AI verdicts">
          <SettingsRow theme={theme} title="Tone" caption="HOW LUMEN SPEAKS">
            <DeskSelect theme={theme} value={tweak.aiTone} onChange={v => setTweak('aiTone', v)}
              options={[
                { id: 'quiet',          label: 'Quiet · evidence' },
                { id: 'confident',      label: 'Confident · verdicts' },
                { id: 'conversational', label: 'Conversational' },
              ]} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Scenario" caption="SAMPLE DATA FOR PROTOTYPE">
            <DeskSegmented theme={theme} value={tweak.scenario} onChange={v => setTweak('scenario', v)}
              options={[{ id: 'light', label: 'Light' }, { id: 'heavy', label: 'Power' }]} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Email scan schedule" caption="DAILY · 06:00 LOCAL">
            <DeskToggle theme={theme} value={true} />
          </SettingsRow>
        </SettingsColumn>

        <SettingsColumn theme={theme} title="Notifications">
          <SettingsRow theme={theme} title="Renewal alerts" caption="3 DAYS BEFORE CHARGE">
            <DeskToggle theme={theme} value={true} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Price increases" caption="ANY CHANGE OVER 5%">
            <DeskToggle theme={theme} value={true} />
          </SettingsRow>
          <SettingsRow theme={theme} title="Weekly digest" caption="MONDAYS · SUMMARY EMAIL">
            <DeskToggle theme={theme} value={false} />
          </SettingsRow>
        </SettingsColumn>

        <SettingsColumn theme={theme} title="Data & privacy">
          <SettingsRow theme={theme} title="Export ledger" caption="CSV · ALL ENTRIES">
            <DeskActionBtn theme={theme} onClick={onExport}>Download</DeskActionBtn>
          </SettingsRow>
          <SettingsRow theme={theme} title="Read-only access" caption="GMAIL · READ-ONLY · NO STORAGE">
            <Mono color={theme.semantic.good} size={9.5} tracking="0.16em">VERIFIED</Mono>
          </SettingsRow>
          <SettingsRow theme={theme} title="Sign out everywhere" caption="REVOKES ALL DEVICES">
            <DeskActionBtn theme={theme} accent>Sign out</DeskActionBtn>
          </SettingsRow>
        </SettingsColumn>
      </div>

      {/* Colophon */}
      <div style={{ marginTop: 36, padding: '24px 0 12px', borderTop: `1px solid ${theme.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">COLOPHON</Mono>
          <div style={{ marginTop: 10, fontFamily: '"Fraunces", serif', fontStyle: 'italic',
            fontSize: 15, color: theme.textMuted, lineHeight: 1.5, maxWidth: 540, letterSpacing: '-0.005em' }}>
            Lumen is set in Fraunces and Inter Tight, with JetBrains Mono for marginalia. Built for the careful reader of their own ledger.
          </div>
        </div>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">VOL. III · ISSUE 01</Mono>
      </div>

      <ExportToast open={exportCount > 0} theme={theme} count={exportCount} />
    </div>
  );
}

function SettingsColumn({ theme, title, children }) {
  return (
    <div style={{ padding: '22px 24px 24px', borderRight: `1px solid ${theme.border}`,
      borderBottom: `1px solid ${theme.border}` }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">{title}</Mono>
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

function SettingsRow({ theme, title, caption, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderTop: `1px solid ${theme.border}`, gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16,
          letterSpacing: '-0.015em', color: theme.text }}>{title}</div>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em" style={{ marginTop: 3, display: 'block' }}>{caption}</Mono>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function DeskSegmented({ theme, value, onChange, options }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${theme.border}` }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '6px 12px', border: 'none', cursor: 'pointer',
          background: value === o.id ? theme.text : 'transparent',
          color: value === o.id ? theme.inverse : theme.textMuted,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function DeskSelect({ theme, value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: 'transparent', border: `1px solid ${theme.border}`,
      padding: '7px 28px 7px 10px', cursor: 'pointer',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
      letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.text,
      appearance: 'none', outline: 'none',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M1 3l3 3 3-3' stroke='${encodeURIComponent(theme.textMuted)}' fill='none' stroke-width='1.4'/></svg>")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
      backgroundSize: '8px',
    }}>
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}

function DeskToggle({ theme, value }) {
  // Visual-only oxblood square toggle (matches mobile settings)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 36, height: 16, border: `1px solid ${theme.border}`, position: 'relative',
        background: value ? theme.accent : 'transparent' }}>
        <span style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 10, height: 10,
          background: value ? theme.bg : theme.textMuted, transition: 'left 0.15s' }} />
      </span>
      <Mono color={value ? theme.text : theme.textSubtle} size={9} tracking="0.16em">
        {value ? 'ON' : 'OFF'}
      </Mono>
    </div>
  );
}

function DeskActionBtn({ theme, children, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      border: `1px solid ${accent ? theme.accent : theme.borderHi}`,
      color: accent ? theme.accent : theme.text,
      padding: '7px 14px', cursor: 'pointer',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, fontWeight: 600,
      letterSpacing: '0.16em', textTransform: 'uppercase',
    }}>{children}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DeskSubPanel — sliding right side panel for sub detail
// ═══════════════════════════════════════════════════════════════════════
function DeskSubPanel({ sub, theme, tweak, onClose, onCancel }) {
  const open = !!sub;
  const [renderedSub, setRenderedSub] = _das(sub);
  _dae(() => { if (sub) setRenderedSub(sub); }, [sub]);
  // Keep last sub in DOM during close animation
  const s = sub || renderedSub;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.22s ease', zIndex: 40,
      }} />
      {/* Panel */}
      <aside style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 460,
        background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
        borderLeft: `1px solid ${theme.borderHi}`,
        boxShadow: '-40px 0 80px rgba(0,0,0,0.35)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        zIndex: 50, overflowY: 'auto',
      }}>
        {s && <DeskSubPanelBody sub={s} theme={theme} tweak={tweak} onClose={onClose} onCancel={onCancel} />}
      </aside>
    </>
  );
}

function DeskSubPanelBody({ sub, theme, tweak, onClose, onCancel }) {
  const tone = tweak.aiTone;
  const account = LumenData.ACCOUNTS.find(a => a.id === sub.account);
  const monthly = monthlyEquivalent(sub);
  const yearly = yearlyEquivalent(sub);
  const d = daysUntil(sub.nextCharge);
  const [ccy, num] = splitMoney(tweak.currency, sub.cycle === 'yearly' ? yearly : monthly);
  const isCancelled = sub.status === 'past' && sub.verdict === 'cancel';

  return (
    <>
      {/* Header */}
      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">FILE NO. {sub.id.toUpperCase()}</Mono>
        <button onClick={onClose} style={{
          width: 28, height: 28, border: `1px solid ${theme.border}`,
          background: 'transparent', color: theme.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14">
            <path d="M3 3l8 8M11 3l-8 8" stroke={theme.text} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Masthead */}
      <div style={{ padding: '20px 22px', borderBottom: `1px solid ${theme.border}`,
        opacity: isCancelled ? 0.85 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <MerchantGlyph sub={sub} size={52} radius={2} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 800,
              fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1,
              color: isCancelled ? theme.textMuted : theme.text }}>
              {sub.merchant}<span style={{ color: theme.accent, fontStyle: 'italic', fontWeight: 400 }}>.</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Mono color={theme.textMuted} size={9} tracking="0.14em">
                SINCE {sub.since.toUpperCase()} · {(account.email || account.label).toUpperCase()}
              </Mono>
            </div>
          </div>
        </div>
        {isCancelled && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CancelledStamp theme={theme} size="md" />
            <Mono color={theme.textSubtle} size={9} tracking="0.16em">
              MOVED TO PAST · NO RENEWAL
            </Mono>
          </div>
        )}
      </div>

      {/* Hero price */}
      <div style={{ padding: '22px 22px 24px', borderBottom: `1px solid ${theme.border}`, position: 'relative' }}>
        <span style={{ position: 'absolute', top: 26, left: 22, width: 18, height: 1.5,
          background: isCancelled ? theme.textSubtle : theme.accent }} />
        <div style={{ paddingLeft: 26 }}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
            {isCancelled ? 'WAS ' : ''}{sub.cycle === 'yearly' ? 'PER YEAR' : 'PER MONTH'}
          </Mono>
        </div>
        <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
          <BigNumber size={52} color={isCancelled ? theme.textMuted : theme.text} ccy={ccy}>{num}</BigNumber>
          {isCancelled && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: '52%',
              height: 1.5, background: theme.accent, transform: 'rotate(-3deg)' }} />
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <Mono color={isCancelled ? theme.textSubtle : theme.textMuted} size={9.5} tracking="0.14em">
            {isCancelled
              ? <>RECLAIMED · {fmt(tweak.currency, yearly)} / YEAR</>
              : <>≈ {fmt(tweak.currency, sub.cycle === 'yearly' ? monthly : yearly)} / {sub.cycle === 'yearly' ? 'MONTH' : 'YEAR'}</>}
          </Mono>
        </div>
      </div>

      {/* Stat pair */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ padding: '16px 22px 18px', borderRight: `1px solid ${theme.border}` }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">NEXT CHARGE</Mono>
          <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 600,
            fontSize: 24, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            color: d <= 3 ? theme.accent : theme.text }}>{fmtDateShort(sub.nextCharge)}</div>
          <div style={{ marginTop: 6, fontSize: 11, color: theme.textMuted, lineHeight: 1.3 }}>
            {d === 0 ? 'today' : d === 1 ? 'tomorrow' : d < 0 ? `${-d} days ago` : `in ${d} days`}
          </div>
        </div>
        <div style={{ padding: '16px 22px 18px' }}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">VERDICT</Mono>
          <div style={{ marginTop: 8, fontFamily: '"Fraunces", serif', fontWeight: 600,
            fontSize: 24, letterSpacing: '-0.03em', lineHeight: 1,
            color: sub.verdict !== 'keep' ? theme.accent : theme.text }}>
            {sub.verdict === 'cancel' ? 'Cancel' : sub.verdict === 'review' ? 'Review' : 'Keep'}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: theme.textMuted, lineHeight: 1.3 }}>
            {tone === 'quiet' ? 'evidence-based' : tone === 'confident' ? 'with confidence' : 'with care'}
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <PullQuote theme={theme} by={`Lumen verdict · ${tone}`}>
        {panelVerdictLine(sub, tone)}
      </PullQuote>

      {/* Price history sparkline */}
      {sub.priceIncrease && <PriceHistorySparkline theme={theme} tweak={tweak} sub={sub} width={416} />}

      {/* Shared-with row */}
      {sub.sharedWith && <SharedWith theme={theme} tweak={tweak} sub={sub} compact />}

      {/* Evidence */}
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">THE EVIDENCE</Mono>
        <div style={{ marginTop: 12 }}>
          {sub.evidence.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                fontWeight: 500, color: theme.textSubtle, letterSpacing: '0.12em',
                minWidth: 24, paddingTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14.5,
                color: theme.text, lineHeight: 1.45, letterSpacing: '-0.005em' }}>{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified tags */}
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">VERIFIED TAGS</Mono>
        <div style={{ marginTop: 8 }}>
          <PanelTagRow theme={theme} label="Payment method" first>
            <CardChip kind={sub.card} last4={sub.last4} theme={theme} />
          </PanelTagRow>
          <PanelTagRow theme={theme} label="Category">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CategoryDot id={sub.category} />
              <Mono color={theme.text} size={10} tracking="0.10em">
                {LumenData.CATEGORIES.find(c => c.id === sub.category)?.label}
              </Mono>
            </div>
          </PanelTagRow>
          <PanelTagRow theme={theme} label="Gmail">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <AccountAvatar acc={account} size={14} />
              <Mono color={theme.text} size={10} tracking="0.08em">{account.email || account.label}</Mono>
            </div>
          </PanelTagRow>
        </div>
      </div>

      {/* History */}
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">TRANSACTION HISTORY · LAST {sub.history.length}</Mono>
        <div style={{ marginTop: 10 }}>
          {sub.history.map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center',
              padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.semantic.good }} />
              <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 500, fontSize: 14,
                color: theme.text, letterSpacing: '-0.01em' }}>{fmtDateShort(h.date)}</span>
              <Mono color={theme.textSubtle} size={9} tracking="0.16em">VERIFIED</Mono>
              <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 15,
                color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>
                {fmt(tweak.currency, h.pkr)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verdict-change history timeline */}
      <VerdictHistory theme={theme} sub={sub} compact />

      {/* Actions */}
      <div style={{ padding: '20px 22px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isCancelled ? (
          <>
            <div style={{
              height: 46, border: `1px solid ${theme.border}`, background: 'transparent',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              color: theme.textMuted,
            }}>
              <svg width="11" height="11" viewBox="0 0 14 14">
                <path d="M3 7l3 3 5-6" stroke={theme.semantic.good} strokeWidth="1.6"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filed as cancelled
            </div>
            <button onClick={onClose} style={{
              height: 36, border: 'none', background: 'transparent', color: theme.textMuted,
              fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>
              Back to the ledger
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onCancel && onCancel(sub)} style={{
              height: 46, border: `1px solid ${theme.borderHi}`,
              background: sub.verdict === 'cancel' ? theme.accent : 'transparent',
              color: sub.verdict === 'cancel' ? '#fff' : theme.text,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              Open cancel link
              <svg width="11" height="11" viewBox="0 0 12 12">
                <path d="M4 2h6v6M10 2L3 9" stroke={sub.verdict === 'cancel' ? '#fff' : theme.text} strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => onCancel && onCancel(sub)} style={{
              height: 36, border: 'none', background: 'transparent', color: theme.textMuted,
              fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>
              Mark as cancelled manually
            </button>
          </>
        )}
      </div>
    </>
  );
}

function PanelTagRow({ theme, label, children, first }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderTop: first ? 'none' : `1px solid ${theme.border}` }}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.16em">{label}</Mono>
      <div>{children}</div>
    </div>
  );
}

function panelVerdictLine(s, tone) {
  if (tone === 'conversational') {
    if (s.verdict === 'keep') return `Looks like ${s.merchant} earns its keep.`;
    if (s.verdict === 'review') return `${s.merchant} is borderline — worth a closer look.`;
    return `${s.merchant} isn't earning its renewal anymore.`;
  }
  if (tone === 'confident') {
    if (s.verdict === 'keep') return `Keep ${s.merchant}.`;
    if (s.verdict === 'review') return `Review ${s.merchant}.`;
    return `Cancel ${s.merchant}.`;
  }
  if (s.verdict === 'keep') return `Usage and pricing support keeping this active.`;
  if (s.verdict === 'review') return `Usage is uneven against the price.`;
  return `Usage has dropped well below the renewal cost.`;
}

Object.assign(window, {
  DeskShape, DeskMailroom, DeskOffice, DeskSubPanel,
  DeskBarChart, SettingsColumn, SettingsRow,
  DeskSegmented, DeskSelect, DeskToggle, DeskActionBtn,
  PanelTagRow,
});
