import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useTheme } from './hooks/useTheme';
import { SignIn } from './screens/SignIn';
import { Dashboard } from './screens/Dashboard';
import styles from './App.module.css';

function AppRoutes() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  useSubscriptions();
  useTheme();

  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingText}>Lumen</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" replace />} />
      <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="*" element={<Navigate to={user ? '/' : '/signin'} replace />} />
    </Routes>
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
