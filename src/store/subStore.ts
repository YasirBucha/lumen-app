import { create } from 'zustand';
import type { GmailAccount, Subscription } from '../types';

interface SubState {
  subscriptions: Subscription[];
  gmailAccounts: GmailAccount[];
  activeAccount: string;
  openSubId: string | null;
  cancelledIds: string[];
  setSubscriptions: (subs: Subscription[]) => void;
  setGmailAccounts: (accounts: GmailAccount[]) => void;
  setActiveAccount: (id: string) => void;
  setOpenSubId: (id: string | null) => void;
  addCancelledId: (id: string) => void;
  markCancelled: (id: string) => void;
}

export const useSubStore = create<SubState>((set) => ({
  subscriptions: [],
  gmailAccounts: [],
  activeAccount: 'all',
  openSubId: null,
  cancelledIds: [],
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setGmailAccounts: (gmailAccounts) => set({ gmailAccounts }),
  setActiveAccount: (activeAccount) => set({ activeAccount }),
  setOpenSubId: (openSubId) => set({ openSubId }),
  addCancelledId: (id) =>
    set((s) => ({
      cancelledIds: s.cancelledIds.includes(id) ? s.cancelledIds : [...s.cancelledIds, id],
    })),
  markCancelled: (id) =>
    set((s) => ({
      cancelledIds: s.cancelledIds.includes(id) ? s.cancelledIds : [...s.cancelledIds, id],
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, status: 'past', verdict: 'cancel' } : sub,
      ),
    })),
}));
