import { create } from 'zustand';
import type { Subscription } from '../types';
import { SUBS_HEAVY } from '../lib/seedData';

interface SubState {
  subscriptions: Subscription[];
  activeAccount: string;
  openSubId: string | null;
  cancelledIds: string[];
  setSubscriptions: (subs: Subscription[]) => void;
  setActiveAccount: (id: string) => void;
  setOpenSubId: (id: string | null) => void;
  addCancelledId: (id: string) => void;
}

export const useSubStore = create<SubState>((set) => ({
  subscriptions: SUBS_HEAVY,
  activeAccount: 'all',
  openSubId: null,
  cancelledIds: [],
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setActiveAccount: (activeAccount) => set({ activeAccount }),
  setOpenSubId: (openSubId) => set({ openSubId }),
  addCancelledId: (id) =>
    set((s) => ({
      cancelledIds: s.cancelledIds.includes(id) ? s.cancelledIds : [...s.cancelledIds, id],
    })),
}));
