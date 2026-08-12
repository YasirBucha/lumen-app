import type { ParsedCategory } from './types';

const KNOWN_PRODUCTS: { re: RegExp; name: string; category: ParsedCategory }[] = [
  { re: /\byoutube premium\b/i, name: 'YouTube Premium', category: 'streaming' },
  { re: /\byoutube music\b/i, name: 'YouTube Music', category: 'streaming' },
  { re: /\bgoogle one\b/i, name: 'Google One', category: 'cloud' },
  { re: /\bgoogle play pass\b/i, name: 'Google Play Pass', category: 'streaming' },
  { re: /\bgoogle workspace\b/i, name: 'Google Workspace', category: 'software' },
  { re: /\bgoogle drive\b/i, name: 'Google Drive', category: 'cloud' },
  { re: /\bnetflix\b/i, name: 'Netflix', category: 'streaming' },
  { re: /\bspotify\b/i, name: 'Spotify', category: 'streaming' },
  { re: /\bexpressvpn\b/i, name: 'ExpressVPN', category: 'software' },
  { re: /\bchatgpt\b/i, name: 'ChatGPT Plus', category: 'software' },
  { re: /\bnotion\b/i, name: 'Notion', category: 'software' },
  { re: /\badobe\b/i, name: 'Adobe', category: 'software' },
  { re: /\bdisney\+?\b/i, name: 'Disney+', category: 'streaming' },
];

const NOTICE_ONLY = [
  /\bdecreasing the price\b/i,
  /\bincreasing the price\b/i,
  /\bprice (change|update|decrease|increase)\b/i,
];

const EXTRACT_PATTERNS = [
  /(?:subscription|subscribed) to\s+(.{2,55}?)(?:\s+on\s+Google\s+Play|\s+will|\s+has|\s+is|\.\s|$)/i,
  /You(?:'ve| have)?\s+(?:purchased|bought)\s+(?:a\s+)?(?:subscription\s+to\s+)?(.{2,55}?)(?:\s+on\s+Google\s+Play)/i,
  /Your\s+(.{2,55}?)\s+subscription(?:\s+on\s+Google\s+Play)?/i,
  /Receipt for\s+(.{2,55}?)(?:\s+on\s+Google\s+Play|\s+subscription)/i,
];

export function extractGooglePlayOrderId(text: string): string | null {
  const m = text.match(/\b(GPA\.\d{4}-\d{4}-\d{4}-\d{5})\b/);
  return m?.[1] ?? null;
}

function cleanName(raw: string): string | null {
  let s = raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^from\s+/i, '')
    .replace(/^purchase from\s+/i, '')
    .replace(/^your\s+/i, '')
    .replace(/\s+on\s+google\s+play.*$/i, '')
    .replace(/\s+from\s+google\s+digital[^.]*$/i, '')
    .replace(/\s+continues.*$/i, '')
    .replace(/\s+is\s+(decreasing|increasing).*$/i, '')
    .replace(/\s+will\s+renew.*$/i, '')
    .replace(/\s+renewing at.*$/i, '')
    .replace(/\.$/, '')
    .trim();

  if (s.length < 2 || s.length > 50) return null;
  return s;
}

export function isGarbageGooglePlayMerchant(name: string): boolean {
  const s = name.toLowerCase();
  if (/^(from|renewing|purchase|your|the|a|an|y)\b/.test(s)) return true;
  if (/google (digital|play|llc|pay)/i.test(name)) return true;
  if (/continues$/i.test(name)) return true;
  if (/decreasing|increasing the price/i.test(name)) return true;
  if (/^on google play/i.test(s)) return true;
  return false;
}

export function extractGooglePlayMerchant(
  subject: string,
  text: string,
): { merchant: string; category: ParsedCategory; noticeOnly: boolean } | null {
  const hay = `${subject}\n${text}`;
  const noticeOnly = NOTICE_ONLY.some((r) => r.test(hay));

  for (const k of KNOWN_PRODUCTS) {
    if (k.re.test(hay)) {
      return { merchant: k.name, category: k.category, noticeOnly };
    }
  }

  for (const p of EXTRACT_PATTERNS) {
    const m = hay.match(p);
    if (!m?.[1]) continue;
    const cleaned = cleanName(m[1]);
    if (!cleaned || isGarbageGooglePlayMerchant(cleaned)) continue;
    const known = KNOWN_PRODUCTS.find((k) => k.re.test(cleaned));
    return {
      merchant: known?.name ?? cleaned,
      category: known?.category ?? 'other',
      noticeOnly,
    };
  }

  return null;
}

export function normalizeMerchantName(name: string): string | null {
  const cleaned = cleanName(name) ?? name.trim();
  if (!cleaned || isGarbageGooglePlayMerchant(cleaned)) return null;

  const known = KNOWN_PRODUCTS.find((k) => k.re.test(cleaned));
  if (known) return known.name;

  return cleaned
    .split(' ')
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}
