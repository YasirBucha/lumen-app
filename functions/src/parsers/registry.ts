import type { MerchantRule, ProcessorRule } from './types';

const OPENAI_REJECT: RegExp[] = [
  /\bdev news\b/i,
  /\bapi account has been funded\b/i,
  /\bintroducing gpt\b/i,
  /\bcodex\b/i,
  /\b2x usage\b/i,
  /\btips from openai\b/i,
];

export const PROCESSOR_RULES: ProcessorRule[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    senderDomains: [/stripe\.com/i, /mail\.stripe\.com/i],
    merchantFromBody: [
      /(?:receipt from|Invoice from|Subscription to)\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})/i,
      /for\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})\s+subscription/i,
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    senderDomains: [/paypal\.com/i],
    merchantFromBody: [
      /You paid\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})/i,
      /Payment to\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,40})/i,
    ],
  },
  {
    id: 'google_play',
    name: 'Google Play',
    senderDomains: [/google\.com/i, /pay\.google\.com/i, /payments\.google\.com/i],
    merchantFromBody: [
      /(?:Subscription|subscribed to)\s+([A-Za-z0-9][A-Za-z0-9 .&+'-]{2,50})/i,
      /YouTube Premium/i,
      /Google One/i,
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    senderDomains: [/apple\.com/i, /email\.apple\.com/i],
    merchantFromBody: [
      /iCloud\+?/i,
      /Apple Music/i,
      /Subscription Confirmation/i,
    ],
  },
];

export const MERCHANT_REGISTRY: MerchantRule[] = [
  {
    id: 'netflix',
    canonicalName: 'Netflix',
    category: 'streaming',
    senderDomains: [/netflix\.com/i],
    subjectPositive: [/netflix/i, /receipt/i, /payment/i],
    hardReject: [],
    amountRangeUSD: { min: 5, max: 30 },
    amountRangePKR: { min: 800, max: 5000 },
    cadenceHints: [{ pattern: /annual|year/i, cadence: 'yearly' }],
  },
  {
    id: 'spotify',
    canonicalName: 'Spotify',
    category: 'streaming',
    senderDomains: [/spotify\.com/i],
    subjectPositive: [/spotify/i, /receipt/i, /subscription/i],
    hardReject: [],
    amountRangeUSD: { min: 3, max: 25 },
  },
  {
    id: 'chatgpt_plus',
    canonicalName: 'ChatGPT Plus',
    category: 'software',
    senderDomains: [/openai\.com/i],
    subjectPositive: [/chatgpt plus/i, /plus subscription/i, /subscription receipt/i, /payment received/i],
    hardReject: OPENAI_REJECT,
    amountRangeUSD: { min: 15, max: 25 },
    amountRangePKR: { min: 3500, max: 8000 },
    planPatterns: [/chatgpt plus/i, /plus plan/i],
  },
  {
    id: 'notion',
    canonicalName: 'Notion',
    category: 'software',
    senderDomains: [/notion\.so/i, /makenotion\.com/i],
    subjectPositive: [/notion/i, /receipt/i, /invoice/i],
    hardReject: [],
    amountRangeUSD: { min: 5, max: 50 },
  },
  {
    id: 'dropbox',
    canonicalName: 'Dropbox',
    category: 'cloud',
    senderDomains: [/dropbox\.com/i],
    subjectPositive: [/dropbox/i, /subscription/i, /renew/i, /receipt/i],
    hardReject: [/\bsecurity code\b/i, /\blogin\b/i],
    amountRangeUSD: { min: 8, max: 250 },
    planPatterns: [/dropbox plus/i, /dropbox professional/i],
  },
  {
    id: 'disney',
    canonicalName: 'Disney+',
    category: 'streaming',
    senderDomains: [/disney/i, /hotstar/i],
    subjectPositive: [/disney|hotstar/i, /subscription|receipt|renew/i],
    hardReject: [],
    amountRangeUSD: { min: 3, max: 20 },
  },
  {
    id: 'adobe',
    canonicalName: 'Adobe Creative Cloud',
    category: 'software',
    senderDomains: [/adobe\.com/i],
    subjectPositive: [/adobe/i, /receipt|invoice|subscription/i],
    hardReject: [],
    amountRangeUSD: { min: 10, max: 120 },
  },
  {
    id: 'icloud',
    canonicalName: 'iCloud+',
    category: 'cloud',
    senderDomains: [/apple\.com/i, /email\.apple\.com/i],
    subjectPositive: [/icloud/i, /subscription|receipt/i],
    hardReject: [],
    amountRangeUSD: { min: 1, max: 20 },
  },
  {
    id: 'amazon_prime',
    canonicalName: 'Amazon Prime',
    category: 'shopping',
    senderDomains: [/amazon\./i],
    subjectPositive: [/prime/i, /subscription|renew|receipt/i],
    hardReject: [/order shipped/i, /delivered/i],
    amountRangeUSD: { min: 5, max: 180 },
  },
  {
    id: 'daraz',
    canonicalName: 'Daraz',
    category: 'shopping',
    senderDomains: [/daraz\./i],
    subjectPositive: [/daraz/i, /subscription|membership/i],
    hardReject: [],
    amountRangePKR: { min: 100, max: 5000 },
  },
  {
    id: 'youtube_premium',
    canonicalName: 'YouTube Premium',
    category: 'streaming',
    senderDomains: [/google\.com/i, /youtube\.com/i],
    subjectPositive: [/youtube premium/i, /subscription confirmed/i],
    hardReject: [],
    amountRangeUSD: { min: 7, max: 25 },
  },
  {
    id: 'lgs',
    canonicalName: 'LGS Defence',
    category: 'education',
    senderDomains: [/lgs/i],
    subjectPositive: [/tuition|fee|challan|invoice/i],
    hardReject: [],
    amountRangePKR: { min: 5000, max: 500000 },
    cadenceHints: [{ pattern: /month/i, cadence: 'monthly' }],
  },
  {
    id: 'beaconhouse',
    canonicalName: 'Beaconhouse',
    category: 'education',
    senderDomains: [/beaconhouse/i],
    subjectPositive: [/tuition|fee|challan|invoice/i],
    hardReject: [],
    amountRangePKR: { min: 5000, max: 500000 },
  },
];

export function findMerchantRule(from: string, subject: string, body: string): MerchantRule | null {
  const hay = `${from} ${subject} ${body}`;
  for (const rule of MERCHANT_REGISTRY) {
    const domainHit = rule.senderDomains.some((d) => d.test(from));
    const subjectHit = rule.subjectPositive.some((p) => p.test(subject) || p.test(hay));
    if (!domainHit && !subjectHit) continue;
    if (rule.hardReject.some((r) => r.test(hay))) continue;
    return rule;
  }
  return null;
}

export function findProcessor(from: string): ProcessorRule | null {
  return PROCESSOR_RULES.find((p) => p.senderDomains.some((d) => d.test(from))) ?? null;
}

export function amountSanity(
  merchant: string,
  amount: number,
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP',
): boolean {
  const rule = MERCHANT_REGISTRY.find((r) => r.canonicalName === merchant);
  if (!rule) return amount > 0 && amount < 500000;

  const usd = currency === 'USD' ? amount : currency === 'PKR' ? amount / 278 : amount;
  const pkr = currency === 'PKR' ? amount : Math.round(usd * 278);

  if (rule.amountRangeUSD && currency !== 'PKR') {
    if (usd < rule.amountRangeUSD.min || usd > rule.amountRangeUSD.max) return false;
  }
  if (rule.amountRangePKR && currency === 'PKR') {
    if (pkr < rule.amountRangePKR.min || pkr > rule.amountRangePKR.max) return false;
  }
  return true;
}
