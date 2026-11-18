import { apiBase, type PublicSiteSettings } from '@/lib/api';

const empty: PublicSiteSettings = {
  source: null,
  analyticsProvider: '',
  gaMeasurementId: '',
  plausibleDomain: '',
  plausibleScriptSrc: '',
  umamiWebsiteId: '',
  umamiScriptSrc: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  analyticsEnabled: false,
};

/** Public site SEO/analytics config from the API (DB, else env fallback on the server). */
export async function fetchPublicSiteConfig(): Promise<PublicSiteSettings> {
  try {
    const res = await fetch(`${apiBase()}/site/config`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return empty;
    return (await res.json()) as PublicSiteSettings;
  } catch {
    return empty;
  }
}

export { empty as emptySiteSettings };
