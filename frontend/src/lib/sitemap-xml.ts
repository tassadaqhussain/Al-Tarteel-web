import { SITEMAP_LASTMOD, type SitemapEntry } from '@/lib/sitemap-data';

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
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

export function renderUrlset(entries: SitemapEntry[]): string {
  const hasAlternates = entries.some((entry) => entry.alternates && entry.alternates.length > 0);
  const urls = entries
    .map((entry) => {
      const lastmod = `<lastmod>${escapeXml(entry.lastModified || SITEMAP_LASTMOD)}</lastmod>`;
      const alts = entry.alternates?.length
        ? entry.alternates
            .map(
              (alt) =>
                `<xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />`,
            )
            .join('')
        : '';
      return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}${alts}</url>`;
    })
    .join('');
  const nsAttr = hasAlternates
    ? `xmlns="${URLSET_NS}" xmlns:xhtml="${XHTML_NS}"`
    : `xmlns="${URLSET_NS}"`;
  return `<?xml version="1.0" encoding="UTF-8"?><urlset ${nsAttr}>${urls}</urlset>`;
}

export function renderSitemapIndex(locs: string[]): string {
  const sitemaps = locs
    .map(
      (loc) =>
        `<sitemap><loc>${escapeXml(loc)}</loc><lastmod>${escapeXml(SITEMAP_LASTMOD)}</lastmod></sitemap>`,
    )
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
