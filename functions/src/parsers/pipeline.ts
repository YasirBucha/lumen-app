import type { GmailMessageLite, ReceiptEvent, ReceiptEventType } from './types';
import { classifyEmail, combinedText, globalRejectReason } from './classifier';
import {
  extractBillingAmount,
  extractNextChargeDate,
  extractPaymentHint,
  inferCadence,
} from './amount';
import {
  amountSanity,
  findMerchantRule,
  findProcessor,
} from './registry';
import {
  extractGooglePlayMerchant,
  extractGooglePlayOrderId,
  isGarbageGooglePlayMerchant,
  normalizeMerchantName,
} from './googlePlay';
import { geminiParseToEvent } from '../geminiParser';
import { fallbackParse } from './fallback';

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractProcessorMerchant(
  subject: string,
  body: string,
  processorId: string,
): { merchant: string; category: ReceiptEvent['category']; noticeOnly: boolean } | null {
  if (processorId === 'google_play') {
    return extractGooglePlayMerchant(subject, body);
  }

  const text = `${subject}\n${body}`;
  if (processorId === 'apple') {
    if (/icloud\+?/i.test(text)) return { merchant: 'iCloud+', category: 'cloud', noticeOnly: false };
    if (/apple music/i.test(text)) return { merchant: 'Apple Music', category: 'streaming', noticeOnly: false };
  }

  if (processorId === 'stripe') {
    const m = text.match(/(?:receipt from|Invoice from|Subscription to)\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})/i);
    if (m?.[1]) return { merchant: m[1].trim(), category: 'other', noticeOnly: false };
  }

  if (processorId === 'paypal') {
    const m = text.match(/(?:You paid|Payment to)\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})/i);
    if (m?.[1]) return { merchant: m[1].trim(), category: 'other', noticeOnly: false };
  }

  return null;
}

function extractProcessorSubId(body: string, processorId: string): string | null {
  if (processorId === 'google_play') {
    return extractGooglePlayOrderId(body);
  }
  const m = body.match(/\b(sub_[a-zA-Z0-9]+)\b/);
  return m?.[1] ?? null;
}

function eventTypeFor(classification: string, text: string): ReceiptEventType {
  if (/\bprice (change|increase)\b/i.test(text)) return 'price_change';
  if (/\btrial end/i.test(text)) return 'trial_ending';
  if (classification === 'subscription_notice') return 'renewal_notice';
  if (/\bpayment|receipt|charged|invoice\b/i.test(text)) return 'payment';
  return 'unknown';
}

