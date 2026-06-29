import { yearlyEquivalent } from './format';
import type { Subscription } from '../types';

export const CAL_TODAY = new Date('2026-06-29');
CAL_TODAY.setHours(0, 0, 0, 0);

export interface RenewalEntry {
  sub: Subscription;
  date: Date;
}

function calStartOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1);
}

function calDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function calIsSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function calFmtMonthYear(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function calFmtMonthShort(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

export function calBuildMonthGrid(y: number, m: number): { date: Date; inMonth: boolean }[] {
  const first = calStartOfMonth(y, m);
  const firstDow = (first.getDay() + 6) % 7;
  const days = calDaysInMonth(y, m);
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = 0; i < firstDow; i++) {
    const d = new Date(y, m, 1 - (firstDow - i));
    cells.push({ date: d, inMonth: false });
  }
  for (let i = 1; i <= days; i++) {
    cells.push({ date: new Date(y, m, i), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  return cells;
}

export function calProjectRenewals(sub: Subscription, fromDate: Date, toDate: Date): Date[] {
  const out: Date[] = [];
  if (!sub.nextCharge) return out;

  const start = new Date(sub.nextCharge);
  start.setHours(0, 0, 0, 0);

  const advance = (d: Date) => {
    const next = new Date(d);
    if (sub.cycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return next;
  };

  let cur = new Date(start);
  while (cur > fromDate) {
    const prev = new Date(cur);
    if (sub.cycle === 'yearly') prev.setFullYear(prev.getFullYear() - 1);
    else prev.setMonth(prev.getMonth() - 1);
    if (prev < fromDate) break;
    cur = prev;
  }
  while (cur < fromDate) cur = advance(cur);

  let safety = 0;
  while (cur <= toDate && safety < 50) {
    out.push(new Date(cur));
    cur = advance(cur);
    safety++;
  }
  return out;
}

export function calBuildRenewalMap(
  subs: Subscription[],
  fromDate: Date,
  toDate: Date,
): Map<string, RenewalEntry[]> {
  const map = new Map<string, RenewalEntry[]>();
  subs.forEach((s) => {
    if (s.status !== 'active') return;
    const dates = calProjectRenewals(s, fromDate, toDate);
    dates.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ sub: s, date: d });
    });
  });
  map.forEach((list) => list.sort((a, b) => yearlyEquivalent(b.sub) - yearlyEquivalent(a.sub)));
  return map;
}

export function calKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
