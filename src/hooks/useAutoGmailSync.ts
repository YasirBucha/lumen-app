import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubStore } from '../store/subStore';
import { triggerGmailSync } from '../lib/gmailConnect';

const SESSION_KEY = 'lumen.autosync.session';
export function useAutoGmailSync() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const started = useRef(false);

  useEffect(() => {
    if (location.pathname === '/scanning') return;
    if (!user || gmailAccounts.length === 0 || started.current) return;

    const account = gmailAccounts.find((a) => a.status === 'synced' || a.status === 'error') ?? gmailAccounts[0];
    if (!account || account.status === 'syncing') return;

    const sessionDone = sessionStorage.getItem(`${SESSION_KEY}.${user.uid}`);
    if (sessionDone) return;

    started.current = true;
    sessionStorage.setItem(`${SESSION_KEY}.${user.uid}`, String(Date.now()));

    void triggerGmailSync(user.uid, account.id, { incremental: true }).catch(() => undefined);
  }, [location.pathname, user, gmailAccounts]);
}
