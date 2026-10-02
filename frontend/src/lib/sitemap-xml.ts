import type { SitemapEntry } from '@/lib/sitemap-data';

/** XML-escape a URL before embedding it in `<loc>`. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const URLSET_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

export function renderUrlset(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) =>
        // Google ignores <changefreq> and <priority>; <lastmod> is omitted until
        // real content-revision dates are tracked (see docs/SEO_AUDIT_2026-09-14.md).
        `<url><loc>${escapeXml(entry.url)}</loc></url>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${URLSET_NS}">${urls}</urlset>`;
}

export function renderSitemapIndex(locs: string[]): string {
  const sitemaps = locs
    .map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="${URLSET_NS}">${sitemaps}</sitemapindex>`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  });
}
