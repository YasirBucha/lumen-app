export type Verdict = 'keep' | 'review' | 'cancel';
export type SubStatus = 'active' | 'past' | 'cancelled';
export type Cycle = 'monthly' | 'yearly' | 'weekly';
export type Category =
  | 'streaming'
  | 'productivity'
  | 'cloud'
  | 'school'
  | 'ecommerce'
  | 'bills';
export type CardKind = 'visa' | 'mc' | 'amex' | 'unionp';
export type Theme = 'light' | 'dark';
export type Accent = 'oxblood' | 'ink' | 'olive' | 'burnt';
export type AiTone = 'quiet' | 'confident' | 'conversational';

export interface GmailAccount {
  id: string;
  label?: string;
  email: string;
  color: string;
  lastSyncAt?: string;
  status: 'synced' | 'syncing' | 'error';
}

export interface SharedMember {
  initial: string;
  label: string;
  color: string;
  you?: boolean;
  empty?: boolean;
}

export interface SharedWith {
  plan: string;
  members: SharedMember[];
  note: string;
}

export interface PriceIncrease {
  fromPKR: number;
  toPKR: number;
  fromUSD: number;
  toUSD: number;
  date: string;
  emailDate: string;
}

export interface HistoryEntry {
  date: string;
  pkr: number;
  usd: number;
  status: 'paid' | 'failed';
}

export interface Subscription {
  id: string;
  merchant: string;
  glyph: string;
  glyphBg: string;
  category: Category;
  cycle: Cycle;
  amountPKR: number;
  amountUSD: number;
  account: string;
  card: CardKind;
  last4: string;
  nextCharge: string;
  since: string;
  status: SubStatus;
  verdict: Verdict;
  evidence: string[];
  usage: { sessionsLast30: number; lastUsed: string };
  priceIncrease?: PriceIncrease;
  sharedWith?: SharedWith;
  history: HistoryEntry[];
}

export interface UserPreferences {
  currency: 'PKR' | 'USD';
  aiTone: AiTone;
  theme: Theme;
  accent: Accent;
  notifications: boolean;
  geminiApiKey?: string;
  tourDone: boolean;
  cancelledIds: string[];
}

export interface CategoryMeta {
  id: Category;
  label: string;
  swatch: string;
}

export interface CardKindMeta {
  label: string;
  last4Style: string;
  tint: [string, string];
  chip: string;
}

export interface TrendPoint {
  month: string;
  pkr: number;
}

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  borderHi: string;
  accent: string;
  accentInk: string;
  good: string;
  review: string;
  cancel: string;
}
