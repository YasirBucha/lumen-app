import type { GmailMessageLite, ReceiptEvent, ParsedCategory } from './types';
import { combinedText } from './classifier';
import { extractBillingAmount, extractLooseAmount, extractNextChargeDate, extractPaymentHint, inferCadence } from './amount';
import { findMerchantRule } from './registry';
import { normalizeMerchantName, isGarbageGooglePlayMerchant } from './googlePlay';

/** Merchant from From: header — "Spotify <billing@spotify.com>" */
export function merchantFromFromHeader(from: string): string | null {
  const named = from.match(/^"?([^"<]+)"?\s*</);
  if (named?.[1]) {
    const n = named[1].trim();
    if (n.length >= 2 && n.length <= 40 && !/@/.test(n)) return n;
  }
  const email = from.match(/@([a-z0-9-]+)\./i)?.[1];
  if (!email || ['mail', 'email', 'billing', 'noreply', 'no-reply', 'info', 'accounts'].includes(email.toLowerCase())) {
    const domain = from.match(/@(?:[a-z0-9-]+\.)*([a-z0-9-]+)\./i)?.[1];
    if (domain && domain.length > 2) return domain.charAt(0).toUpperCase() + domain.slice(1);
    return null;
  }
  return email.charAt(0).toUpperCase() + email.slice(1);
}

const SUBJECT_MERCHANT = [
  /(?:receipt|invoice|payment|subscription|renewal)\s+(?:from|for)\s+(.{2,45}?)(?:\s+on|\s+—|\.|$)/i,
  /^(.{2,35}?)\s+(?:receipt|invoice|subscription|renewal|membership)/i,
  /your\s+(.{2,35}?)\s+(?:subscription|membership|plan|renewal)/i,
];

function merchantFromSubject(subject: string): string | null {
  for (const re of SUBJECT_MERCHANT) {
    const m = subject.match(re);
    if (m?.[1]) {
      const cleaned = m[1].trim().replace(/\s+(subscription|membership|plan)$/i, '');
      if (cleaned.length >= 2 && cleaned.length <= 45) return cleaned;
    }
  }
  return null;
}

function guessCategory(merchant: string): ParsedCategory {
  const m = merchant.toLowerCase();
  if (/netflix|spotify|youtube|disney|hotstar|prime video|hulu/.test(m)) return 'streaming';
  if (/icloud|dropbox|google one|drive|cloud/.test(m)) return 'cloud';
  if (/notion|adobe|chatgpt|openai|microsoft|github|vpn|expressvpn/.test(m)) return 'software';
  if (/lgs|beaconhouse|school|tuition|coursera|udemy/.test(m)) return 'education';
  if (/amazon|daraz|shopping/.test(m)) return 'shopping';
  return 'other';
}

/** Last-resort parser for billing emails that passed Gmail search but missed tier-2. */
export function fallbackParse(msg: GmailMessageLite): ReceiptEvent | null {
  const text = combinedText(msg);
  const rule = findMerchantRule(msg.from, msg.subject, text);

  let merchant =
    rule?.canonicalName ??
    normalizeMerchantName(merchantFromSubject(msg.subject) ?? '') ??
    normalizeMerchantName(merchantFromFromHeader(msg.from) ?? '');

  if (!merchant || isGarbageGooglePlayMerchant(merchant)) return null;

  const amountMatch = extractBillingAmount(text) ?? extractLooseAmount(text);
  const hasNotice = /\brenew|upcoming|will be charged|trial end|about to renew\b/i.test(text);
  const hasPayment = /\breceipt|invoice|payment|charged|amount paid|billing\b/i.test(text);

  if (!amountMatch && !hasNotice && !hasPayment) return null;

  const classification = amountMatch || hasPayment ? 'subscription_receipt' : 'subscription_notice';
  const category = rule?.category ?? guessCategory(merchant);

  return {
    gmailMessageId: msg.id,
    receivedAt: msg.receivedAt,
    classification,
    eventType: amountMatch ? 'payment' : 'renewal_notice',
    merchant,
    planTier: null,
    parserSource: 'tier2:fallback',
    amount: amountMatch?.amount ?? null,
    currency: amountMatch?.currency ?? null,
    amountRaw: amountMatch?.raw ?? null,
    cadence: inferCadence(text),
    billingPeriodStart: null,
    billingPeriodEnd: null,
    nextChargeDate: extractNextChargeDate(text),
    paymentMethodHint: extractPaymentHint(text),
    processorName: null,
    processorSubscriptionId: null,
    category,
    confidence: amountMatch ? 0.68 : 0.62,
    evidence: ['fallback_parse', msg.subject.slice(0, 80)],
    rejectionReason: null,
    subject: msg.subject,
    fromAddr: msg.from,
  };
}
