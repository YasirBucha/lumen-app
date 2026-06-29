import type { AiTone, Subscription } from '../types';

export function verdictHeadline(sub: Subscription, tone: AiTone): string {
  if (tone === 'conversational') {
    if (sub.verdict === 'keep') return `Looks like ${sub.merchant} earns its keep.`;
    if (sub.verdict === 'review') return `${sub.merchant} is borderline — worth a closer look.`;
    return `${sub.merchant} isn't earning its renewal anymore.`;
  }
  if (tone === 'confident') {
    if (sub.verdict === 'keep') return `Keep ${sub.merchant}.`;
    if (sub.verdict === 'review') return `Review ${sub.merchant}.`;
    return `Cancel ${sub.merchant}.`;
  }
  if (sub.verdict === 'keep') return `Usage and pricing support keeping this active.`;
  if (sub.verdict === 'review') return `Usage is uneven against the price.`;
  return `Usage has dropped well below the renewal cost.`;
}
