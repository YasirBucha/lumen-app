export type ParsedCadence = 'monthly' | 'yearly' | 'weekly' | 'one-time';
export type ParsedCategory =
  | 'streaming'
  | 'software'
  | 'cloud'
  | 'education'
  | 'shopping'
  | 'other';

export type EmailClass = 'subscription_receipt' | 'subscription_notice' | 'not_subscription';

export type ReceiptEventType =
  | 'payment'
  | 'renewal_notice'
  | 'price_change'
  | 'trial_ending'
  | 'unknown';

export interface GmailMessageLite {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  bodyText: string;
  receivedAt: string;
}

/** Parser output — never written directly as a subscription doc. */
export interface ReceiptEvent {
  gmailMessageId: string;
  receivedAt: string;
  classification: EmailClass;
  eventType: ReceiptEventType;
  merchant: string | null;
  planTier: string | null;
  parserSource: string;
  amount: number | null;
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP' | null;
  amountRaw: string | null;
  cadence: ParsedCadence | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  nextChargeDate: string | null;
  paymentMethodHint: string | null;
  processorName: string | null;
  processorSubscriptionId: string | null;
  category: ParsedCategory;
  confidence: number;
  evidence: string[];
  rejectionReason: string | null;
  subject: string;
  fromAddr: string;
}

export interface MerchantRule {
  id: string;
  canonicalName: string;
  category: ParsedCategory;
  senderDomains: RegExp[];
  subjectPositive: RegExp[];
  bodyPositive?: RegExp[];
  hardReject: RegExp[];
  planPatterns?: RegExp[];
  cadenceHints?: { pattern: RegExp; cadence: ParsedCadence }[];
  amountRangeUSD?: { min: number; max: number };
  amountRangePKR?: { min: number; max: number };
}

export interface ProcessorRule {
  id: string;
  name: string;
  senderDomains: RegExp[];
  merchantFromBody: RegExp[];
}

export interface AmountMatch {
  amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP';
  raw: string;
  label: string;
}

/** @deprecated legacy shape — kept for gemini bridge */
export interface ParseResult {
  isSubscription: boolean;
  merchant: string;
  amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP' | null;
  cadence: ParsedCadence | null;
  category: ParsedCategory;
  confidence: number;
  notes?: string;
}
