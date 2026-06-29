import type { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { DesktopSidebar } from './DesktopSidebar';
import { DeskSubPanel } from './DeskSubPanel';
import styles from './DesktopShell.module.css';

export function DesktopShell() {
  const theme = useTheme();

  return (
    <div
      className={styles.shell}
      style={
        {
          background: theme.bg,
          color: theme.text,
          '--bg': theme.bg,
          '--text': theme.text,
          '--border-hi': theme.borderHi,
        } as CSSProperties
      }
    >
      <DesktopSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <DeskSubPanel />
    </div>
  );
}
