import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ACCOUNTS, CATEGORIES } from '../../lib/seedData';
import { fmtMoney } from '../../lib/format';
import {
  parseQuery,
  searchSubs,
  type AccountOption,
  type PaletteFilters,
} from '../../lib/commandPaletteSearch';
import { useTheme } from '../../hooks/useTheme';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { useSubStore } from '../../store/subStore';
import { useUiStore } from '../../store/uiStore';
import type { Subscription, ThemeTokens, Verdict } from '../../types';
import { MerchantGlyph, Mono } from '../primitives';
import styles from './CommandPalette.module.css';

const RECENT_KEY = 'lumen.recentSearch';

function SearchGlyph({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M10.6 10.6L14 14" />
    </svg>
  );
}

function ClockGlyph({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4v3l2 1.5" />
    </svg>
  );
}

function usePaletteAccounts(): AccountOption[] {
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  return useMemo(() => {
    if (gmailAccounts.length > 0) {
      return gmailAccounts.map((a) => ({
        id: a.id,
        label: a.label ?? a.email.split('@')[0],
        email: a.email,
      }));
    }
    return ACCOUNTS.filter((a) => a.id !== 'all').map((a) => ({
      id: a.id,
      label: a.label,
      email: a.email,
    }));
  }, [gmailAccounts]);
}

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={[styles.chip, active && styles.chipActive, className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}

function FilterChipRail({
  theme,
  filters,
  setFilters,
  parsed,
  accounts,
}: {
  theme: ThemeTokens;
  filters: PaletteFilters;
  setFilters: React.Dispatch<React.SetStateAction<PaletteFilters>>;
  parsed: ReturnType<typeof parseQuery>;
  accounts: AccountOption[];
}) {
  const verdicts: { id: Verdict; label: string }[] = [
    { id: 'keep', label: 'KEEP' },
    { id: 'review', label: 'REVIEW' },
    { id: 'cancel', label: 'CANCEL' },
  ];
  const hasAmountFilter = parsed.minAmount != null || parsed.maxAmount != null;

  const cycleMailbox = () => {
    if (!filters.mailbox) {
      setFilters((f) => ({ ...f, mailbox: accounts[0]?.id ?? null }));
      return;
    }
    const i = accounts.findIndex((a) => a.id === filters.mailbox);
    const next = accounts[i + 1];
    setFilters((f) => ({ ...f, mailbox: next ? next.id : null }));
  };

  const cycleCategory = () => {
    if (!filters.category) {
      setFilters((f) => ({ ...f, category: CATEGORIES[0]?.id ?? null }));
      return;
    }
    const i = CATEGORIES.findIndex((c) => c.id === filters.category);
    const next = CATEGORIES[i + 1];
    setFilters((f) => ({ ...f, category: next ? next.id : null }));
  };

  const currentMailbox = accounts.find((a) => a.id === filters.mailbox);
  const currentCategory = CATEGORIES.find((c) => c.id === filters.category);

  return (
    <div className={styles.chipRail}>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em" style={{ marginRight: 4 }}>
        FILTERS
      </Mono>
      {verdicts.map((v) => (
        <Chip
          key={v.id}
          active={filters.verdict === v.id}
          onClick={() => setFilters((f) => ({ ...f, verdict: f.verdict === v.id ? null : v.id }))}
        >
          {v.label}
        </Chip>
      ))}
      <span className={styles.chipDivider} />
      <button
        type="button"
        onClick={cycleMailbox}
        className={[styles.chip, styles.chipWithDot, currentMailbox && styles.chipActive].filter(Boolean).join(' ')}
      >
        <span className={[styles.chipDot, currentMailbox && styles.chipDotActive].filter(Boolean).join(' ')} />
        {currentMailbox ? `MAILBOX · ${currentMailbox.label}` : 'MAILBOX'}
      </button>
      <button
        type="button"
        onClick={cycleCategory}
        className={[styles.chip, styles.chipWithDot, currentCategory && styles.chipActive].filter(Boolean).join(' ')}
      >
        <span className={[styles.chipDot, currentCategory && styles.chipDotActive].filter(Boolean).join(' ')} />
        {currentCategory ? `CATEGORY · ${currentCategory.label.toUpperCase()}` : 'CATEGORY'}
      </button>
      {hasAmountFilter && (
        <Chip active>
          {parsed.minAmount != null && parsed.maxAmount != null
            ? `Rs ${parsed.minAmount.toLocaleString()}–${parsed.maxAmount.toLocaleString()}`
            : parsed.minAmount != null
              ? `> Rs ${parsed.minAmount.toLocaleString()}`
              : `< Rs ${parsed.maxAmount!.toLocaleString()}`}
        </Chip>
      )}
    </div>
  );
}

function ResultRow({
  idx,
  selected,
  sub,
  theme,
  currency,
  onHover,
  onClick,
  accounts,
}: {
  idx: number;
  selected: boolean;
  sub: Subscription;
  theme: ThemeTokens;
  currency: 'PKR' | 'USD';
  onHover: () => void;
  onClick: () => void;
  accounts: AccountOption[];
}) {
  const account = accounts.find((a) => a.id === sub.account);
  const cat = CATEGORIES.find((c) => c.id === sub.category);
  const isYearly = sub.cycle === 'yearly';
  const verdictColor = sub.verdict === 'keep' ? theme.good : sub.verdict === 'review' ? theme.review : theme.accent;
  const isCancelled = sub.status === 'past' && sub.verdict === 'cancel';
  const amount = currency === 'USD' ? sub.amountUSD : sub.amountPKR;

  return (
    <div
      data-cp-idx={idx}
      onMouseEnter={onHover}
      onClick={onClick}
      className={[styles.resultRow, selected && styles.resultRowSelected].filter(Boolean).join(' ')}
    >
      <MerchantGlyph sub={sub} size={32} />
      <div style={{ minWidth: 0 }}>
        <div className={[styles.merchantName, isCancelled && styles.merchantCancelled].filter(Boolean).join(' ')}>
          {sub.merchant}
        </div>
        <div className={styles.merchantMeta}>
          {cat ? cat.label.toUpperCase() : '—'}
          {' · '}
          {account ? account.label.toUpperCase() : '—'}
          {sub.last4 ? `  ·  •••${sub.last4}` : ''}
        </div>
      </div>
      <div className={styles.amountCol}>
        <div className={styles.amount}>{fmtMoney(amount, currency)}</div>
        <div className={styles.cycle}>{isYearly ? '/YEAR' : '/MO'}</div>
      </div>
      <div className={styles.verdictTag} style={{ borderColor: verdictColor, color: verdictColor }}>
        {isCancelled ? 'CANCELLED' : sub.verdict}
      </div>
    </div>
  );
}

function FooterHint({ theme, k, label }: { theme: ThemeTokens; k: string; label: string }) {
  return (
    <div className={styles.footerHint}>
      <span className={styles.footerKey}>{k}</span>
      <Mono color={theme.textSubtle} size={9} tracking="0.18em">
        {label}
      </Mono>
    </div>
  );
}

export function SearchTriggerPill({
  theme,
  onClick,
  surface = 'mobile',
}: {
  theme: ThemeTokens;
  onClick: () => void;
  surface?: 'mobile' | 'desktop';
}) {
  if (surface === 'desktop') {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          padding: '6px 12px 6px 10px',
          cursor: 'pointer',
          color: theme.textMuted,
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        <SearchGlyph size={13} color={theme.textMuted} />
        SEARCH LEDGER
        <span style={{ border: `1px solid ${theme.border}`, padding: '1px 5px', fontSize: 8, marginLeft: 6, color: theme.textSubtle }}>
          ⌘K
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.searchTriggerMobile}
      style={{ borderColor: theme.border, color: theme.textMuted }}
    >
      <SearchGlyph size={12} color={theme.textMuted} />
      SEARCH ALL INBOXES
    </button>
  );
}

