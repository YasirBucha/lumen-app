import { FX } from './seedData';
import type { Subscription } from '../types';

export type AlertKind = 'price-increase';

export interface Alert {
  id: string;
  kind: AlertKind;
  sub: Subscription;
  date: string;
  deltaPKR: number;
  pct: number;
}

export const FUTURE_KINDS = [
  { kind: 'failed-renewal', label: 'Failed renewals', caption: 'Cards that declined a charge' },
  { kind: 'unrecognized', label: 'Unrecognized charges', caption: 'Receipts we could not match' },
  { kind: 'free-trial-ending', label: 'Free trials ending', caption: 'Before they auto-convert' },
] as const;

export function buildAlerts(subs: Subscription[]): Alert[] {
  const alerts: Alert[] = [];
  subs.forEach((s) => {
    if (s.priceIncrease && s.status === 'active') {
      const delta = s.priceIncrease.toPKR - s.priceIncrease.fromPKR;
      const pct = (delta / s.priceIncrease.fromPKR) * 100;
      alerts.push({
        id: `pi-${s.id}`,
        kind: 'price-increase',
        sub: s,
        date: s.priceIncrease.date,
        deltaPKR: delta,
        pct,
      });
    }
  });
  alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return alerts;
}

export function alertYearlyDeltaPKR(a: Alert): number {
  const pi = a.sub.priceIncrease!;
  const mFrom = a.sub.cycle === 'yearly' ? pi.fromPKR / 12 : pi.fromPKR;
  const mTo = a.sub.cycle === 'yearly' ? pi.toPKR / 12 : pi.toPKR;
  return (mTo - mFrom) * 12;
}

export function fmtAlertPrice(pkr: number, currency: 'PKR' | 'USD'): string {
  if (currency === 'USD') return '$' + Math.round(pkr / FX).toLocaleString();
  return 'Rs ' + Math.round(pkr).toLocaleString();
}

export function alertReason(a: Alert): string {
  if (a.pct >= 25) return 'A sharp jump — review usage before it renews.';
  if (a.pct >= 15) return 'A meaningful increase. Worth a second look.';
  return 'A small bump, but it compounds.';
}
