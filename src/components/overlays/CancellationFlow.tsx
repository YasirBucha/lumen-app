import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { fmt, monthlyEquivalent, splitMoney, yearlyEquivalent } from '../../lib/format';
import { useTheme } from '../../hooks/useTheme';
import { useSubStore } from '../../store/subStore';
import { useUiStore } from '../../store/uiStore';
import type { Subscription, ThemeTokens } from '../../types';
import { Mono, StatHero } from '../primitives';
import styles from './CancellationFlow.module.css';

type FlowIconName = 'check' | 'clock' | 'warn';

function cancelUrlFor(merchant: string): string {
  return `https://${merchant.toLowerCase().replace(/[^a-z]/g, '')}.com/account/cancel`;
}

function FlowIcon({ name }: { name: FlowIconName }) {
  const p = {
    width: 14,
    height: 14,
    viewBox: '0 0 14 14',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (name === 'check') {
    return (
      <svg {...p}>
        <path d="M2.5 7l3 3 6-6" />
      </svg>
    );
  }
  if (name === 'clock') {
    return (
      <svg {...p}>
        <circle cx="7" cy="7" r="5" />
        <path d="M7 4v3l2 1.5" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M7 2l5.5 10h-11L7 2z" />
      <path d="M7 6.5v2.5M7 10.7v0.1" />
    </svg>
  );
}

function FlowKicker({
  theme,
  step,
  total,
  label,
}: {
  theme: ThemeTokens;
  step: number;
  total: number;
  label: string;
}) {
  return (
    <div className={styles.kicker}>
      <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
        {label}
      </Mono>
      <div className={styles.stepBars}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={styles.stepBar}
            style={{ background: i < step ? theme.accent : theme.border }}
          />
        ))}
      </div>
    </div>
  );
}

