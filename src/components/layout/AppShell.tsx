import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { BottomTabBar } from './BottomTabBar';
import { DesktopShell } from './DesktopShell';
import styles from './AppShell.module.css';

export function AppShell() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <DesktopShell />;
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
