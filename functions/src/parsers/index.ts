export { processEmailToReceiptEvent } from './pipeline';
export { buildSubscriptionsFromEvents, computeSubId } from './merge';
export { classifyEmail, isBillingLike } from './classifier';
export type { ReceiptEvent, GmailMessageLite, EmailClass } from './types';
