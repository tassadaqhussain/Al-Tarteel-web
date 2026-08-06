import type { DonationCurrency } from '@/lib/api';

/** Guess donor currency from browser locale + timezone (no network). */
export function detectDonationCurrency(): DonationCurrency {
  if (typeof window === 'undefined') return 'usd';

  const locales = [navigator.language, ...(navigator.languages ?? [])]
    .filter(Boolean)
    .map((l) => l.toLowerCase());
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  // Pakistan → PKR
  if (
    locales.some((l) => l === 'ur-pk' || l.endsWith('-pk') || l === 'pk') ||
    tz === 'Asia/Karachi'
  ) {
    return 'pkr';
  }

  // UK → GBP
  if (
    locales.some((l) => l.endsWith('-gb') || l === 'en-uk') ||
    tz === 'Europe/London'
  ) {
    return 'gbp';
  }

  // Eurozone (common locales / zones)
  const euroLocales = ['-de', '-fr', '-es', '-it', '-nl', '-be', '-at', '-ie', '-fi', '-pt', '-gr', '-sk', '-si', '-ee', '-lv', '-lt', '-lu', '-mt', '-cy'];
  const euroZones = [
    'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome',
    'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Dublin',
    'Europe/Helsinki', 'Europe/Lisbon', 'Europe/Athens',
  ];
  if (
    locales.some((l) => euroLocales.some((s) => l.endsWith(s))) ||
    euroZones.includes(tz)
  ) {
    return 'eur';
  }

  return 'usd';
}
