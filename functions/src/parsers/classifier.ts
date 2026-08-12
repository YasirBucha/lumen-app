import type { GmailMessageLite } from './types';
import { findMerchantRule, findProcessor } from './registry';

/** Global reject — never parse if any match (subject + body). */
export const GLOBAL_REJECT_PATTERNS: RegExp[] = [
  /\bsecurity code\b/i,
  /\blogin code\b/i,
  /\bverification code\b/i,
  /\bfinish login\b/i,
  /\bpassword reset\b/i,
  /\breset your password\b/i,
  /\bdev news\b/i,
  /\bnewsletter\b/i,
  /\bproduct launch\b/i,
  /\bintroducing\b/i,
  /\bapi account has been funded\b/i,
  /\baccount has been funded\b/i,
  /\btop[- ]?up\b/i,
  /\bcredits added\b/i,
  /\bshipping confirmation\b/i,
  /\border delivered\b/i,
  /\byour order has shipped\b/i,
  /\blimited time offer\b/i,
  /\bpromo code\b/i,
  /\bspecial offer\b/i,
  // Do NOT reject on "unsubscribe" — appears in every marketing footer
  /\b2x usage limits\b/i,
  /\btips from openai\b/i,
];

export const RECEIPT_POSITIVE_PATTERNS: RegExp[] = [
  /\breceipt\b/i,
  /\binvoice\b/i,
  /\bpayment received\b/i,
  /\bpayment confirmation\b/i,
  /\bamount paid\b/i,
  /\bcharged\b/i,
  /\bsubscription renew/i,
  /\brenewal\b/i,
  /\bsubscription is about to renew\b/i,
  /\btrial ending\b/i,
  /\bprice (change|increase)\b/i,
  /\bbilling statement\b/i,
  /\bsubscription confirmed\b/i,
  /\bmembership\b/i,
  /\bbilled\b/i,
  /\bbilling\b/i,
  /\bstatement\b/i,
  /\bpremium\b/i,
  /\bmembership renew/i,
  /\byour plan\b/i,
  /\bfee challan\b/i,
  /\btuition\b/i,
];

export const NOTICE_POSITIVE_PATTERNS: RegExp[] = [
  /\babout to renew\b/i,
  /\brenewal reminder\b/i,
  /\bupcoming charge\b/i,
  /\bwill be charged\b/i,
  /\btrial ends\b/i,
  /\bauto[- ]?renew\b/i,
];

export function combinedText(msg: GmailMessageLite): string {
  return `${msg.subject}\n${msg.snippet}\n${msg.bodyText}`.slice(0, 12000);
}

export function globalRejectReason(text: string): string | null {
  for (const p of GLOBAL_REJECT_PATTERNS) {
    if (p.test(text)) return `global_reject:${p.source}`;
  }
  return null;
}

export function classifyEmail(msg: GmailMessageLite): {
  classification: 'subscription_receipt' | 'subscription_notice' | 'not_subscription';
  reason: string;
} {
  const text = combinedText(msg);
  const reject = globalRejectReason(text);
  if (reject) return { classification: 'not_subscription', reason: reject };

  const hasReceipt = RECEIPT_POSITIVE_PATTERNS.some((p) => p.test(text));
  const hasNotice = NOTICE_POSITIVE_PATTERNS.some((p) => p.test(text));

  if (hasReceipt) return { classification: 'subscription_receipt', reason: 'receipt_signal' };
  if (hasNotice) return { classification: 'subscription_notice', reason: 'notice_signal' };

  return { classification: 'not_subscription', reason: 'no_billing_signal' };
}

export function isBillingLike(msg: GmailMessageLite): boolean {
  if (classifyEmail(msg).classification !== 'not_subscription') return true;
  if (findProcessor(msg.from)) return true;
  if (findMerchantRule(msg.from, msg.subject, `${msg.snippet} ${msg.bodyText}`)) return true;
  return false;
}
