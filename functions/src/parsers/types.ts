export type ParsedCadence = 'monthly' | 'yearly' | 'weekly' | 'one-time';
export type ParsedCategory =
  | 'streaming'
  | 'software'
  | 'cloud'
  | 'education'
  | 'shopping'
  | 'other';

export interface GmailMessageLite {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  bodyText: string;
  receivedAt: string;
}

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

export interface MerchantParser {
  id: string;
  matches: (msg: GmailMessageLite) => boolean;
  parse: (msg: GmailMessageLite) => ParseResult | null;
}
