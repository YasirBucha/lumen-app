import { create } from 'zustand';
import type { AiTone, Theme } from '../types';

interface UiState {
  theme: Theme;
  currency: 'PKR' | 'USD';
  aiTone: AiTone;
  paletteOpen: boolean;
  connectOpen: boolean;
  tourDone: boolean;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: 'PKR' | 'USD') => void;
  setPaletteOpen: (open: boolean) => void;
  setConnectOpen: (open: boolean) => void;
  setTourDone: (done: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  currency: 'PKR',
  aiTone: 'confident',
  paletteOpen: false,
  connectOpen: false,
  tourDone: false,
  setTheme: (theme) => set({ theme }),
  setCurrency: (currency) => set({ currency }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setConnectOpen: (connectOpen) => set({ connectOpen }),
  setTourDone: (tourDone) => set({ tourDone }),
}));
