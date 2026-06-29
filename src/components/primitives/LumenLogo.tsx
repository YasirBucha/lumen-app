import type { ThemeTokens } from '../../types';
import styles from './LumenLogo.module.css';

interface LumenLogoProps {
  size?: number;
  color?: string;
  accent?: string;
  theme?: ThemeTokens;
}

export function LumenLogo({ size = 22, color, accent, theme }: LumenLogoProps) {
  const textColor = color ?? theme?.text;
  const accentColor = accent ?? theme?.accent;
  return (
    <div className={styles.logo} style={{ fontSize: size, color: textColor }}>
      <span>Lumen</span>
      <span className={styles.dot} style={{ color: accentColor }}>
        .
      </span>
    </div>
  );
}
