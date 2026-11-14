import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  const body = [
    '# QuranPilot',
    '',
    `> Read, listen to, and study the Holy Quran online at ${SITE_URL} with word-by-word meanings, synchronized audio recitations, Tajweed guidance, and translations in English, Urdu, Pashto, and Persian.`,
    '',
    '## Main Sections',
    `- [Home](${SITE_URL}/): Overview, search, daily verse, and quick navigation`,
    `- [All 114 Surahs](${SITE_URL}/surahs): Complete index of chapters (surahs) with verse counts and slugs`,
    `- [Surah Pages](${SITE_URL}/al-baqarah): Full chapter reader at /<surah-slug> (e.g., /al-fatihah, /al-baqarah, /ya-sin)`,
    `- [Ayah Pages](${SITE_URL}/al-baqarah/255): Individual verse pages at /<surah-slug>/<ayah> (6,236 verses, e.g., /yusuf/4, /al-baqarah/255)`,
    `- [Juz Index](${SITE_URL}/juz/1): All 30 Juz sections (/juz/1 through /juz/30)`,
    `- [Tajweed Guide](${SITE_URL}/tajweed): Interactive Tajweed rules (/tajweed/ghunnah, /tajweed/ikhfa, /tajweed/idgham, /tajweed/iqlab, /tajweed/qalqalah, /tajweed/madd)`,
    `- [Learning Plans](${SITE_URL}/learning-plans): Structured Quran reading and reflection plans`,
    `- [Articles](${SITE_URL}/articles): Educational guides and reflections`,
    '',
    '## Supported Languages (Localized Surahs & Ayahs)',
    `- English (root): ${SITE_URL}/ and ${SITE_URL}/quran-english-translation`,
    `- Urdu (/ur): ${SITE_URL}/ur and ${SITE_URL}/quran-urdu-translation`,
    `- Pashto (/ps): ${SITE_URL}/ps and ${SITE_URL}/quran-pashto-translation`,
    `- Persian (/fa): ${SITE_URL}/fa`,
    '',
    '## Discovery & Sitemaps',
    `- [Sitemap Index](${SITE_URL}/sitemap.xml): XML sitemap index covering core hubs, all 114 surahs, and all 24,944 localized ayah URLs`,
    `- [Robots](${SITE_URL}/robots.txt): Crawler directives`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  });
}

