import type { Subscription } from '../types';

export interface PriceSeriesPoint {
  pkr: number;
  label: string;
  isAfterBump: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildPriceSeries(sub: Subscription): PriceSeriesPoint[] {
  if (!sub.priceIncrease) return [];

  const now = new Date('2026-06-29');
  const bump = new Date(sub.priceIncrease.date);
  const fromPKR = sub.priceIncrease.fromPKR;
  const toPKR = sub.priceIncrease.toPKR;
  const series: PriceSeriesPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    d.setDate(15);
    const afterBump = d >= bump;
    series.push({
      pkr: afterBump ? toPKR : fromPKR,
      label: MONTHS[d.getMonth()].toUpperCase().slice(0, 3),
      isAfterBump: afterBump,
    });
  }
  return series;
}

export function priceIncreasePct(sub: Subscription): number {
  if (!sub.priceIncrease) return 0;
  return Math.round(
    ((sub.priceIncrease.toPKR - sub.priceIncrease.fromPKR) / sub.priceIncrease.fromPKR) * 100,
  );
}

export function priceQuote(sub: Subscription, pct: number, fromStr: string, toStr: string): string {
  return (
    `${sub.merchant} held at ${fromStr} for months before the jump to ${toStr} — a ${pct}% step. ` +
    `Lumen logged the change from the renewal email.`
  );
}
