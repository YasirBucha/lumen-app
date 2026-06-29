import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { LumenLogo, Mono } from '../components/primitives';
import styles from './SignIn.module.css';

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.32z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC04"
        d="M5.84 14.11A6.6 6.6 0 015.5 12c0-.73.13-1.45.34-2.11V7.05H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function SignIn() {
  const theme = useTheme();
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const handleSignIn = async () => {
    await signIn();
    navigate('/scanning');
  };

  return (
    <div className={styles.root} style={{ background: theme.bg, color: theme.text }}>
      <div className={styles.header} style={{ borderBottomColor: theme.border }}>
        <div className={styles.headerRow}>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
            MONDAY · 29 JUN 2026
          </Mono>
          <Mono color={theme.textMuted} size={9.5} tracking="0.18em">
            VOL. I · NO. 01
          </Mono>
        </div>
        <div className={styles.logoWrap}>
          <LumenLogo size={56} theme={theme} />
        </div>
        <Mono color={theme.textSubtle} size={9.5} tracking="0.18em">
          THE SUBSCRIPTION LEDGER
        </Mono>
      </div>

      <div className={styles.hero}>
        <div className={styles.headline} style={{ color: theme.text }}>
          See every
          <br />
          subscription.
          <br />
          <em style={{ color: theme.accent }}>Spend with intent.</em>
        </div>
        <div className={styles.dek} style={{ borderTopColor: theme.border, color: theme.textMuted }}>
          Lumen reads your Gmail receipts and renewal notices to surface every active, past, and upcoming subscription
          — with verified amounts only.
        </div>
        <Mono color={theme.textSubtle} size={9} tracking="0.16em">
          — By Lumen, on your inbox
        </Mono>
      </div>

      <div className={styles.footer} style={{ borderTopColor: theme.border }}>
        <button
          className={styles.primary}
          style={{ background: theme.accent, color: theme.accentInk }}
          onClick={() => void handleSignIn()}
        >
          <GoogleG size={18} />
          Continue with Gmail
        </button>
        <button className={styles.secondary} style={{ borderColor: theme.borderHi, color: theme.text }}>
          Sign in with passkey
        </button>
        <div className={styles.disclaimer} style={{ color: theme.textSubtle }}>
          Lumen requests <span style={{ color: theme.textMuted }}>read-only</span> access to receipts.
          <br />
          Message contents stay on your device.
        </div>
      </div>
    </div>
  );
}
