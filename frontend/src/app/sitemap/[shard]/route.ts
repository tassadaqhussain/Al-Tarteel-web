import {
  isSitemapShardId,
  SITEMAP_SHARD_IDS,
  sitemapShardEntries,
} from '@/lib/sitemap-data';
import { renderUrlset, xmlResponse } from '@/lib/sitemap-xml';

/**
 * Per-shard sitemaps at `/sitemap/<id>.xml`, listed by the `/sitemap.xml`
 * index. These paths match the ones Next's `generateSitemaps()` used to emit,
 * so URLs already submitted to Search Console keep resolving.
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export function generateStaticParams() {
  return SITEMAP_SHARD_IDS.map((id) => ({ shard: `${id}.xml` }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ shard: string }> },
): Promise<Response> {
  const { shard } = await context.params;

  const match = /^(\d+)\.xml$/.exec(shard);
  const id = match ? Number(match[1]) : NaN;
  if (!isSitemapShardId(id)) {
    return new Response('Not found', { status: 404 });
  }

  return xmlResponse(renderUrlset(sitemapShardEntries(id)));
}
