import { Outlet } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
