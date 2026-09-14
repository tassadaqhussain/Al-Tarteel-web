import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DONATE_ENABLED } from '@/lib/features';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Public account/tool pages carry noindex. Crawlers must be able to
        // fetch them to see it; a robots.txt block can leave URL-only listings.
        disallow: [
          '/admin',
          '/api/',
          ...(DONATE_ENABLED ? ['/donate/checkout'] : ['/donate']),
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
