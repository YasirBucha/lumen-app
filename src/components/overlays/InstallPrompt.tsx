import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './InstallPrompt.module.css';

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'lumen.install.dismissed';

export function InstallPrompt() {
  const theme = useTheme();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (Number(localStorage.getItem(DISMISSED_KEY) ?? 0) > Date.now() - 7 * 24 * 60 * 60 * 1000) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!installEvent) return null;

  return (
    <aside className={styles.root} style={{ background: theme.surfaceRaised, borderColor: theme.borderHi, color: theme.text }}>
      <div>
        <div className={styles.title}>Keep Lumen close.</div>
        <div className={styles.copy} style={{ color: theme.textMuted }}>Install the ledger for quicker scans and alerts.</div>
      </div>
      <button
        type="button"
        className={styles.action}
        onClick={() => {
          void installEvent.prompt().then(() => {
            void installEvent.userChoice.then(() => setInstallEvent(null));
          });
        }}
        style={{ background: theme.accent, color: theme.accentInk }}
      >
        Install
      </button>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, String(Date.now()));
          setInstallEvent(null);
        }}
        style={{ color: theme.textMuted }}
        aria-label="Dismiss install prompt"
      >
        ×
      </button>
    </aside>
  );
}
