import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';

export function useKeyboard() {
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const open = useUiStore.getState().paletteOpen;
        setPaletteOpen(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);
}
