import type { Subscription, ThemeTokens } from '../../types';
import { CARD_KINDS, CATEGORIES } from '../../lib/seedData';
import type { CardKind, Category } from '../../types';
import styles from './MerchantGlyph.module.css';

interface MerchantGlyphProps {
  sub: Pick<Subscription, 'glyph' | 'glyphBg'>;
  size?: number;
  radius?: number;
}

export function MerchantGlyph({ sub, size = 44, radius = 4 }: MerchantGlyphProps) {
  return (
    <div
      className={styles.glyph}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: sub.glyphBg,
        fontSize: size * 0.48,
      }}
    >
      {sub.glyph}
    </div>
  );
}

interface CardChipProps {
  kind: CardKind;
  last4: string;
  theme?: ThemeTokens;
  size?: 'sm' | 'md';
}

export function CardChip({ kind, last4, theme, size = 'sm' }: CardChipProps) {
  const k = CARD_KINDS[kind] ?? CARD_KINDS.visa;
  return (
    <span className={styles.chip} style={{ fontSize: size === 'sm' ? 10 : 12, color: theme?.textMuted }}>
      <span
        className={styles.chipArt}
        style={{ background: `linear-gradient(135deg, ${k.tint[0]}, ${k.tint[1]})` }}
      />
      {k.label}·{last4}
    </span>
  );
}

interface CategoryDotProps {
  id: Category;
  size?: number;
}

export function CategoryDot({ id, size = 8 }: CategoryDotProps) {
  const c = CATEGORIES.find((cat) => cat.id === id);
  return (
    <span
      className={styles.dot}
      style={{ width: size, height: size, background: c?.swatch ?? '#888' }}
    />
  );
}
