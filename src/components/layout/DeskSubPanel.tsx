import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useSubStore } from '../../store/subStore';
import { useUiStore } from '../../store/uiStore';
import { SubDetail } from '../subdetail/SubDetail';
import styles from './DeskSubPanel.module.css';

export function DeskSubPanel() {
  const theme = useTheme();
  const currency = useUiStore((s) => s.currency);
  const aiTone = useUiStore((s) => s.aiTone);
  const setCancelSubId = useUiStore((s) => s.setCancelSubId);
  const openSubId = useSubStore((s) => s.openSubId);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);
  const subs = useSubStore((s) => s.subscriptions);
  const sub = subs.find((s) => s.id === openSubId) ?? null;
  const open = !!sub;

  const [renderedSub, setRenderedSub] = useState(sub);
  useEffect(() => {
    if (sub) setRenderedSub(sub);
  }, [sub]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      if (detail?.id) setOpenSubId(detail.id);
    };
    window.addEventListener('lumen:openSubPanel', handler);
    return () => window.removeEventListener('lumen:openSubPanel', handler);
  }, [setOpenSubId]);

  const displaySub = sub ?? renderedSub;
  const close = () => setOpenSubId(null);

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
        {displaySub && (
          <SubDetail
            theme={theme}
            currency={currency}
            aiTone={aiTone}
            sub={displaySub}
            onClose={close}
            onCancel={(s) => {
              setCancelSubId(s.id);
              setOpenSubId(null);
            }}
            compact
          />
        )}
      </aside>
    </>
  );
}
