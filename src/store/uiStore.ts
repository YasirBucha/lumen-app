import { create } from 'zustand';
import type { AiTone, Theme } from '../types';

const TOUR_KEY = 'lumen.tourDone';

interface UiState {
  theme: Theme;
  currency: 'PKR' | 'USD';
  aiTone: AiTone;
  paletteOpen: boolean;
  connectOpen: boolean;
  cancelSubId: string | null;
  tourDone: boolean;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: 'PKR' | 'USD') => void;
  setPaletteOpen: (open: boolean) => void;
  setConnectOpen: (open: boolean) => void;
  setCancelSubId: (id: string | null) => void;
  setTourDone: (done: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  currency: 'PKR',
  aiTone: 'confident',
  paletteOpen: false,
  connectOpen: false,
  cancelSubId: null,
  tourDone: typeof localStorage !== 'undefined' && localStorage.getItem(TOUR_KEY) === 'true',
  setTheme: (theme) => set({ theme }),
  setCurrency: (currency) => set({ currency }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setConnectOpen: (connectOpen) => set({ connectOpen }),
  setCancelSubId: (cancelSubId) => set({ cancelSubId }),
  setTourDone: (tourDone) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOUR_KEY, tourDone ? 'true' : 'false');
    }
    set({ tourDone });
  },
}));
