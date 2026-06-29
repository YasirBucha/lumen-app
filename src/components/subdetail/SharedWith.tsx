import type { SharedMember, Subscription, ThemeTokens } from '../../types';
import { FX } from '../../lib/seedData';
import { Mono } from '../primitives';
import styles from './SharedWith.module.css';

interface SharedWithProps {
  theme: ThemeTokens;
  currency: 'PKR' | 'USD';
  sub: Subscription;
  compact?: boolean;
}

function SharedAvatar({
  member,
  index,
  theme,
}: {
  member: SharedMember;
  index: number;
  theme: ThemeTokens;
}) {
  const overlap = index === 0 ? 0 : -8;
  const style = {
    marginLeft: overlap,
    zIndex: 10 - index,
    background: member.empty ? undefined : member.color,
    boxShadow: member.empty ? undefined : `0 0 0 0.5px ${theme.borderHi}`,
  };

  if (member.empty) {
    return (
      <div
        className={`${styles.avatar} ${styles.avatarEmpty}`}
        style={{ ...style, borderColor: theme.textSubtle, color: theme.textSubtle }}
      >
        <span className={styles.avatarPlus}>+</span>
      </div>
    );
  }

  return (
    <div className={styles.avatar} style={{ ...style, borderColor: theme.bg }}>
      {member.initial}
    </div>
  );
}

export function SharedWith({ theme, currency, sub, compact }: SharedWithProps) {
  if (!sub.sharedWith) return null;

  const { plan, members, note } = sub.sharedWith;
  const activeSeats = members.filter((m) => !m.empty).length;
  const monthly = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
  const perSeatPKR = monthly / Math.max(activeSeats, 1);
  const perSeatStr =
    currency === 'USD'
      ? '$' + (perSeatPKR / FX).toFixed(2)
      : 'Rs ' + Math.round(perSeatPKR).toLocaleString();

  return (
    <div
      className={compact ? `${styles.root} ${styles.rootCompact}` : styles.root}
      style={{ borderBottomColor: theme.border }}
    >
      <div className={styles.head}>
        <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
          SHARED WITH
        </Mono>
        <Mono color={theme.textSubtle} size={9} tracking="0.14em">
          {plan.toUpperCase()}
        </Mono>
      </div>

      <div className={styles.avatarRow}>
        <div className={styles.avatars}>
          {members.map((m, i) => (
            <SharedAvatar key={i} member={m} index={i} theme={theme} />
          ))}
        </div>
        <div className={styles.perSeat}>
          <div className={styles.perSeatAmount} style={{ color: theme.text }}>
            {perSeatStr}
          </div>
          <Mono color={theme.textSubtle} size={9} tracking="0.14em" className={styles.perSeatLabel}>
            /SEAT · MO
          </Mono>
        </div>
      </div>

      <div className={styles.detailRow} style={{ borderTopColor: theme.border }}>
        {members.map((m, i) => (
          <div key={i} className={styles.member}>
            <span
              className={`${styles.memberDot} ${m.empty ? styles.memberDotEmpty : ''}`}
              style={{
                background: m.empty ? 'transparent' : m.color,
                borderColor: m.empty ? theme.textSubtle : undefined,
              }}
            />
            <Mono
              color={m.empty ? theme.textSubtle : m.you ? theme.accent : theme.textMuted}
              size={9}
              tracking="0.12em"
            >
              {m.you ? `${m.label.toUpperCase()} (YOU)` : m.label.toUpperCase()}
            </Mono>
          </div>
        ))}
      </div>

      {note && (
        <div className={styles.note} style={{ color: theme.textMuted }}>
          {note}
        </div>
      )}
    </div>
  );
}
