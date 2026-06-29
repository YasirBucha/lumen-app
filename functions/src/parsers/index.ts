import type { MerchantParser, ParseResult } from './types';

function baseResult(partial: Partial<ParseResult> & Pick<ParseResult, 'merchant' | 'confidence'>): ParseResult {
  return {
    isSubscription: true,
    amount: 0,
    currency: null,
    cadence: null,
    category: 'other',
    notes: '',
    ...partial,
  };
}

function extractAmount(text: string): { amount: number; currency: ParseResult['currency'] } | null {
  const usd = text.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
  if (usd) return { amount: parseFloat(usd[1].replace(/,/g, '')), currency: 'USD' };

  const pkr = text.match(/(?:PKR|Rs\.?)\s?([\d,]+(?:\.\d{2})?)/i);
  if (pkr) return { amount: parseFloat(pkr[1].replace(/,/g, '')), currency: 'PKR' };

  return null;
}

export const netflix: MerchantParser = {
  id: 'netflix',
  matches: (msg) => /netflix/i.test(msg.from) || /netflix/i.test(msg.subject),
  parse: (msg) => {
    const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
    if (!amount) return null;
    return baseResult({
      merchant: 'Netflix',
      amount: amount.amount,
      currency: amount.currency,
      cadence: /year|annual/i.test(msg.bodyText) ? 'yearly' : 'monthly',
      category: 'streaming',
      confidence: 0.92,
    });
  },
};

export const spotify: MerchantParser = {
  id: 'spotify',
  matches: (msg) => /spotify/i.test(msg.from) || /spotify/i.test(msg.subject),
  parse: (msg) => {
    const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
    if (!amount) return null;
    return baseResult({
      merchant: 'Spotify',
      amount: amount.amount,
      currency: amount.currency,
      cadence: /year|annual/i.test(msg.bodyText) ? 'yearly' : 'monthly',
      category: 'streaming',
      confidence: 0.9,
    });
  },
};

export const chatgpt: MerchantParser = {
  id: 'chatgpt',
  matches: (msg) => /openai|chatgpt/i.test(msg.from) || /chatgpt|openai/i.test(msg.subject),
  parse: (msg) => {
    const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
    if (!amount) return null;
    return baseResult({
      merchant: 'ChatGPT Plus',
      amount: amount.amount,
      currency: amount.currency,
      cadence: 'monthly',
      category: 'software',
      confidence: 0.88,
    });
  },
};

export const notion: MerchantParser = {
  id: 'notion',
  matches: (msg) => /notion/i.test(msg.from) || /notion/i.test(msg.subject),
  parse: (msg) => {
    const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
    if (!amount) return null;
    return baseResult({
      merchant: 'Notion',
      amount: amount.amount,
      currency: amount.currency,
      cadence: 'monthly',
      category: 'software',
      confidence: 0.86,
    });
  },
};

export const amazon: MerchantParser = {
  id: 'amazon',
  matches: (msg) => /amazon/i.test(msg.from) && /prime|subscription|renew/i.test(`${msg.subject} ${msg.bodyText}`),
  parse: (msg) => {
    const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
    if (!amount) return null;
    return baseResult({
      merchant: 'Amazon Prime',
      amount: amount.amount,
      currency: amount.currency,
      cadence: /year|annual/i.test(msg.bodyText) ? 'yearly' : 'monthly',
      category: 'shopping',
      confidence: 0.84,
    });
  },
};

function domainParser(
  id: string,
  merchant: string,
  category: ParseResult['category'],
  patterns: RegExp[],
): MerchantParser {
  return {
    id,
    matches: (msg) => patterns.some((p) => p.test(msg.from) || p.test(msg.subject)),
    parse: (msg) => {
      const amount = extractAmount(`${msg.subject} ${msg.bodyText}`);
      if (!amount) return null;
      return baseResult({
        merchant,
        amount: amount.amount,
        currency: amount.currency,
        cadence: /year|annual/i.test(msg.bodyText) ? 'yearly' : 'monthly',
        category,
        confidence: 0.82,
      });
    },
  };
}

export const disney = domainParser('disney', 'Disney+', 'streaming', [/disney/i, /hotstar/i]);
export const dropbox = domainParser('dropbox', 'Dropbox', 'cloud', [/dropbox/i]);
export const adobe = domainParser('adobe', 'Adobe Creative Cloud', 'software', [/adobe/i]);
export const icloud = domainParser('icloud', 'iCloud+', 'cloud', [/apple/i, /icloud/i]);
export const daraz = domainParser('daraz', 'Daraz', 'shopping', [/daraz/i]);

export const PARSERS: MerchantParser[] = [
  netflix,
  spotify,
  chatgpt,
  notion,
  amazon,
  disney,
  dropbox,
  adobe,
  icloud,
  daraz,
];
