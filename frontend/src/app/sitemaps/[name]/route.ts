import {
  activeSitemapNames,
  isSitemapName,
  sitemapEntriesWithDates,
} from '@/lib/sitemap-data';
import { renderUrlset, xmlResponse } from '@/lib/sitemap-xml';

/**
 * Descriptive child sitemaps at `/sitemaps/<name>.xml`, listed by `/sitemap.xml`:
 * - `/sitemaps/core.xml`
 * - `/sitemaps/surahs.xml`
 * - `/sitemaps/content.xml`
 * - `/sitemaps/locales.xml`
 * - `/sitemaps/ayahs-<lang>-1.xml` … `-3.xml` per language (en, ur, ps, fa); only indexable ayahs are listed
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export function generateStaticParams() {
  return activeSitemapNames().map((name) => ({ name: `${name}.xml` }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name: raw } = await context.params;
  const match = /^([a-z0-9-]+)\.xml$/.exec(raw);
  const name = match ? match[1] : '';
  if (!isSitemapName(name)) {
    return new Response('Not found', { status: 404 });
  }

  const entries = await sitemapEntriesWithDates(name);
  if (entries.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  return xmlResponse(renderUrlset(entries));
}
