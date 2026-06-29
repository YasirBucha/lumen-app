import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { useTheme } from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { Mono } from '../primitives';
import { TOUR_SPREADS } from './onboardingTourData';
import styles from './OnboardingTour.module.css';

interface OnboardingTourProps {
  forceOpen?: boolean;
}

export function OnboardingTour({ forceOpen = false }: OnboardingTourProps) {
  const theme = useTheme();
  const tourDone = useUiStore((s) => s.tourDone);
  const setTourDone = useUiStore((s) => s.setTourDone);
  const isDesktop = useIsDesktop();
  const surface = isDesktop ? 'desktop' : 'mobile';

  const [idx, setIdx] = useState(0);

  if (!forceOpen && tourDone) return null;

  const close = () => {
    setTourDone(true);
    localStorage.setItem('lumen.tourDone', 'true');
  };

  const next = () => {
    if (idx >= TOUR_SPREADS.length - 1) close();
    else setIdx((i) => i + 1);
  };

  const prev = () => setIdx((i) => Math.max(0, i - 1));

  const spread = TOUR_SPREADS[idx];
  const isLast = idx === TOUR_SPREADS.length - 1;

  return (
    <div
      className={`${styles.overlay} ${surface === 'desktop' ? styles.overlayDesktop : ''}`}
      style={
        {
          background: theme.bg === '#0E1623' ? 'rgba(7, 12, 20, 0.78)' : 'rgba(26, 39, 56, 0.42)',
        } as CSSProperties
      }
    >
      <div
        className={`${styles.card} ${surface === 'desktop' ? styles.cardDesktop : ''}`}
        style={{
          background: theme.bg,
          color: theme.text,
          borderColor: theme.borderHi,
        }}
      >
        <div className={styles.kickerRow} style={{ borderBottomColor: theme.border }}>
          <Mono color={theme.accent} size={9.5} tracking="0.18em">
            {spread.kicker}
          </Mono>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em">
            {String(idx + 1).padStart(2, '0')} OF {String(TOUR_SPREADS.length).padStart(2, '0')}
          </Mono>
        </div>

        <div className={`${styles.title} ${surface === 'desktop' ? styles.titleDesktop : ''}`} style={{ color: theme.text }}>
          {spread.title.map((part, i) =>
            i === spread.italic ? (
              <em key={i} className={styles.titleItalic} style={{ color: theme.accent }}>
                {part}
              </em>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>

        <div className={styles.body} style={{ borderTopColor: theme.border, color: theme.textMuted }}>
          {spread.body}
        </div>

        <div className={styles.foot}>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em">
            {spread.foot}
          </Mono>
        </div>

        <div className={styles.dots}>
          {TOUR_SPREADS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === idx ? styles.dotActive : ''}`}
              style={{
                width: i === idx ? 14 : 6,
                background: i === idx ? theme.accent : theme.borderHi,
              }}
              onClick={() => setIdx(i)}
              aria-label={`Go to spread ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.actions} style={{ borderTopColor: theme.border }}>
          <button type="button" className={styles.skipBtn} style={{ color: theme.textSubtle }} onClick={close}>
            Skip tour
          </button>
          <div className={styles.actionBtns}>
            {idx > 0 && (
              <button
                type="button"
                className={styles.backBtn}
                style={{ borderColor: theme.border, color: theme.textMuted }}
                onClick={prev}
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              className={styles.nextBtn}
              style={{ background: theme.accent, borderColor: theme.accent, color: theme.accentInk }}
              onClick={next}
            >
              {isLast ? 'Begin →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
