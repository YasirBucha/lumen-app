import type { AmountMatch } from './types';

const BILLING_LABELS = [
  'total',
  'amount paid',
  'charged',
  'invoice total',
  'subscription',
  'renewal',
  'payment',
  'you paid',
  'grand total',
  'billing amount',
];

const AMOUNT_PATTERNS: { re: RegExp; currency: AmountMatch['currency'] }[] = [
  { re: /(?:US\$|USD)\s*([\d,]+(?:\.\d{2})?)/gi, currency: 'USD' },
  { re: /\$\s*([\d,]+(?:\.\d{2})?)/g, currency: 'USD' },
  { re: /(?:PKR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/gi, currency: 'PKR' },
  { re: /EUR\s*([\d,]+(?:\.\d{2})?)/gi, currency: 'EUR' },
  { re: /GBP\s*([\d,]+(?:\.\d{2})?)/gi, currency: 'GBP' },
];

function parseNum(s: string): number {
  return parseFloat(s.replace(/,/g, ''));
}

/** Prefer amounts near billing labels; ignore stray numbers. */
export function extractBillingAmount(text: string): AmountMatch | null {
  const lower = text.toLowerCase();
  let best: (AmountMatch & { score: number }) | null = null;

  for (const label of BILLING_LABELS) {
    const idx = lower.indexOf(label);
    if (idx === -1) continue;
    const window = text.slice(idx, idx + 120);

    for (const { re, currency } of AMOUNT_PATTERNS) {
      re.lastIndex = 0;
      const m = re.exec(window);
      if (!m) continue;
      const amount = parseNum(m[1]);
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const score = 100 - idx / 100;
      if (!best || score > best.score) {
        best = { amount, currency, raw: m[0].trim(), label, score };
      }
    }
  }

  if (best) {
    const { score: _, ...match } = best;
    return match;
  }

  if (!/\b(receipt|invoice|subscription|renewal|charged|payment)\b/i.test(text)) return null;

  for (const { re, currency } of AMOUNT_PATTERNS) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) {
      const amount = parseNum(m[1]);
      if (Number.isFinite(amount) && amount > 0) {
        return { amount, currency, raw: m[0].trim(), label: 'context_fallback' };
      }
    }
  }

  return null;
}

/** Any currency amount in billing context — fallback parser only. */
export function extractLooseAmount(text: string): AmountMatch | null {
  const labeled = extractBillingAmount(text);
  if (labeled) return labeled;

  if (!/\b(receipt|invoice|subscription|renewal|billing|payment|charged|membership|premium)\b/i.test(text)) {
    return null;
  }

  for (const { re, currency } of AMOUNT_PATTERNS) {
    re.lastIndex = 0;
    let best: AmountMatch | null = null;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const amount = parseNum(m[1]);
      if (!Number.isFinite(amount)) continue;
      if (currency === 'PKR' && amount < 100) continue;
      if (currency === 'USD' && amount < 1) continue;
      best = { amount, currency, raw: m[0].trim(), label: 'loose' };
    }
    if (best) return best;
  }
  return null;
}

export function extractPaymentHint(text: string): string | null {
  const m = text.match(/\b(visa|mastercard|amex|unionpay|paypal)\b[^*\d]*(\*{2,4}\s*\d{4}|\d{4})/i);
  if (m) return `${m[1]} ${m[2]}`.trim();
  const last4 = text.match(/\b(?:ending in|last four|••••)\s*(\d{4})\b/i);
  if (last4) return `card ${last4[1]}`;
  return null;
}

export function extractNextChargeDate(text: string): string | null {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const long = text.match(
    /\b(?:on|by|renew(?:s|al)?(?: on)?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+20\d{2})\b/i,
  );
  if (long) {
    const d = new Date(long[1]);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

export function inferCadence(text: string): 'monthly' | 'yearly' | 'weekly' | 'one-time' | null {
  if (/\b(annual|yearly|year|per year|\/yr)\b/i.test(text)) return 'yearly';
  if (/\b(monthly|per month|\/mo|each month)\b/i.test(text)) return 'monthly';
  if (/\b(weekly|per week)\b/i.test(text)) return 'weekly';
  if (/\bone[- ]time\b/i.test(text)) return 'one-time';
  return null;
}