export function CommandPalette() {
  const theme = useTheme();
  const isDesktop = useIsDesktop();
  const open = useUiStore((s) => s.paletteOpen);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const currency = useUiStore((s) => s.currency);
  const allSubs = useSubStore((s) => s.subscriptions);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);
  const accounts = usePaletteAccounts();

  const [raw, setRaw] = useState('');
  const [filters, setFilters] = useState<PaletteFilters>({ verdict: null, mailbox: null, category: null });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseQuery(raw), [raw]);
  const results = useMemo(() => searchSubs(allSubs, raw, filters, accounts), [allSubs, raw, filters, accounts]);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (parsed.minAmount != null ? 1 : 0) +
    (parsed.maxAmount != null ? 1 : 0);

  useEffect(() => {
    if (open) {
      setRaw('');
      setFilters({ verdict: null, mailbox: null, category: null });
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [raw, filters]);

  const commit = useCallback(
    (sub: Subscription) => {
      const term = raw.trim();
      if (term) {
        setRecent((prev) => {
          const next = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        });
      }
      setPaletteOpen(false);
      setTimeout(() => {
        setOpenSubId(sub.id);
        if (isDesktop) {
          window.dispatchEvent(new CustomEvent('lumen:openSubPanel', { detail: { id: sub.id } }));
        }
      }, 60);
    },
    [raw, setOpenSubId, setPaletteOpen, isDesktop],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setPaletteOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const r = results[selectedIdx];
        if (r) commit(r);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIdx, commit, setPaletteOpen]);

  useEffect(() => {
    if (!listRef.current) return;
    const list = listRef.current;
    const el = list.querySelector(`[data-cp-idx="${selectedIdx}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    if (r.top < lr.top) list.scrollTop -= lr.top - r.top + 6;
    else if (r.bottom > lr.bottom) list.scrollTop += r.bottom - lr.bottom + 6;
  }, [selectedIdx]);

  if (!open) return null;

  const cssVars = {
    '--bg': theme.bg,
    '--surface': theme.surface,
    '--text': theme.text,
    '--text-muted': theme.textMuted,
    '--text-subtle': theme.textSubtle,
    '--border': theme.border,
    '--accent': theme.accent,
  } as CSSProperties;

  return (
    <div className={styles.overlay} style={cssVars} onClick={() => setPaletteOpen(false)} role="presentation">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search ledger">
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
              CROSS-INBOX SEARCH · {allSubs.length} ENTRIES
            </Mono>
            <Mono color={theme.textSubtle} size={9} tracking="0.18em">
              ESC · CLOSE
            </Mono>
          </div>
          <div className={styles.inputRow}>
            <SearchGlyph size={20} color={theme.accent} />
            <input
              ref={inputRef}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Search merchants, mailboxes, amounts…"
              className={[styles.input, raw && styles.inputFilled].filter(Boolean).join(' ')}
            />
            {raw && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  setRaw('');
                  inputRef.current?.focus();
                }}
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        <FilterChipRail theme={theme} filters={filters} setFilters={setFilters} parsed={parsed} accounts={accounts} />

        <div ref={listRef} className={styles.list}>
          {raw === '' && activeFilterCount === 0 && recent.length > 0 && (
            <div>
              <div className={styles.recentHeader}>
                <Mono color={theme.textSubtle} size={9} tracking="0.18em">
                  RECENT SEARCHES
                </Mono>
                <button
                  type="button"
                  className={styles.recentClear}
                  onClick={() => {
                    setRecent([]);
                    localStorage.removeItem(RECENT_KEY);
                  }}
                >
                  CLEAR
                </button>
              </div>
              {recent.map((t) => (
                <div key={t} className={styles.recentRow} onClick={() => setRaw(t)}>
                  <ClockGlyph size={12} color={theme.textSubtle} />
                  {t}
                </div>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyDash}>—</div>
              <div className={styles.emptyTitle}>{raw || activeFilterCount > 0 ? 'No matches in the ledger.' : 'Search begins here.'}</div>
              <Mono color={theme.textSubtle} size={10} tracking="0.16em" className={styles.emptyHint}>
                {raw || activeFilterCount > 0 ? 'TRY A BROADER TERM OR CLEAR FILTERS' : 'TYPE A MERCHANT, AMOUNT OR MAILBOX'}
              </Mono>
            </div>
          ) : (
            <div>
              <div className={styles.sectionLabel}>
                <Mono color={theme.textSubtle} size={9} tracking="0.18em">
                  RESULTS · {results.length}
                </Mono>
                <span className={styles.sectionRule} />
              </div>
              {results.map((s, i) => (
                <ResultRow
                  key={s.id}
                  idx={i}
                  selected={i === selectedIdx}
                  sub={s}
                  theme={theme}
                  currency={currency}
                  accounts={accounts}
                  onHover={() => setSelectedIdx(i)}
                  onClick={() => commit(s)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <FooterHint theme={theme} k="↑↓" label="MOVE" />
          <FooterHint theme={theme} k="↵" label="OPEN" />
          <FooterHint theme={theme} k="ESC" label="DISMISS" />
          <div className={styles.footerSpacer} />
          <Mono color={theme.textSubtle} size={9} tracking="0.18em">
            TRY · &quot;&gt; 2000&quot; · &quot;1000-5000&quot; · &quot;netflix&quot;
          </Mono>
        </div>
      </div>
    </div>
  );
}
