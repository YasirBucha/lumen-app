import type { ReceiptEvent } from './types';
import { amountSanity } from './registry';

const FX = 278;

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toAmounts(amount: number, currency: string) {
  const ccy = currency ?? 'USD';
  const amountPKR = ccy === 'PKR' ? amount : Math.round(amount * FX);
  const amountUSD = ccy === 'USD' ? amount : amount / FX;
  return { amountPKR, amountUSD, currency: ccy };
}

function glyphColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360} 45% 42%)`;
}

export function computeSubId(event: ReceiptEvent, accountId: string): string | null {
  if (!event.merchant || event.classification === 'not_subscription') return null;

  if (event.processorSubscriptionId) {
    return slug(`proc-${event.processorSubscriptionId}`);
  }

  const parts = [
    slug(event.merchant),
    accountId,
    event.planTier ? slug(event.planTier) : '',
    event.cadence ?? '',
  ];
  if (event.paymentMethodHint) {
    const last4 = event.paymentMethodHint.match(/(\d{4})/);
    if (last4) parts.push(last4[1]);
  }
  return parts.filter(Boolean).join('--').slice(0, 120);
}

export interface BuiltSubscription {
  subId: string;
  doc: Record<string, unknown>;
}

const CATEGORY_MAP: Record<string, string> = {
  streaming: 'streaming',
  software: 'productivity',
  cloud: 'cloud',
  education: 'school',
  shopping: 'ecommerce',
  other: 'bills',
};

function cardFromHint(hint: string | null): { card: string; last4: string } {
  if (!hint) return { card: 'visa', last4: '0000' };
  const last4 = hint.match(/(\d{4})/)?.[1] ?? '0000';
  const card = /amex/i.test(hint) ? 'amex' : /mastercard|mc/i.test(hint) ? 'mc' : 'visa';
  return { card, last4 };
}

/** Build subscription aggregates from receipt events — chronological merge. */
export function buildSubscriptionsFromEvents(
  events: ReceiptEvent[],
  accountId: string,
): BuiltSubscription[] {
  const accepted = events.filter(
    (e) => e.merchant && e.classification !== 'not_subscription' && e.rejectionReason === null,
  );

  const bySub = new Map<string, ReceiptEvent[]>();
  for (const e of accepted) {
    const subId = computeSubId(e, accountId);
    if (!subId) continue;
    const list = bySub.get(subId) ?? [];
    list.push(e);
    bySub.set(subId, list);
  }

  const out: BuiltSubscription[] = [];

  for (const [subId, list] of bySub) {
    list.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));

    const payments = list.filter((e) => e.eventType === 'payment' && e.amount != null && e.currency);
    const notices = list.filter((e) => e.eventType === 'renewal_notice' || e.nextChargeDate);

    const latestPayment = payments[payments.length - 1];
    const latestNotice = notices[notices.length - 1];
    const anchor = latestPayment ?? list[list.length - 1];
    const merchant = anchor.merchant!;

    if (latestPayment?.amount != null && latestPayment.currency) {
      const conf = latestPayment.confidence ?? 0;
      if (conf >= 0.85 && !amountSanity(merchant, latestPayment.amount, latestPayment.currency)) {
        continue;
      }
    }

    const noticeOnly = !latestPayment && latestNotice;

    const cycle =
      anchor.cadence === 'yearly' ? 'yearly' : anchor.cadence === 'weekly' ? 'weekly' : 'monthly';

    const history = payments.map((p) => {
      const { amountPKR, amountUSD } = toAmounts(p.amount!, p.currency!);
      return {
        date: p.receivedAt.slice(0, 10),
        pkr: amountPKR,
        usd: amountUSD,
        status: 'paid' as const,
      };
    });

    let priceIncrease: Record<string, unknown> | undefined;
    if (payments.length >= 2) {
      const prev = payments[payments.length - 2];
      const curr = payments[payments.length - 1];
      if (prev.amount && curr.amount && curr.currency) {
        const { amountPKR: fromPKR, amountUSD: fromUSD } = toAmounts(prev.amount, prev.currency!);
        const { amountPKR: toPKR, amountUSD: toUSD } = toAmounts(curr.amount, curr.currency);
        if (toPKR > fromPKR * 1.05) {
          priceIncrease = {
            fromPKR,
            toPKR,
            fromUSD,
            toUSD,
            date: curr.receivedAt.slice(0, 10),
            emailDate: curr.receivedAt.slice(0, 10),
          };
        }
      }
    }

    const amountSource = latestPayment ?? anchor;
    const amounts =
      amountSource.amount != null && amountSource.currency
        ? toAmounts(amountSource.amount, amountSource.currency)
        : { amountPKR: 0, amountUSD: 0, currency: 'USD' };

    let nextCharge =
      latestNotice?.nextChargeDate ??
      latestPayment?.nextChargeDate ??
      anchor.nextChargeDate ??
      null;

    if (!nextCharge && (cycle === 'monthly' || noticeOnly)) {
      const d = new Date();
      nextCharge = new Date(d.getFullYear(), d.getMonth() + 1, 15).toISOString().slice(0, 10);
    }

    const since = list[0].receivedAt.slice(0, 7);
    const { card, last4 } = cardFromHint(anchor.paymentMethodHint);

    out.push({
      subId,
      doc: {
        merchant,
        glyph: merchant.charAt(0).toUpperCase(),
        glyphBg: glyphColor(merchant),
        amountOrig: amountSource.amount ?? 0,
        amountPKR: amounts.amountPKR,
        amountUSD: amounts.amountUSD,
        currency: amounts.currency,
        cycle,
        category: CATEGORY_MAP[anchor.category] ?? 'bills',
        account: accountId,
        card,
        last4,
        nextCharge: nextCharge ?? '',
        since,
        status: 'active',
        verdict: 'review',
        evidence: list.flatMap((e) => e.evidence).slice(-5),
        usage: { sessionsLast30: 0, lastUsed: 'Unknown' },
        history,
        ...(priceIncrease ? { priceIncrease } : {}),
      },
    });
  }

  return out;
}
