import type { Subscription } from '../types';

export interface VerdictHistoryEvent {
  date: Date;
  from: string;
  to: string;
  headline: string;
  detail: string;
  kind: 'added' | 'price' | 'usage' | 'filed';
}

export function vhDateStamp(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const mo = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yr = date.getFullYear();
  return `${day} ${mo} ${yr}`;
}

export function buildVerdictHistory(sub: Subscription): VerdictHistoryEvent[] {
  const events: VerdictHistoryEvent[] = [];
  const NOW = new Date('2026-06-29');

  const sinceParts = (sub.since || '2023-01').split('-');
  const addedDate = new Date(
    parseInt(sinceParts[0], 10),
    parseInt(sinceParts[1], 10) - 1,
    15,
  );
  events.push({
    date: addedDate,
    from: 'NEW',
    to: 'KEEP',
    headline: 'Added to the ledger.',
    detail: `First charge verified from ${sub.merchant} receipt.`,
    kind: 'added',
  });

  if (sub.priceIncrease) {
    const pct = Math.round(
      ((sub.priceIncrease.toPKR - sub.priceIncrease.fromPKR) / sub.priceIncrease.fromPKR) * 100,
    );
    const fromTxt = 'Rs ' + sub.priceIncrease.fromPKR.toLocaleString();
    const toTxt = 'Rs ' + sub.priceIncrease.toPKR.toLocaleString();
    events.push({
      date: new Date(sub.priceIncrease.date),
      from: 'KEEP',
      to: sub.verdict === 'keep' ? 'KEEP' : 'REVIEW',
      headline:
        sub.verdict === 'keep'
          ? `Price up ${pct}% — kept on usage.`
          : `Price up ${pct}% — moved to review.`,
      detail: `${fromTxt} → ${toTxt}. Renewal email logged.`,
      kind: 'price',
    });
  }

  const sessions = sub.usage?.sessionsLast30 ?? 0;
  if ((sub.verdict === 'review' || sub.verdict === 'cancel') && sessions <= 8) {
    const daysBack = sub.status === 'past' ? 35 : 21;
    const d = new Date(NOW);
    d.setDate(d.getDate() - daysBack);
    events.push({
      date: d,
      from: 'KEEP',
      to: sub.verdict === 'cancel' ? 'CANCEL' : 'REVIEW',
      headline:
        sub.verdict === 'cancel'
          ? 'Usage collapsed — cancel suggested.'
          : 'Usage softening — flagged for review.',
      detail: `Used ${sessions} of last 30 days. Last session ${sub.usage?.lastUsed ?? 'unknown'}.`,
      kind: 'usage',
    });
  }

  if (sub.status === 'past' && sub.verdict === 'cancel') {
    const d = new Date(NOW);
    d.setDate(d.getDate() - 9);
    events.push({
      date: d,
      from: 'CANCEL',
      to: 'CANCELLED',
      headline: 'You filed it as cancelled.',
      detail: 'No further renewals expected. Moved to past.',
      kind: 'filed',
    });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  const cleaned: VerdictHistoryEvent[] = [];
  events.forEach((e) => {
    const last = cleaned[cleaned.length - 1];
    if (last && last.to === e.to && last.kind === e.kind) return;
    cleaned.push(e);
  });
  return cleaned;
}
