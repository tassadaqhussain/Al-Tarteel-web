import type { DonationCurrency, DonationInterval } from '@/lib/api';

export const DONATE_TEAL = '#2ca4ab';
export const DONATE_TEAL_DARK = '#238f95';
export const DONATE_DRAFT_KEY = 'qp_donate_draft';

export type DonateMode = 'once' | 'recurring';

export interface DonateDraft {
  amount: number;
  currency: DonationCurrency;
  mode: DonateMode;
  interval?: DonationInterval;
  dedicate?: boolean;
  dedicationName?: string;
}

export interface DonorInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  hideName: boolean;
  asOrganization: boolean;
  organizationName?: string;
}

export function saveDonateDraft(draft: DonateDraft) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(DONATE_DRAFT_KEY, JSON.stringify(draft));
}

export function loadDonateDraft(): DonateDraft | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DONATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DonateDraft;
    if (!parsed?.amount || !parsed?.currency || !parsed?.mode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDonateDraft() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(DONATE_DRAFT_KEY);
}

/** Default billing country from chosen donation currency. */
export function countryFromCurrency(currency: DonationCurrency): string {
  switch (currency) {
    case 'pkr':
      return 'Pakistan';
    case 'gbp':
      return 'United Kingdom';
    case 'eur':
      return 'Germany';
    default:
      return 'United States';
  }
}

export function formatDonateAmount(amount: number, currency: string) {
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
}

export function modeLabel(mode: DonateMode, interval?: DonationInterval) {
  if (mode === 'once') return 'One-Time';
  if (interval === 'week') return 'Weekly';
  if (interval === 'year') return 'Yearly';
  return 'Monthly';
}
