import { CATEGORIES } from '../../lib/seedData';
import { fmt, monthlyEquivalent } from '../../lib/format';
import type { Subscription, ThemeTokens } from '../../types';
import { CategoryDot } from '../primitives';
import { Mono } from '../primitives';
import styles from './CategoryStack.module.css';

interface CategoryStackProps {
  subs: Subscription[];
  currency: 'PKR' | 'USD';
  theme: ThemeTokens;
}

export function CategoryStack({ subs, currency, theme }: CategoryStackProps) {
  const totals = CATEGORIES.map((c) => {
    const total = subs
      .filter((s) => s.category === c.id)
      .reduce((a, s) => a + monthlyEquivalent(s), 0);
    return { ...c, total };
  })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
  const grand = totals.reduce((a, c) => a + c.total, 0) || 1;

  return (
    <div>
      <div className={styles.bar}>
        {totals.map((c) => (
          <div
            key={c.id}
            title={c.label}
            style={{ width: `${(c.total / grand) * 100}%`, background: c.swatch }}
          />
        ))}
      </div>
      {totals.map((c, i) => (
        <div
          key={c.id}
          className={styles.row}
          style={{ borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}
        >
          <CategoryDot id={c.id} size={8} />
          <span className={styles.label} style={{ color: theme.text }}>
            {c.label}
          </span>
          <span className={styles.amount} style={{ color: theme.text }}>
            {fmt(currency, c.total)}
          </span>
          <Mono color={theme.textSubtle} size={9} tracking="0.10em" style={{ width: 32, textAlign: 'right' }}>
            {Math.round((c.total / grand) * 100)}%
          </Mono>
        </div>
      ))}
    </div>
  );
}
