import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DONATE_ENABLED } from '@/lib/features';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/profile',
          '/bookmarks',
          '/settings',
          '/my-quran',
          '/reading-goal',
          '/hifz',
          '/feedback',
          '/admin',
          '/search',
          ...(DONATE_ENABLED ? ['/donate/checkout', '/donate/success'] : ['/donate', '/donate/checkout', '/donate/success']),
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
