// Lumen — Cross-mailbox command palette (⌘K / Ctrl+K)
// Mobile + desktop. Editorial styling: Fraunces hero query, hairline rows, mono labels.
//
// Supports:
//   - Free-form text search across merchants, categories, mailboxes
//   - Amount range queries: ">1000", "<500", "1000-5000"
//   - Filter chips: verdict (keep/review/cancel), mailbox, category
//   - Keyboard: ↑↓ select, Enter open, Esc close, Tab cycles chip
//   - Recent searches persisted to lumen.recentSearch
//
// Always searches across ALL mailboxes — that's the point: cross-mailbox discovery.

const { useState: _cpS, useEffect: _cpE, useMemo: _cpM, useRef: _cpR } = React;

// ─── Parse a free-form query into a structured filter ──────────────────
// "netflix > 1000" → { text: 'netflix', minAmount: 1000 }
// "streaming <2000" → { text: 'streaming', maxAmount: 2000 }
// "1000-5000 work" → { text: 'work', minAmount: 1000, maxAmount: 5000 }
function parseQuery(raw) {
  const out = { text: '', minAmount: null, maxAmount: null };
  if (!raw) return out;
  let s = raw;
  // range a-b
  const rangeMatch = s.match(/(\d{2,7})\s*[-–]\s*(\d{2,7})/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    out.minAmount = Math.min(a, b);
    out.maxAmount = Math.max(a, b);
    s = s.replace(rangeMatch[0], ' ');
  } else {
    const gt = s.match(/>\s*(\d{2,7})/);
    if (gt) { out.minAmount = Number(gt[1]); s = s.replace(gt[0], ' '); }
    const lt = s.match(/<\s*(\d{2,7})/);
    if (lt) { out.maxAmount = Number(lt[1]); s = s.replace(lt[0], ' '); }
  }
  out.text = s.trim().toLowerCase();
  return out;
}

// ─── Score one sub against the parsed query + filters ──────────────────
// Higher is better. 0 = no match.
function scoreSub(sub, parsed, filters) {
  // Filters (must pass)
  if (filters.verdict && sub.verdict !== filters.verdict) return 0;
  if (filters.mailbox && filters.mailbox !== 'all' && sub.account !== filters.mailbox) return 0;
  if (filters.category && sub.category !== filters.category) return 0;
  if (parsed.minAmount != null && sub.amountPKR < parsed.minAmount) return 0;
  if (parsed.maxAmount != null && sub.amountPKR > parsed.maxAmount) return 0;

  const q = parsed.text;
  if (!q) {
    // No text: rank by monthly amount so heavy hitters surface first
    const monthly = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
    return 1 + monthly / 1000;
  }

  let score = 0;
  const merchant = sub.merchant.toLowerCase();
  if (merchant === q) score += 100;
  else if (merchant.startsWith(q)) score += 60;
  else if (merchant.includes(q)) score += 40;

  // Category match
  const cat = (LumenData.CATEGORIES.find(c => c.id === sub.category) || {}).label || '';
  if (cat.toLowerCase().includes(q)) score += 18;

  // Mailbox match
  const acc = LumenData.ACCOUNTS.find(a => a.id === sub.account);
  if (acc) {
    if (acc.label.toLowerCase().includes(q)) score += 12;
    if (acc.email.toLowerCase().includes(q)) score += 10;
  }

  // Verdict match
  if (sub.verdict.toLowerCase().includes(q)) score += 8;

  // Card last4 match
  if (sub.last4 && sub.last4.includes(q)) score += 30;

  return score;
}

