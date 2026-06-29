import { FX } from './seedData';

export function fmtMoney(amount: number, currency: 'PKR' | 'USD'): string {
  if (currency === 'USD') {
    return (
      '$' +
      amount.toLocaleString('en-US', {
        maximumFractionDigits: amount < 100 ? 2 : 0,
      })
    );
  }
  return 'Rs ' + Math.round(amount).toLocaleString('en-US');
}

export function fmt(currency: 'PKR' | 'USD', pkr: number): string {
  if (currency === 'USD') return fmtMoney(pkr / FX, 'USD');
  return fmtMoney(pkr, 'PKR');
}

export function fmtCompact(currency: 'PKR' | 'USD', pkr: number): string {
  const v = currency === 'USD' ? pkr / FX : pkr;
  const sym = currency === 'USD' ? '$' : 'Rs ';
  if (v >= 1_000_000) return sym + (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return sym + Math.round(v / 1_000) + 'K';
  return sym + Math.round(v).toLocaleString();
}

export function splitMoney(currency: 'PKR' | 'USD', pkr: number): [string, string] {
  const v = currency === 'USD' ? pkr / FX : pkr;
  const ccy = currency === 'USD' ? '$' : 'Rs';
  return [ccy, Math.round(v).toLocaleString()];
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(iso: string, today = new Date('2026-06-29')): number {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function monthlyEquivalent(s: { cycle: string; amountPKR: number }): number {
  return s.cycle === 'yearly' ? s.amountPKR / 12 : s.amountPKR;
}

export function yearlyEquivalent(s: { cycle: string; amountPKR: number }): number {
  return s.cycle === 'yearly' ? s.amountPKR : s.amountPKR * 12;
}
