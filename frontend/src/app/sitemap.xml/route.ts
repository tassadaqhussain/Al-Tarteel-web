import { SITE_URL } from '@/lib/seo';
import { SITEMAP_SHARD_IDS, sitemapShardPath } from '@/lib/sitemap-data';
import { renderSitemapIndex, xmlResponse } from '@/lib/sitemap-xml';

/**
 * Sitemap index — the single URL advertised in robots.txt and submitted to
 * Search Console. It points at the per-shard sitemaps under `/sitemap/`.
 *
 * This is a hand-rolled route rather than Next's `app/sitemap.ts` metadata
 * convention: that convention emits a `<urlset>`, and once `generateSitemaps()`
 * shards it, Next stops serving `/sitemap.xml` at all — which left the only
 * sitemap reference in robots.txt pointing at a 404.
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  const locs = SITEMAP_SHARD_IDS.map((id) => `${SITE_URL}${sitemapShardPath(id)}`);
  return xmlResponse(renderSitemapIndex(locs));
}