// ─── The palette overlay ───────────────────────────────────────────────
function CommandPalette({ open, theme, tweak, allSubs, onClose, onOpenSub, onSwitchMailbox, surface = 'desktop' }) {
  const [raw, setRaw] = _cpS('');
  const [filters, setFilters] = _cpS({ verdict: null, mailbox: null, category: null });
  const [selectedIdx, setSelectedIdx] = _cpS(0);
  const inputRef = _cpR(null);
  const listRef = _cpR(null);

  // Recent searches
  const [recent, setRecent] = _cpS(() => {
    try { return JSON.parse(localStorage.getItem('lumen.recentSearch') || '[]'); }
    catch { return []; }
  });

  // Focus + reset on open
  _cpE(() => {
    if (open) {
      setRaw('');
      setFilters({ verdict: null, mailbox: null, category: null });
      setSelectedIdx(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  const parsed = _cpM(() => parseQuery(raw), [raw]);

  const results = _cpM(() => {
    const scored = allSubs
      .map(s => ({ sub: s, score: scoreSub(s, parsed, filters) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
    return scored.map(x => x.sub);
  }, [allSubs, parsed, filters]);

  // Reset selected idx when results change
  _cpE(() => { setSelectedIdx(0); }, [raw, filters]);

  // Keyboard handling
  _cpE(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const r = results[selectedIdx];
        if (r) commit(r);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIdx]);

  // Scroll selected into view (manual — never scrollIntoView)
  _cpE(() => {
    if (!listRef.current) return;
    const list = listRef.current;
    const el = list.querySelector(`[data-cp-idx="${selectedIdx}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    if (r.top < lr.top) list.scrollTop -= (lr.top - r.top) + 6;
    else if (r.bottom > lr.bottom) list.scrollTop += (r.bottom - lr.bottom) + 6;
  }, [selectedIdx]);

  const commit = (sub) => {
    const term = raw.trim();
    if (term) {
      setRecent(prev => {
        const next = [term, ...prev.filter(t => t !== term)].slice(0, 5);
        localStorage.setItem('lumen.recentSearch', JSON.stringify(next));
        return next;
      });
    }
    onClose();
    setTimeout(() => onOpenSub && onOpenSub(sub), 60);
  };

  if (!open) return null;

  const isMobile = surface === 'mobile';

  // Color helpers
  const fmt = (v) => LumenData.fmtMoney(v, tweak.currency);
  const monthlyOf = (s) => s.cycle === 'yearly'
    ? (tweak.currency === 'USD' ? s.amountUSD : s.amountPKR) / 12
    : (tweak.currency === 'USD' ? s.amountUSD : s.amountPKR);

  // Active filter chip count for kicker
  const activeFilterCount = Object.values(filters).filter(Boolean).length
    + (parsed.minAmount != null ? 1 : 0)
    + (parsed.maxAmount != null ? 1 : 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(7, 12, 20, 0.62)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-start',
        justifyContent: 'center',
        paddingTop: isMobile ? 36 : 64,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? 'calc(100% - 28px)' : 640,
          maxHeight: isMobile ? '78%' : '74%',
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header — masthead style */}
        <div style={{
          padding: isMobile ? '14px 18px 0' : '18px 24px 0',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
              CROSS-INBOX SEARCH · {allSubs.length} ENTRIES
            </Mono>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">
              ESC · CLOSE
            </Mono>
          </div>

          {/* Fraunces hero input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14 }}>
            <SearchGlyph size={20} color={theme.accent} />
            <input
              ref={inputRef}
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder="Search merchants, mailboxes, amounts…"
              style={{
                flex: 1,
                background: 'transparent', border: 'none', outline: 'none',
                color: theme.text,
                fontFamily: '"Fraunces", serif',
                fontSize: isMobile ? 22 : 26,
                fontWeight: 500,
                fontStyle: raw ? 'normal' : 'italic',
                letterSpacing: '-0.02em',
                padding: '6px 0',
              }}
            />
            {raw && (
              <button
                onClick={() => { setRaw(''); inputRef.current && inputRef.current.focus(); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: theme.textMuted, fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10, letterSpacing: '0.16em', padding: '4px 6px',
                }}
              >CLEAR</button>
            )}
          </div>
        </div>

        {/* Filter chip rail */}
        <FilterChipRail theme={theme} filters={filters} setFilters={setFilters} parsed={parsed} />

        {/* Results / empty / recent */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto' }}>
          {raw === '' && activeFilterCount === 0 && recent.length > 0 && (
            <RecentSection theme={theme} recent={recent} onPick={t => setRaw(t)} onClear={() => {
              setRecent([]); localStorage.removeItem('lumen.recentSearch');
            }} />
          )}

          {results.length === 0 ? (
            <EmptyState theme={theme} hasQuery={!!raw || activeFilterCount > 0} />
          ) : (
            <div>
              <SectionLabel theme={theme}>RESULTS · {results.length}</SectionLabel>
              {results.map((s, i) => (
                <ResultRow
                  key={s.id}
                  idx={i}
                  selected={i === selectedIdx}
                  sub={s}
                  theme={theme}
                  tweak={tweak}
                  monthly={monthlyOf(s)}
                  fmt={fmt}
                  onHover={() => setSelectedIdx(i)}
                  onClick={() => commit(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint rail */}
        <div style={{
          borderTop: `1px solid ${theme.border}`,
          padding: '10px 22px',
          display: 'flex', gap: 18, alignItems: 'center',
          background: theme.surface,
        }}>
          <FooterHint theme={theme} k="↑↓" label="MOVE" />
          <FooterHint theme={theme} k="↵" label="OPEN" />
          <FooterHint theme={theme} k="ESC" label="DISMISS" />
          <div style={{ flex: 1 }} />
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">
            TRY · "&gt; 2000"  ·  "1000-5000"  ·  "netflix"
          </Mono>
        </div>
      </div>
    </div>
  );
}

// ─── Filter chip rail ──────────────────────────────────────────────────
function FilterChipRail({ theme, filters, setFilters, parsed }) {
  const verdicts = [
    { id: 'keep',   label: 'KEEP' },
    { id: 'review', label: 'REVIEW' },
    { id: 'cancel', label: 'CANCEL' },
  ];

  const hasAmountFilter = parsed.minAmount != null || parsed.maxAmount != null;

  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      padding: '10px 22px',
      borderBottom: `1px solid ${theme.border}`,
      background: theme.surface,
    }}>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ marginRight: 4 }}>FILTERS</Mono>

      {/* Verdict chips */}
      {verdicts.map(v => (
        <Chip key={v.id} theme={theme}
          active={filters.verdict === v.id}
          onClick={() => setFilters(f => ({ ...f, verdict: f.verdict === v.id ? null : v.id }))}
        >{v.label}</Chip>
      ))}

      <span style={{ width: 1, height: 12, background: theme.border, margin: '0 4px' }} />

      {/* Mailbox chip — cycles through accounts */}
      <MailboxChip theme={theme} value={filters.mailbox}
        onChange={mb => setFilters(f => ({ ...f, mailbox: mb }))} />

      {/* Category chip — cycles through categories */}
      <CategoryChip theme={theme} value={filters.category}
        onChange={cat => setFilters(f => ({ ...f, category: cat }))} />

      {/* Amount filter readout — set inline via the query, can clear here */}
      {hasAmountFilter && (
        <Chip theme={theme} active onClick={() => {/* readonly */}} dim>
          {parsed.minAmount != null && parsed.maxAmount != null
            ? `Rs ${parsed.minAmount.toLocaleString()}–${parsed.maxAmount.toLocaleString()}`
            : parsed.minAmount != null
              ? `> Rs ${parsed.minAmount.toLocaleString()}`
              : `< Rs ${parsed.maxAmount.toLocaleString()}`}
        </Chip>
      )}
    </div>
  );
}

function Chip({ theme, active, onClick, children, dim }) {
  return (
    <button onClick={onClick} style={{
      background: active ? theme.accent : 'transparent',
      color: active ? '#FFF' : theme.textMuted,
      border: `1px solid ${active ? theme.accent : theme.border}`,
      padding: '4px 9px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      opacity: dim ? 0.85 : 1,
    }}>{children}</button>
  );
}

function MailboxChip({ theme, value, onChange }) {
  const accounts = LumenData.ACCOUNTS.filter(a => a.id !== 'all');
  const current = accounts.find(a => a.id === value);

  const cycle = () => {
    if (!value) { onChange(accounts[0].id); return; }
    const i = accounts.findIndex(a => a.id === value);
    const next = accounts[i + 1];
    onChange(next ? next.id : null); // null cycles off
  };

  return (
    <button onClick={cycle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: current ? theme.accent : 'transparent',
      color: current ? '#FFF' : theme.textMuted,
      border: `1px solid ${current ? theme.accent : theme.border}`,
      padding: '4px 9px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', cursor: 'pointer',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%',
        background: current ? '#FFF' : theme.textSubtle }} />
      {current ? `MAILBOX · ${current.label}` : 'MAILBOX'}
    </button>
  );
}

function CategoryChip({ theme, value, onChange }) {
  const cats = LumenData.CATEGORIES;
  const current = cats.find(c => c.id === value);

  const cycle = () => {
    if (!value) { onChange(cats[0].id); return; }
    const i = cats.findIndex(c => c.id === value);
    const next = cats[i + 1];
    onChange(next ? next.id : null);
  };

  return (
    <button onClick={cycle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: current ? theme.accent : 'transparent',
      color: current ? '#FFF' : theme.textMuted,
      border: `1px solid ${current ? theme.accent : theme.border}`,
      padding: '4px 9px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', cursor: 'pointer',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%',
        background: current ? '#FFF' : (current ? current.swatch : theme.textSubtle) }} />
      {current ? `CATEGORY · ${current.label.toUpperCase()}` : 'CATEGORY'}
    </button>
  );
}

// ─── Result row ────────────────────────────────────────────────────────
function ResultRow({ idx, selected, sub, theme, tweak, monthly, fmt, onHover, onClick }) {
  const account = LumenData.ACCOUNTS.find(a => a.id === sub.account);
  const cat = LumenData.CATEGORIES.find(c => c.id === sub.category);
  const isYearly = sub.cycle === 'yearly';
  const verdictColor = sub.verdict === 'keep'
    ? theme.semantic.good
    : sub.verdict === 'review' ? theme.semantic.review : theme.accent;
  const isCancelled = sub.status === 'past' && sub.verdict === 'cancel';

  return (
    <div
      data-cp-idx={idx}
      onMouseEnter={onHover}
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto auto',
        gap: 14, alignItems: 'center',
        padding: '12px 22px',
        borderBottom: `1px solid ${theme.border}`,
        background: selected ? theme.surface : 'transparent',
        borderLeft: `2px solid ${selected ? theme.accent : 'transparent'}`,
        cursor: 'pointer',
      }}
    >
      {/* Merchant glyph */}
      <MerchantGlyph glyph={sub.glyph} bg={sub.glyphBg} size={32} />

      {/* Merchant + meta */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em',
          color: theme.text,
          textDecoration: isCancelled ? 'line-through' : 'none',
          textDecorationColor: theme.accent,
        }}>{sub.merchant}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9, fontWeight: 500, letterSpacing: '0.12em',
          color: theme.textSubtle, textTransform: 'uppercase',
          marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {cat ? cat.label.toUpperCase() : '—'}
          {' · '}
          {account ? account.label.toUpperCase() : '—'}
          {sub.last4 ? `  ·  •••${sub.last4}` : ''}
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em',
          color: theme.text, fontVariantNumeric: 'tabular-nums',
        }}>{fmt(tweak.currency === 'USD' ? sub.amountUSD : sub.amountPKR)}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 8.5, letterSpacing: '0.14em',
          color: theme.textSubtle, textTransform: 'uppercase', marginTop: 2,
        }}>{isYearly ? '/YEAR' : '/MO'}</div>
      </div>

      {/* Verdict tag */}
      <div style={{
        border: `1px solid ${verdictColor}`,
        color: verdictColor,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', padding: '3px 7px',
      }}>
        {isCancelled ? 'CANCELLED' : sub.verdict}
      </div>
    </div>
  );
}

// ─── Recent / empty / section label / footer hint ──────────────────────
function RecentSection({ theme, recent, onPick, onClear }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 22px 4px' }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.18em">RECENT SEARCHES</Mono>
        <button onClick={onClear} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: theme.textMuted, fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9, letterSpacing: '0.16em', padding: 0,
        }}>CLEAR</button>
      </div>
      {recent.map(t => (
        <div key={t} onClick={() => onPick(t)} style={{
          padding: '10px 22px',
          borderBottom: `1px solid ${theme.border}`,
          fontFamily: '"Fraunces", serif',
          fontSize: 15, fontStyle: 'italic', fontWeight: 500,
          color: theme.textMuted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <ClockGlyph size={12} color={theme.textSubtle} />
          {t}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ theme, hasQuery }) {
  return (
    <div style={{ padding: '32px 22px', textAlign: 'center' }}>
      <div style={{
        fontFamily: '"Fraunces", serif', fontSize: 26, fontStyle: 'italic',
        color: theme.accent, letterSpacing: '-0.03em', marginBottom: 6,
      }}>—</div>
      <div style={{
        fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 600,
        color: theme.text, letterSpacing: '-0.02em',
      }}>
        {hasQuery ? 'No matches in the ledger.' : 'Search begins here.'}
      </div>
      <Mono color={theme.textSubtle} size={10} tracking="0.16em" style={{ marginTop: 8, display: 'block' }}>
        {hasQuery ? 'TRY A BROADER TERM OR CLEAR FILTERS' : 'TYPE A MERCHANT, AMOUNT OR MAILBOX'}
      </Mono>
    </div>
  );
}

function SectionLabel({ theme, children }) {
  return (
    <div style={{
      padding: '10px 22px 6px',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em">{children}</Mono>
      <span style={{ flex: 1, height: 1, background: theme.border }} />
    </div>
  );
}

function FooterHint({ theme, k, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        border: `1px solid ${theme.border}`,
        padding: '2px 6px',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9, color: theme.textMuted,
        minWidth: 16, textAlign: 'center',
      }}>{k}</span>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em">{label}</Mono>
    </div>
  );
}

// ─── Glyphs ────────────────────────────────────────────────────────────
function SearchGlyph({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M10.6 10.6L14 14" />
    </svg>
  );
}

function ClockGlyph({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
      stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4v3l2 1.5" />
    </svg>
  );
}

// ─── Search-trigger button (used by mobile dashboard / desktop header) ─
function SearchTriggerPill({ theme, onClick, surface = 'mobile' }) {
  if (surface === 'desktop') {
    return (
      <button onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: theme.surface, border: `1px solid ${theme.border}`,
        padding: '6px 12px 6px 10px',
        cursor: 'pointer', color: theme.textMuted,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        <SearchGlyph size={13} color={theme.textMuted} />
        SEARCH LEDGER
        <span style={{
          border: `1px solid ${theme.border}`,
          padding: '1px 5px',
          fontSize: 8, marginLeft: 6, color: theme.textSubtle,
        }}>⌘K</span>
      </button>
    );
  }
  // mobile pill
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'transparent', border: `1px solid ${theme.border}`,
      padding: '7px 11px', cursor: 'pointer', color: theme.textMuted,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
    }}>
      <SearchGlyph size={12} color={theme.textMuted} />
      SEARCH ALL INBOXES
    </button>
  );
}

Object.assign(window, {
  CommandPalette, SearchTriggerPill,
});
