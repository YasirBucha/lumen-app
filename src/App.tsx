import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useTheme } from './hooks/useTheme';
import { AppShell } from './components/layout/AppShell';
import { ConnectGmailFlow } from './components/overlays/ConnectGmailFlow';
import { useGmailAccounts } from './hooks/useGmailAccounts';
import { SignIn } from './screens/SignIn';
import { Scanning } from './screens/Scanning';
import { Dashboard } from './screens/Dashboard';
import { Ledger } from './screens/Ledger';
import { Verdicts } from './screens/Verdicts';
import { Patterns } from './screens/Patterns';
import { Settings } from './screens/Settings';
import styles from './App.module.css';

function AppRoutes() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  useSubscriptions();
  useGmailAccounts();
  useTheme();

  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingText}>Lumen</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/scanning" element={<Scanning />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/verdicts" element={<Verdicts />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ConnectGmailFlow />
    </>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    return init();
  }, [init]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
