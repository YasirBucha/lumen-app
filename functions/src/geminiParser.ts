import type { GmailMessageLite, ReceiptEvent } from './parsers/types';
import { amountSanity, findMerchantRule } from './parsers/registry';
import { extractBillingAmount, inferCadence, extractNextChargeDate } from './parsers/amount';
import { globalRejectReason } from './parsers/classifier';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

type GeminiPayload = {
  is_subscription?: boolean;
  merchant?: string;
  amount?: number;
  currency?: 'PKR' | 'USD' | 'EUR' | 'GBP' | null;
  cadence?: 'monthly' | 'yearly' | 'weekly' | 'one-time' | null;
  category?: ReceiptEvent['category'];
  confidence?: number;
  notes?: string;
  event_type?: string;
};

/** Gemini suggests — strict validation before accepting. */
export async function geminiParseToEvent(
  msg: GmailMessageLite,
  apiKey: string,
  sourceText: string,
): Promise<ReceiptEvent | null> {
  if (globalRejectReason(sourceText)) return null;

  const prompt = `You extract structured subscription billing data from email receipts.
Reply with JSON only. Schema:
{
  "is_subscription": boolean,
  "merchant": string,
  "amount": number,
  "currency": "PKR" | "USD" | "EUR" | "GBP" | null,
  "cadence": "monthly" | "yearly" | "weekly" | "one-time" | null,
  "category": "streaming" | "software" | "cloud" | "education" | "shopping" | "other",
  "confidence": 0.0-1.0,
  "event_type": "payment" | "renewal_notice" | "price_change" | "trial_ending",
  "notes": string
}
If this is not a subscription receipt or renewal notice, return {"is_subscription": false}.

Subject: ${msg.subject}
From: ${msg.from}
Body: ${sourceText.slice(0, 4000)}`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  let parsed: GeminiPayload;
  try {
    parsed = JSON.parse(text) as GeminiPayload;
  } catch {
    return null;
  }

  if (!parsed.is_subscription || !parsed.merchant) return null;
  if ((parsed.confidence ?? 0) < 0.75) return null;

  const cadence = parsed.cadence ?? inferCadence(sourceText);
  if (!cadence || cadence === 'one-time') {
    if (parsed.event_type !== 'renewal_notice') return null;
  }

  const bodyAmount = extractBillingAmount(sourceText);
  if (!bodyAmount && parsed.event_type !== 'renewal_notice') return null;

  const amount = bodyAmount?.amount ?? parsed.amount ?? null;
  const currency = bodyAmount?.currency ?? parsed.currency ?? null;

  if (amount == null || !currency) {
    if (parsed.event_type !== 'renewal_notice') return null;
  }

  if (amount != null && currency && !amountSanity(parsed.merchant, amount, currency)) {
    return null;
  }

  if (bodyAmount && parsed.amount != null) {
    const delta = Math.abs(parsed.amount - bodyAmount.amount);
    if (delta > Math.max(1, bodyAmount.amount * 0.05)) return null;
  }

  const rule = findMerchantRule(msg.from, msg.subject, sourceText);
  if (rule?.hardReject.some((r) => r.test(sourceText))) return null;

  const classification =
    parsed.event_type === 'renewal_notice' ? 'subscription_notice' : 'subscription_receipt';

  return {
    gmailMessageId: msg.id,
    receivedAt: msg.receivedAt,
    classification,
    eventType:
      parsed.event_type === 'renewal_notice'
        ? 'renewal_notice'
        : parsed.event_type === 'price_change'
          ? 'price_change'
          : 'payment',
    merchant: parsed.merchant,
    planTier: null,
    parserSource: 'tier3:gemini',
    amount,
    currency,
    amountRaw: bodyAmount?.raw ?? (amount != null ? String(amount) : null),
    cadence: cadence ?? null,
    billingPeriodStart: null,
    billingPeriodEnd: null,
    nextChargeDate: extractNextChargeDate(sourceText),
    paymentMethodHint: null,
    processorName: null,
    processorSubscriptionId: null,
    category: parsed.category ?? rule?.category ?? 'other',
    confidence: parsed.confidence ?? 0.75,
    evidence: [`gemini:${parsed.notes ?? 'accepted'}`, bodyAmount ? `amount:${bodyAmount.raw}` : 'notice'],
    rejectionReason: null,
    subject: msg.subject,
    fromAddr: msg.from,
  };
}
