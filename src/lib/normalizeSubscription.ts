import { FX } from './seedData';
import type { Category, Subscription } from '../types';

const CATEGORY_MAP: Record<string, Category> = {
  streaming: 'streaming',
  software: 'productivity',
  productivity: 'productivity',
  cloud: 'cloud',
  education: 'school',
  school: 'school',
  shopping: 'ecommerce',
  ecommerce: 'ecommerce',
  bills: 'bills',
  other: 'bills',
};

function glyphColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 42%)`;
}

export function normalizeSubscription(id: string, raw: Record<string, unknown>): Subscription {
  const merchant = String(raw.merchant ?? id);
  const currency = (raw.currency as string) ?? 'USD';
  const amountOrig = Number(raw.amountOrig ?? raw.amountUSD ?? raw.amountPKR ?? 0);
  let amountPKR = Number(raw.amountPKR ?? 0);
  let amountUSD = Number(raw.amountUSD ?? 0);
  if (!amountPKR && amountOrig) {
    amountPKR = currency === 'PKR' ? amountOrig : Math.round(amountOrig * FX);
  }
  if (!amountUSD && amountOrig) {
    amountUSD = currency === 'USD' ? amountOrig : amountOrig / FX;
  }
  if (!amountPKR && amountUSD) amountPKR = Math.round(amountUSD * FX);

  const categoryRaw = String(raw.category ?? 'bills');
  const category = CATEGORY_MAP[categoryRaw] ?? 'bills';
  const cycle = (raw.cycle as Subscription['cycle']) ?? 'monthly';
  const now = new Date();
  const nextCharge =
    typeof raw.nextCharge === 'string'
      ? raw.nextCharge
      : new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0, 10);

  return {
    id,
    merchant,
    glyph: String(raw.glyph ?? merchant.charAt(0).toUpperCase()),
    glyphBg: String(raw.glyphBg ?? glyphColor(merchant)),
    category,
    cycle,
    amountPKR,
    amountUSD,
    account: String(raw.account ?? 'primary'),
    card: (raw.card as Subscription['card']) ?? 'visa',
    last4: String(raw.last4 ?? '0000'),
    nextCharge,
    since: String(raw.since ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`),
    status: (raw.status as Subscription['status']) ?? 'active',
    verdict: (raw.verdict as Subscription['verdict']) ?? 'review',
    evidence: Array.isArray(raw.evidence) ? (raw.evidence as string[]) : ['Parsed from Gmail receipt'],
    usage:
      raw.usage && typeof raw.usage === 'object'
        ? (raw.usage as Subscription['usage'])
        : { sessionsLast30: 0, lastUsed: 'Unknown' },
    history: Array.isArray(raw.history) ? (raw.history as Subscription['history']) : [],
  };
}