function FlowActions({
  theme,
  primary,
  secondary,
}: {
  theme: ThemeTokens;
  primary?: { label: string; onClick: () => void; external?: boolean };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className={styles.actions}>
      {primary && (
        <button
          type="button"
          className={styles.primaryBtn}
          style={{ background: theme.accent, color: theme.accentInk }}
          onClick={primary.onClick}
        >
          {primary.label}
          {primary.external && (
            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M4 2h6v6M10 2L3 9"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
      {secondary && (
        <button
          type="button"
          className={styles.secondaryBtn}
          style={{ color: theme.textMuted }}
          onClick={secondary.onClick}
        >
          {secondary.label}
        </button>
      )}
    </div>
  );
}

function ChoiceRow({
  theme,
  title,
  sub,
  onClick,
  icon,
  accent,
}: {
  theme: ThemeTokens;
  title: string;
  sub: string;
  onClick: () => void;
  icon: FlowIconName;
  accent?: boolean;
}) {
  return (
    <div
      className={styles.choiceRow}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={`${styles.iconBox} ${accent ? styles.iconBoxAccent : ''}`}
        style={accent ? undefined : { color: theme.textMuted }}
      >
        <FlowIcon name={icon} />
      </div>
      <div>
        <div className={styles.choiceTitle} style={{ color: theme.text }}>
          {title}
        </div>
        <div className={styles.choiceSub} style={{ color: theme.textSubtle }}>
          {sub}
        </div>
      </div>
      <svg width="7" height="11" viewBox="0 0 8 12" aria-hidden>
        <path
          d="M1 1l5 5-5 5"
          stroke={theme.textMuted}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CancellationFlow() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const cancelSubId = useUiStore((s) => s.cancelSubId);
  const setCancelSubId = useUiStore((s) => s.setCancelSubId);
  const subscriptions = useSubStore((s) => s.subscriptions);
  const markCancelled = useSubStore((s) => s.markCancelled);
  const [step, setStep] = useState(1);

  const sub = cancelSubId ? subscriptions.find((s) => s.id === cancelSubId) : null;
  const open = !!cancelSubId && !!sub;

  useEffect(() => {
    if (open) setStep(1);
  }, [open, sub?.id]);

  if (!open || !sub) return null;

  const monthlyPKR = monthlyEquivalent(sub);
  const yearlyPKR = yearlyEquivalent(sub);
  const cancelUrl = cancelUrlFor(sub.merchant);
  const [ccy, monthlyNum] = splitMoney(currency, monthlyPKR);

  const handleClose = () => setCancelSubId(null);

  const handleConfirmCancelled = (_sub: Subscription) => {
    markCancelled(_sub.id);
  };

  const handleOpenLink = () => {
    window.open(cancelUrl, '_blank', 'noopener,noreferrer');
    setStep(2);
  };

  const cssVars = {
    '--bg': theme.bg,
    '--text': theme.text,
    '--border': theme.border,
    '--border-hi': theme.borderHi,
    '--surface': theme.surface,
    '--accent': theme.accent,
  } as CSSProperties;

  const step1 = (
    <>
      <FlowKicker theme={theme} step={1} total={3} label="CANCELLATION · STEP 01" />
      <div className={styles.headBlock} style={{ borderBottomColor: theme.border }}>
        <div className={styles.headline} style={{ color: theme.text }}>
          Cancel <em className={styles.italic} style={{ color: theme.accent }}>{sub.merchant}</em>.
        </div>
        <div className={styles.subhead}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            HERE IS WHAT WILL HAPPEN
          </Mono>
        </div>
      </div>

      <div className={styles.steps}>
        {[
          ['01', `Lumen will open ${sub.merchant}'s cancel page in a new tab.`],
          ['02', 'Follow their flow to confirm the cancellation.'],
          ['03', 'Come back here and tell us how it went.'],
        ].map(([n, line], i) => (
          <div
            key={n}
            className={`${styles.stepRow} ${i === 0 ? styles.stepRowFirst : ''}`}
            style={{ borderTopColor: theme.border }}
          >
            <Mono color={theme.accent} size={10} tracking="0.14em" className={styles.stepNum}>
              {n}
            </Mono>
            <span className={styles.stepText} style={{ color: theme.text }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.linkBox} style={{ borderColor: theme.border, background: theme.surface }}>
        <Mono color={theme.textSubtle} size={9} tracking="0.16em">
          CANCEL LINK
        </Mono>
        <div className={styles.linkUrl} style={{ color: theme.text }}>
          {cancelUrl}
        </div>
      </div>

      <div className={styles.reclaim}>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
          YOU RECLAIM
        </Mono>
        <div className={styles.reclaimGrid}>
          <div>
            <div className={styles.reclaimValue} style={{ color: theme.accent }}>
              {fmt(currency, monthlyPKR)}
            </div>
            <div className={styles.reclaimLabel} style={{ color: theme.textSubtle }}>
              PER MONTH
            </div>
          </div>
          <div className={styles.reclaimDivider} style={{ borderLeftColor: theme.border }}>
            <div className={styles.reclaimValue} style={{ color: theme.accent }}>
              {fmt(currency, yearlyPKR)}
            </div>
            <div className={styles.reclaimLabel} style={{ color: theme.textSubtle }}>
              PER YEAR
            </div>
          </div>
        </div>
      </div>

      <FlowActions
        theme={theme}
        primary={{ label: 'Open cancel link', onClick: handleOpenLink, external: true }}
        secondary={{ label: 'Not now', onClick: handleClose }}
      />
    </>
  );

  const step2 = (
    <>
      <FlowKicker theme={theme} step={2} total={3} label="CANCELLATION · STEP 02" />
      <div className={styles.headBlock} style={{ borderBottomColor: theme.border }}>
        <div className={styles.headline} style={{ color: theme.text }}>
          Did you <em className={styles.italic} style={{ color: theme.accent }}>cancel</em> it?
        </div>
        <div className={styles.subhead}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            LUMEN WILL UPDATE THE LEDGER ACCORDINGLY
          </Mono>
        </div>
      </div>

      <div className={styles.pullQuote} style={{ color: theme.text, borderBottomColor: theme.border }}>
        <div className={styles.quoteMark} style={{ color: theme.accent }}>
          "
        </div>
        We trust your word. If the renewal email returns next cycle, Lumen will quietly flip it back to
        active.
        <div className={styles.quoteBy} style={{ color: theme.textMuted }}>
          — BY LUMEN
        </div>
      </div>

      <div className={styles.choices}>
        <ChoiceRow
          theme={theme}
          accent
          title="Yes, cancelled"
          sub={`Mark ${sub.merchant} as past`}
          icon="check"
          onClick={() => {
            handleConfirmCancelled(sub);
            setStep(3);
          }}
        />
        <ChoiceRow
          theme={theme}
          title="Not yet"
          sub="Keep this as active, remind me"
          icon="clock"
          onClick={handleClose}
        />
        <ChoiceRow
          theme={theme}
          title="They wouldn't let me"
          sub="Mark for manual help"
          icon="warn"
          onClick={() => {
            handleConfirmCancelled(sub);
            setStep(3);
          }}
        />
      </div>

      <FlowActions theme={theme} secondary={{ label: 'Go back', onClick: () => setStep(1) }} />
    </>
  );

  const step3 = (
    <>
      <FlowKicker theme={theme} step={3} total={3} label="CANCELLATION · STEP 03" />
      <div className={styles.headBlock} style={{ borderBottomColor: theme.border }}>
        <div className={styles.headline} style={{ color: theme.text }}>
          Filed as <em className={styles.italic} style={{ color: theme.accent }}>cancelled</em>.
        </div>
        <div className={styles.subhead}>
          <Mono color={theme.textSubtle} size={9.5} tracking="0.16em">
            {sub.merchant.toUpperCase()} · MOVED TO PAST
          </Mono>
        </div>
      </div>

      <StatHero theme={theme} label="MONTHLY RECLAIMED" accent value={monthlyNum} ccy={ccy}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.14em">
          ≈ {fmt(currency, yearlyPKR)} / YEAR · {sub.cycle.toUpperCase()}
        </Mono>
      </StatHero>

      <div className={styles.proofSteps}>
        {[
          ['01', 'Removed from active subscriptions.'],
          ['02', 'Next charge cleared from the calendar.'],
          ['03', 'Lumen will watch for unexpected renewals.'],
        ].map(([n, line], i) => (
          <div
            key={n}
            className={`${styles.proofRow} ${i === 0 ? styles.proofRowFirst : ''}`}
            style={{ borderTopColor: theme.border }}
          >
            <Mono color={theme.good} size={10} tracking="0.14em" className={styles.stepNum}>
              {n}
            </Mono>
            <span className={styles.stepText} style={{ color: theme.text }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      <FlowActions theme={theme} primary={{ label: 'Back to the ledger', onClick: handleClose }} />
    </>
  );

  const body = step === 1 ? step1 : step === 2 ? step2 : step3;

  return (
    <div className={styles.overlay} style={cssVars} onClick={handleClose} role="presentation">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.handle}>
          <div className={styles.handleBar} />
        </div>
        {body}
      </div>
    </div>
  );
}
