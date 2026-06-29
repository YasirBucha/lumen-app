import type { GmailAccount } from '../types';

export interface MailboxOption {
  id: string;
  label: string;
  email: string;
  color: string;
}

export function buildMailboxOptions(gmailAccounts: GmailAccount[]): MailboxOption[] {
  const connected = gmailAccounts.map((a) => ({
    id: a.id,
    label: a.label ?? a.email.split('@')[0],
    email: a.email,
    color: a.color,
  }));
  if (connected.length === 0) return [];
  return [{ id: 'all', label: 'All Mail', email: '', color: 'all' }, ...connected];
}

export function accountIdFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'primary';
  return local.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'primary';
}
