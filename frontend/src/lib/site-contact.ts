/**
 * Site contact & maintainer configuration.
 *
 * TODO: Set NEXT_PUBLIC_CONTACT_EMAIL in production env (or update the fallback below)
 * to your real support/editorial inbox.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'contact@quranpilot.com';

/**
 * TODO: Edit or expand this maintainer bio block as needed.
 */
export const MAINTAINER_INFO = {
  summary:
    'QuranPilot is built and maintained by Tassadaq Hussain (Brightfield Software Solutions, Peshawar, Pakistan).',
  organization: 'Brightfield Software Solutions',
  location: 'Peshawar, Pakistan',
};
