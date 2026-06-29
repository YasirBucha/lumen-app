import type { Category, Subscription, Verdict } from '../types';
import { CATEGORIES } from './seedData';

export interface ParsedQuery {
  text: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface PaletteFilters {
  verdict: Verdict | null;
  mailbox: string | null;
  category: Category | null;
}

export interface AccountOption {
  id: string;
  label: string;
  email: string;
}

export function parseQuery(raw: string): ParsedQuery {
  const out: ParsedQuery = { text: '', minAmount: null, maxAmount: null };
  if (!raw) return out;

  let s = raw;
  const rangeMatch = s.match(/(\d{2,7})\s*[-–]\s*(\d{2,7})/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    out.minAmount = Math.min(a, b);
    out.maxAmount = Math.max(a, b);
    s = s.replace(rangeMatch[0], ' ');
  } else {
    const gt = s.match(/>\s*(\d{2,7})/);
    if (gt) {
      out.minAmount = Number(gt[1]);
      s = s.replace(gt[0], ' ');
    }
    const lt = s.match(/<\s*(\d{2,7})/);
    if (lt) {
      out.maxAmount = Number(lt[1]);
      s = s.replace(lt[0], ' ');
    }
  }
  out.text = s.trim().toLowerCase();
  return out;
}

export function scoreSub(
  sub: Subscription,
  parsed: ParsedQuery,
  filters: PaletteFilters,
  accounts: AccountOption[],
): number {
  if (filters.verdict && sub.verdict !== filters.verdict) return 0;
  if (filters.mailbox && filters.mailbox !== 'all' && sub.account !== filters.mailbox) return 0;
  if (filters.category && sub.category !== filters.category) return 0;
  if (parsed.minAmount != null && sub.amountPKR < parsed.minAmount) return 0;
  if (parsed.maxAmount != null && sub.amountPKR > parsed.maxAmount) return 0;

  const q = parsed.text;
  if (!q) {
    const monthly = sub.cycle === 'yearly' ? sub.amountPKR / 12 : sub.amountPKR;
    return 1 + monthly / 1000;
  }

  let score = 0;
  const merchant = sub.merchant.toLowerCase();
  if (merchant === q) score += 100;
  else if (merchant.startsWith(q)) score += 60;
  else if (merchant.includes(q)) score += 40;

  const cat = CATEGORIES.find((c) => c.id === sub.category)?.label ?? '';
  if (cat.toLowerCase().includes(q)) score += 18;

  const acc = accounts.find((a) => a.id === sub.account);
  if (acc) {
    if (acc.label.toLowerCase().includes(q)) score += 12;
    if (acc.email.toLowerCase().includes(q)) score += 10;
  }

  if (sub.verdict.toLowerCase().includes(q)) score += 8;
  if (sub.last4 && sub.last4.includes(q)) score += 30;

  return score;
}

export function searchSubs(
  subs: Subscription[],
  raw: string,
  filters: PaletteFilters,
  accounts: AccountOption[],
): Subscription[] {
  const parsed = parseQuery(raw);
  return subs
    .map((sub) => ({ sub, score: scoreSub(sub, parsed, filters, accounts) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((x) => x.sub);
}
