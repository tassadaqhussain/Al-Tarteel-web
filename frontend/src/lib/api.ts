const IS_SERVER = typeof window === 'undefined';
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SERVER_BASE = process.env.API_URL || PUBLIC_BASE;
const BASE = IS_SERVER ? SERVER_BASE : PUBLIC_BASE;

export async function api<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined> }
): Promise<T> {
  const { params, ...init } = options ?? {};
  const url = new URL(path.startsWith('http') ? path : `${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    next: path.startsWith('/quran') ? { revalidate: 3600 } : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

export const quranApi = {
  surahs: () => api<Awaited<ReturnType<typeof getSurahs>>>('/quran/surahs'),
  surah: (number: number) => api<Surah>(`/quran/surahs/${number}`),
  ayahsBySurah: (surahNumber: number, q?: { page?: number; limit?: number; translations?: string; words?: boolean }) =>
    api<AyahWithRelations[]>(`/quran/surahs/${surahNumber}/ayahs`, { params: q as Record<string, string | number | boolean | undefined> }),
  ayahsByPage: (pageNumber: number, q?: { page?: number; limit?: number; translations?: string; words?: boolean }) =>
    api<AyahWithRelations[]>(`/quran/pages/${pageNumber}/ayahs`, { params: q as Record<string, string | number | boolean | undefined> }),
  ayahsByJuz: (juzNumber: number, q?: { page?: number; limit?: number; translations?: string; words?: boolean }) =>
    api<AyahWithRelations[]>(`/quran/juz/${juzNumber}/ayahs`, { params: q as Record<string, string | number | boolean | undefined> }),
  ayah: (surahNumber: number, ayahNumber: number, q?: { translations?: string; words?: boolean }) =>
    api<AyahFull>(`/quran/surahs/${surahNumber}/ayahs/${ayahNumber}`, { params: q as Record<string, string | number | boolean | undefined> }),
  translators: (language?: string) =>
    api<Translator[]>(`/quran/translators`, { params: { language } }),
  tafsir: (ayahId: number, source?: string) =>
    api<TafsirItem[]>(`/quran/ayahs/${ayahId}/tafsir`, { params: { source } }),
  tafsirSources: () => api<TafsirSource[]>(`/quran/tafsir/sources`),
  officialTafsirResources: (language = 'en') => api<OfficialTafsirResource[]>(`/quran/tafsir/resources`, { params: { language } }),
  officialTafsir: (surahNumber: number, ayahNumber: number, resourceId: number) =>
    api<OfficialTafsir>(`/quran/surahs/${surahNumber}/ayahs/${ayahNumber}/tafsirs/${resourceId}`),
  hadiths: (surahNumber: number, ayahNumber: number, q?: { language?: 'en' | 'ar'; page?: number; limit?: number }) =>
    api<HadithResponse>(`/quran/surahs/${surahNumber}/ayahs/${ayahNumber}/hadiths`, { params: q as Record<string, string | number | boolean | undefined> }),
  lessons: (surahNumber: number, ayahNumber: number, q?: { languageId?: number; page?: number; limit?: number }) =>
    api<LessonResponse>(`/quran/surahs/${surahNumber}/ayahs/${ayahNumber}/lessons`, { params: q as Record<string, string | number | boolean | undefined> }),
  relatedContent: (surahNumber: number, ayahNumber: number, q?: { language?: 'en' | 'ar'; page?: number; limit?: number }) =>
    api<RelatedContentResponse>(`/quran/surahs/${surahNumber}/ayahs/${ayahNumber}/related-content`, { params: q as Record<string, string | number | boolean | undefined> }),
};

export const audioApi = {
  reciters: () => api<Reciter[]>(`/audio/reciters`),
  ayah: (ayahId: number, reciter?: string) =>
    api<AudioFile[]>(`/audio/ayah/${ayahId}`, { params: { reciter } }),
  surah: (surahNumber: number, reciter: string) =>
    api<AudioSurahItem[]>(`/audio/surah/${surahNumber}`, { params: { reciter } }),
};

export const searchApi = {
  ayahs: (q: string, opts?: { limit?: number; surah?: number; translator?: string }) =>
    api<SearchAyahResult[]>(`/search/ayahs`, { params: { q, ...opts } }),
  translations: (q: string, opts?: { limit?: number; translator?: string }) =>
    api<SearchTranslationResult[]>(`/search/translations`, { params: { q, ...opts } }),
};

// Types (mirror API responses)
export interface Surah {
  id: number;
  number: number;
  nameArabic: string;
  nameSimple: string;
  nameComplex: string | null;
  revelationPlace: string;
  revelationOrder: number | null;
  numberOfAyahs: number;
}

export interface AyahWithRelations {
  id: number;
  surahId: number;
  number: number;
  numberInQuran: number | null;
  juz: number | null;
  hizb: number | null;
  ruku: number | null;
  page: number | null;
  textUthmani: string;
  textTajweed?: string | null;
  words?: { id: number; position: number; textArabic: string; textUthmani: string; transliteration?: string | null; translation?: string; translations?: Record<string, string>; audioUrl?: string }[];
  translations?: { translatorId: number; translatorSlug: string; translatorName?: string; text: string }[];
  surah?: { id: number; number: number; nameArabic: string; nameSimple: string };
}

export interface AyahFull extends AyahWithRelations {
  surah: Surah;
}

export interface Translator {
  id: number;
  name: string;
  languageCode: string;
  slug: string;
}

export interface TafsirSource {
  id: number;
  name: string;
  slug: string;
  languageCode: string;
  author: string | null;
}

export interface TafsirItem {
  id: number;
  text: string;
  source: TafsirSource;
}

export interface OfficialTafsirResource {
  id: number;
  name: string;
  author_name: string | null;
  slug: string | null;
  language_name: string;
  translated_name?: { name: string; language_name: string };
}

export interface OfficialTafsir {
  verses: Record<string, { id: number }>;
  resource_id: number;
  resource_name: string;
  language_id: number;
  slug: string;
  text: string;
}

export interface HadithText {
  lang: 'en' | 'ar';
  chapterNumber: string;
  chapterTitle: string;
  urn: number;
  body: string;
  grades: { graded_by: string | null; grade: string }[];
}

export interface HadithItem {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  name: string;
  hadith: HadithText[];
}

export interface HadithResponse {
  hadiths: HadithItem[];
  page: number;
  limit: number;
  has_more: boolean;
  language: string;
  direction: 'ltr' | 'rtl';
}

export interface LessonPost {
  id: number;
  body: string;
  createdAt: string;
  publishedAt: string;
  postTypeId: number;
  postTypeName: string;
  languageId: number;
  languageName: string;
  estimatedReadingTime?: number;
  author?: { firstName?: string; lastName?: string; username?: string; verified?: boolean; avatarUrls?: { small?: string; medium?: string; large?: string } };
  references?: { id: string; from: number; to: number; chapterId: number }[];
  tags?: { id: number; name: string; language: string }[];
}

export interface LessonResponse {
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: LessonPost[];
}

export interface RelatedAnswer { id: string; body: string; answeredBy?: string | null; status: string; language?: string | null; }
export interface RelatedQuestion {
  id: string; body: string; type: 'CLARIFICATION' | 'TAFSIR' | 'COMMUNITY'; ranges: string[]; surah?: number | null;
  theme?: string[] | null; summary?: string | null; references?: string[] | null; language?: string | null; status: string; answers: RelatedAnswer[];
}
export interface RelatedContentResponse { questions: RelatedQuestion[]; totalCount: number; }

export interface Reciter {
  id: number;
  name: string;
  nameArabic: string | null;
  slug: string;
  style: string | null;
  baseUrl: string | null;
  isDefault: boolean;
  sortOrder: number;
}

export interface AudioFile {
  id: number;
  url: string;
  duration: number | null;
  format: string;
  reciter: { id: number; name: string; slug: string };
}

export interface AudioSurahItem {
  ayahId: number;
  ayahNumber: number;
  surahNumber: number;
  url: string | null;
  duration: number | null;
}

export interface SearchAyahResult {
  id: number;
  number: number;
  numberInQuran: number | null;
  textUthmani: string;
  surah: { id: number; number: number; nameArabic: string; nameSimple: string };
  translations: { translatorSlug: string; text: string }[];
}

export interface SearchTranslationResult {
  ayahId: number;
  ayahNumber: number;
  surah: { id: number; number: number; nameArabic: string; nameSimple: string };
  text: string;
  translator: { id: number; slug: string; name: string };
}

async function getSurahs(): Promise<Surah[]> {
  return api<Surah[]>('/quran/surahs');
}
