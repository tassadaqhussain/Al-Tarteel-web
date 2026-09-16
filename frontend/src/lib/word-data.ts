import type { AyahWithRelations } from '@/lib/api';
export type ReaderWord = NonNullable<AyahWithRelations['words']>[number];
export interface SourceWord {
  id: number; position: number; char_type_name: string;
  text_uthmani?: string; text?: string;
  translation?: { text?: string; language_name?: string };
  transliteration?: { text?: string };
}
const languages: Record<string, string> = { english: 'en', urdu: 'ur', persian: 'fa', bengali: 'bn', indonesian: 'id', turkish: 'tr', hindi: 'hi' };
export function normalizeWords(words: SourceWord[]): ReaderWord[] {
  return words.filter(w => w.char_type_name === 'word' && w.position > 0 && (w.text_uthmani || w.text)).map(w => {
    const locale = languages[w.translation?.language_name?.toLowerCase() ?? ''];
    return { id: w.id, position: w.position, textArabic: w.text_uthmani || w.text!, textUthmani: w.text_uthmani || w.text!,
      transliteration: w.transliteration?.text, translation: w.translation?.text,
      translations: locale && w.translation?.text ? { [locale]: w.translation.text } : {},
    };
  });
}
const pending = new Map<string, Promise<Record<string, ReaderWord[]>>>();
export async function loadReaderWords(surah: number, ayah: number, locale: string): Promise<ReaderWord[]> {
  const language = ['en', 'ur', 'fa', 'bn', 'id', 'tr', 'hi'].includes(locale) ? locale : 'en';
  const page = Math.ceil(ayah / 50);
  const key = `${surah}:${page}:${language}`;
  let request = pending.get(key);
  if (!request) {
    request = fetch(`/reader-data/words?surah=${surah}&page=${page}&language=${language}`)
      .then(async response => {
        if (!response.ok) throw new Error('Word data unavailable');
        return response.json() as Promise<Record<string, ReaderWord[]>>;
      }).catch(error => { pending.delete(key); throw error; });
    if (pending.size >= 24) pending.delete(pending.keys().next().value!);
    pending.set(key, request);
  }
  return (await request)[`${surah}:${ayah}`] ?? [];
}
