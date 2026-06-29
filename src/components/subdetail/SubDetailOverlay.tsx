import { useTheme } from '../../hooks/useTheme';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { useSubStore } from '../../store/subStore';
import { useUiStore } from '../../store/uiStore';
import { SubDetail } from './SubDetail';

export function SubDetailOverlay() {
  const isDesktop = useIsDesktop();
  const theme = useTheme();
  const openSubId = useSubStore((s) => s.openSubId);
  const subscriptions = useSubStore((s) => s.subscriptions);
  const setOpenSubId = useSubStore((s) => s.setOpenSubId);
  const currency = useUiStore((s) => s.currency);
  const aiTone = useUiStore((s) => s.aiTone);
  const setCancelSubId = useUiStore((s) => s.setCancelSubId);

  if (isDesktop || !openSubId) return null;

  const sub = subscriptions.find((s) => s.id === openSubId);
  if (!sub) return null;

  return (
    <SubDetail
      theme={theme}
      currency={currency}
      aiTone={aiTone}
      sub={sub}
      onClose={() => setOpenSubId(null)}
      onCancel={(s) => {
        setCancelSubId(s.id);
        setOpenSubId(null);
      }}
    />
  );
}