function parseWithRegistry(msg: GmailMessageLite, classification: 'subscription_receipt' | 'subscription_notice'): ReceiptEvent | null {
  const text = combinedText(msg);
  const reject = globalRejectReason(text);
  if (reject) return null;

  const processor = findProcessor(msg.from);
  let merchant: string | null = null;
  let planTier: string | null = null;
  let category = 'other' as ReceiptEvent['category'];
  let parserSource = 'tier2';
  let noticeOnly = false;

  if (processor) {
    const extracted = extractProcessorMerchant(msg.subject, text, processor.id);
    if (extracted) {
      merchant = extracted.merchant;
      category = extracted.category;
      noticeOnly = extracted.noticeOnly;
      parserSource = `tier2:processor:${processor.id}`;
    }
  }

  const rule = findMerchantRule(msg.from, msg.subject, text);
  if (rule) {
    if (rule.hardReject.some((r) => r.test(text))) return null;
    // Registry canonical name wins over messy processor extract
    merchant = rule.canonicalName;
    category = rule.category;
    parserSource = `tier2:merchant:${rule.id}`;
    if (rule.planPatterns) {
      for (const p of rule.planPatterns) {
        const m = text.match(p);
        if (m) {
          planTier = m[0];
          break;
        }
      }
    }
  }

  if (!merchant && processor) {
    return null;
  }

  if (merchant) {
    merchant = normalizeMerchantName(merchant);
    if (!merchant || isGarbageGooglePlayMerchant(merchant)) return null;
  }

  const amountMatch = extractBillingAmount(text);
  const cadence =
    rule?.cadenceHints?.find((h) => h.pattern.test(text))?.cadence ?? inferCadence(text);
  const nextChargeDate = extractNextChargeDate(text);
  const paymentMethodHint = extractPaymentHint(text);
  const processorSubscriptionId = processor
    ? extractProcessorSubId(text, processor.id)
    : extractProcessorSubId(text, 'stripe');

  const eventType = noticeOnly ? 'renewal_notice' : eventTypeFor(classification, text);

  if (classification === 'subscription_receipt' && !amountMatch && !noticeOnly) {
    return null;
  }

  if (amountMatch && merchant && !amountSanity(merchant, amountMatch.amount, amountMatch.currency)) {
    if (!noticeOnly && !rule) return null;
  }

  if (!merchant) return null;

  const confidence =
    amountMatch && rule ? 0.92 : amountMatch ? 0.85 : classification === 'subscription_notice' ? 0.75 : 0.7;

  return {
    gmailMessageId: msg.id,
    receivedAt: msg.receivedAt,
    classification,
    eventType,
    merchant,
    planTier,
    parserSource,
    amount: amountMatch?.amount ?? null,
    currency: amountMatch?.currency ?? null,
    amountRaw: amountMatch?.raw ?? null,
    cadence,
    billingPeriodStart: null,
    billingPeriodEnd: null,
    nextChargeDate,
    paymentMethodHint,
    processorName: processor?.name ?? null,
    processorSubscriptionId,
    category,
    confidence,
    evidence: [amountMatch ? `amount:${amountMatch.raw}` : 'notice_only', parserSource],
    rejectionReason: null,
    subject: msg.subject,
    fromAddr: msg.from,
  };
}

function rejectedEvent(msg: GmailMessageLite, reason: string): ReceiptEvent {
  return {
    gmailMessageId: msg.id,
    receivedAt: msg.receivedAt,
    classification: 'not_subscription',
    eventType: 'unknown',
    merchant: null,
    planTier: null,
    parserSource: 'tier1:classifier',
    amount: null,
    currency: null,
    amountRaw: null,
    cadence: null,
    billingPeriodStart: null,
    billingPeriodEnd: null,
    nextChargeDate: null,
    paymentMethodHint: null,
    processorName: null,
    processorSubscriptionId: null,
    category: 'other',
    confidence: 0,
    evidence: [],
    rejectionReason: reason,
    subject: msg.subject,
    fromAddr: msg.from,
  };
}

/** Classify → parse → ReceiptEvent (never a Subscription doc). */
export async function processEmailToReceiptEvent(
  msg: GmailMessageLite,
  geminiKey?: string,
): Promise<ReceiptEvent> {
  let { classification, reason } = classifyEmail(msg);

  // Gmail already filtered billing mail — trust known senders even without receipt keywords
  if (classification === 'not_subscription') {
    const text = combinedText(msg);
    if (findMerchantRule(msg.from, msg.subject, text) || findProcessor(msg.from)) {
      classification = 'subscription_receipt';
      reason = 'trusted_sender';
    } else if (/\b(subscription|membership|renew|billing|invoice|receipt|premium|plan)\b/i.test(text)) {
      classification = 'subscription_notice';
      reason = 'broad_billing_keyword';
    }
  }

  if (classification === 'not_subscription') {
    return rejectedEvent(msg, reason);
  }

  const tier2 = parseWithRegistry(msg, classification);
  if (tier2) return tier2;

  const fallback = fallbackParse(msg);
  if (fallback) return fallback;

  if (geminiKey) {
    const gemini = await geminiParseToEvent(msg, geminiKey, combinedText(msg));
    if (gemini) return gemini;
  }

  return rejectedEvent(msg, 'no_parser_match');
}

export { slug };
