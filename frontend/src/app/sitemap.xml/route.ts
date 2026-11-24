import { SITE_URL } from '@/lib/seo';
import {
  activeSitemapNames,
  sitemapLastmod,
  sitemapPath,
} from '@/lib/sitemap-data';
import { renderSitemapIndex, xmlResponse } from '@/lib/sitemap-xml';

/**
 * Sitemap index — the single URL advertised in robots.txt and submitted to
 * Search Console. It points at descriptive child sitemaps under `/sitemaps/`.
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  const items = activeSitemapNames().map((name) => ({
    loc: `${SITE_URL}${sitemapPath(name)}`,
    lastModified: sitemapLastmod(name),
  }));
  return xmlResponse(renderSitemapIndex(items));
}
