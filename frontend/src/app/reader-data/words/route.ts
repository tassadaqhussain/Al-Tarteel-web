import { normalizeWords, type SourceWord } from '@/lib/word-data';
import { getSurahAyahCount } from '@/lib/surah-pagination';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const surah = Number(params.get('surah'));
  const page = Number(params.get('page'));
  const language = params.get('language') || 'en';
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(page) || page < 1 || page > Math.ceil(getSurahAyahCount(surah) / 50) || !['en', 'ur', 'fa', 'bn', 'id', 'tr', 'hi'].includes(language)) {
    return Response.json({ error: 'Invalid word data request' }, { status: 400 });
  }
  try {
    const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah}?words=true&word_fields=text_uthmani&per_page=50&page=${page}&language=${language}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Source unavailable');
    const data = await response.json() as { verses: { verse_key: string; words: SourceWord[] }[] };
    return Response.json(Object.fromEntries(data.verses.map(verse => [verse.verse_key, normalizeWords(verse.words || [])])), {
      headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    });
  } catch {
    return Response.json({ error: 'Word data temporarily unavailable' }, { status: 502 });
  }
}
