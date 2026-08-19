const IS_SERVER = typeof window === 'undefined';
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SERVER_BASE = process.env.API_URL || PUBLIC_BASE;

/** Resolve API base for both browser and server. Blank NEXT_PUBLIC_API_URL used to crash `new URL()`. */
export function apiBase(): string {
  const configured = (IS_SERVER ? SERVER_BASE : PUBLIC_BASE).replace(/\/$/, '');
  if (configured) return configured;
  if (!IS_SERVER && typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  return 'http://127.0.0.1:4010/api/v1';
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined> }
): Promise<T> {
  const { params, ...init } = options ?? {};
  const base = apiBase();
  const url = new URL(path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    ...init,
    // Cookie auth (HttpOnly qp_access / qp_refresh) — required for /auth and /users
    credentials: init.credentials ?? (IS_SERVER ? 'same-origin' : 'include'),
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    next: path.startsWith('/quran') ? { revalidate: 3600 } : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      const msg = Array.isArray(parsed.message)
        ? parsed.message.join(', ')
        : parsed.message;
      if (msg) message = msg;
    } catch {
      /* use raw text */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

export type AuthUser = {
  id: number;
  email: string | null;
  name: string | null;
};

export type AuthSessionResponse = { user: AuthUser };

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    api<AuthSessionResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  logout: () => api<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => api<AuthUser>('/auth/me'),
  refresh: () => api<AuthSessionResponse>('/auth/refresh', { method: 'POST' }),
  forgotPassword: (email: string) =>
    api<{ ok: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (body: { token: string; password: string; confirmPassword: string }) =>
    api<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
} as const;

export type ServerBookmark = {
  id: number;
  ayahId: number;
  note: string | null;
  createdAt: string;
  ayah: {
    id: number;
    number: number;
    textUthmani: string;
    surah: { id: number; number: number; nameArabic: string; nameSimple: string };
  };
  surah: { id: number; number: number; nameArabic: string; nameSimple: string };
};

export const usersApi = {
  bookmarks: () => api<ServerBookmark[]>('/users/bookmarks'),
  addBookmark: (ayahId: number, note?: string) =>
    api<{ ok: boolean; ayahId: number }>('/users/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ ayahId, note }),
    }),
  removeBookmark: (ayahId: number) =>
    api<{ ok: boolean }>(`/users/bookmarks/${ayahId}`, { method: 'DELETE' }),
  readingHistory: (limit?: number) =>
    api<
      {
        ayahId: number;
        readAt: string;
        ayah: { number: number; textUthmani: string };
        surah: { number: number; nameSimple: string; nameArabic: string };
      }[]
    >('/users/reading-history', { params: { limit } }),
  recordReading: (body: {
    ayahId: number;
    surahNumber?: number;
    ayahNumber?: number;
    page?: number;
  }) =>
    api<{ ok: boolean }>('/users/reading-history', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  lastRead: () =>
    api<{
      lastReadSurahId: number | null;
      lastReadAyahNumber: number | null;
      lastReadPage: number | null;
      lastReadSurah: { number: number; nameSimple: string; nameArabic: string } | null;
    } | null>('/users/last-read'),
  getDailyGoal: () =>
    api<{
      id: number;
      goalType: string;
      goalValue: number;
      isActive: boolean;
    } | null>('/users/daily-goal'),
  setDailyGoal: (body: { goalType: string; goalValue: number }) =>
    api<{ id: number; goalType: string; goalValue: number }>('/users/daily-goal', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  clearDailyGoal: () => api<{ ok: boolean }>('/users/daily-goal', { method: 'DELETE' }),
  getDailyProgress: (date: string) =>
    api<{
      date: string;
      ayahsRead: number;
      minutesRead: number;
      tajweedPracticed: boolean;
      goalCompleted: boolean;
    }>('/users/daily-progress', { params: { date } }),
  upsertDailyProgress: (body: {
    date: string;
    ayahsRead?: number;
    minutesRead?: number;
    tajweedPracticed?: boolean;
    incrementAyahs?: number;
    incrementMinutes?: number;
  }) =>
    api('/users/daily-progress', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getMotivationPreferences: () =>
    api<{
      reminderEnabled: boolean;
      reminderSlot: string | null;
      reminderTime: string | null;
      timezone: string;
    }>('/users/motivation-preferences'),
  setMotivationPreferences: (body: {
    reminderEnabled?: boolean;
    reminderSlot?: string | null;
    reminderTime?: string | null;
    timezone?: string;
  }) =>
    api('/users/motivation-preferences', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
} as const;

export type HifzWordDiff = {
  expected: string;
  expectedNormalized?: string;
  heard: string | null;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
  similarity?: number;
};

export type HifzCheckResult = {
  surahNumber: number;
  ayahNumber: number;
  ayahId: number;
  expected: string;
  expectedNormalized: string;
  heardNormalized: string;
  accuracy: number;
  isCorrect: boolean;
  words: HifzWordDiff[];
  mode: 'speech' | 'type';
};

export type HifzDailyStat = {
  id: number;
  userId: number;
  date: string;
  attempts: number;
  correct: number;
  accuracySum: number;
  avgAccuracy: number;
};

export const hifzApi = {
  check: (body: {
    surahNumber: number;
    ayahNumber: number;
    transcript: string;
    mode?: 'speech' | 'type';
  }) =>
    api<HifzCheckResult>('/hifz/check', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  recordAttempt: (body: {
    surahNumber: number;
    ayahNumber: number;
    mode: 'speech' | 'type';
    transcript: string;
    accuracy?: number;
    isCorrect?: boolean;
    practiceDate: string;
  }) =>
    api<{ attempt: unknown; check: HifzCheckResult }>('/hifz/attempts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  daily: (days = 14) =>
    api<HifzDailyStat[]>('/hifz/daily', { params: { days } }),
  progress: (surahNumber: number) =>
    api<{
      surahNumber: number;
      mastered: number;
      practiced: number;
      ayahs: Array<{
        ayahNumber: number;
        accuracy: number;
        isCorrect: boolean;
        attempts: number;
      }>;
    }>(`/hifz/progress/${surahNumber}`),
};

export type FeedbackCategory = 'bug' | 'idea' | 'hifz' | 'translation' | 'other';

export const feedbackApi = {
  submit: (body: {
    name?: string;
    email?: string;
    category: FeedbackCategory;
    message: string;
    rating?: number;
    pageUrl?: string;
  }) =>
    api<{ ok: boolean; id: number; message: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

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

const DEFAULT_RECITERS: Reciter[] = [
  { id: 1, name: 'Mishary Rashid Alafasy', nameArabic: 'مشاري راشد العفاسي', slug: 'alafasy', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps', isDefault: true, sortOrder: 1, kind: 'reciter' },
  { id: 2, name: 'Abdul Rahman Al-Sudais', nameArabic: 'عبد الرحمن السديس', slug: 'sudais', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps', isDefault: false, sortOrder: 2, kind: 'reciter' },
  { id: 3, name: 'Abdul Basit Abdus Samad', nameArabic: 'عبد الباسط عبد الصمد', slug: 'basit', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps', isDefault: false, sortOrder: 3, kind: 'reciter' },
  { id: 4, name: 'Yasser Al-Dosari', nameArabic: 'ياسر الدوسري', slug: 'dosari', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps', isDefault: false, sortOrder: 4, kind: 'reciter' },
  { id: 5, name: 'Abdul Aziz Bandar Balila', nameArabic: 'عبد العزيز بن بندر بليلة', slug: 'balila', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Balilah_128kbps', isDefault: false, sortOrder: 5, kind: 'reciter' },
  { id: 6, name: 'Abdur Rahman Al-Ousi', nameArabic: 'عبد الرحمن العوسي', slug: 'ousi', style: 'Murattal', baseUrl: 'https://everyayah.com/data/Abdurrashid_Sufi_128kbps', isDefault: false, sortOrder: 6, kind: 'reciter' },
];

const SURAH_AYAH_COUNTS: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6,
};

export const audioApi = {
  reciters: async () => {
    try {
      const list = await api<Reciter[]>(`/audio/reciters`);
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return DEFAULT_RECITERS;
  },
  ayah: (ayahId: number, reciter?: string) =>
    api<AudioFile[]>(`/audio/ayah/${ayahId}`, { params: { reciter } }).catch(() => []),
  surah: async (surahNumber: number, reciterSlug: string) => {
    try {
      const list = await api<AudioSurahItem[]>(`/audio/surah/${surahNumber}`, { params: { reciter: reciterSlug } });
      if (Array.isArray(list) && list.length > 0 && list.some((item) => Boolean(item.url))) return list;
    } catch {}

    const reciter = DEFAULT_RECITERS.find((r) => r.slug === reciterSlug) ?? DEFAULT_RECITERS[0];
    const baseUrl = reciter.baseUrl || 'https://everyayah.com/data/Alafasy_128kbps';
    const totalAyahs = SURAH_AYAH_COUNTS[surahNumber] || 7;
    const items: AudioSurahItem[] = [];
    for (let ayahNumber = 1; ayahNumber <= totalAyahs; ayahNumber++) {
      const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
      items.push({
        ayahId: surahNumber * 1000 + ayahNumber,
        surahNumber,
        ayahNumber,
        url: `${baseUrl.replace(/\/$/, '')}/${file}`,
        duration: null,
      });
    }
    return items;
  },
  wordTimings: (surahNumber: number, reciter: string) =>
    api<WordTimingsResponse>(`/audio/surah/${surahNumber}/word-timings`, { params: { reciter } }).catch(() => ({
      surahNumber,
      reciterSlug: reciter,
      available: false,
      ayahs: {},
    })),
};

export const searchApi = {
  ayahs: (q: string, opts?: { limit?: number; surah?: number; translator?: string }) =>
    api<SearchAyahResult[]>(`/search/ayahs`, { params: { q, ...opts } }),
  translations: (q: string, opts?: { limit?: number; translator?: string }) =>
    api<SearchTranslationResult[]>(`/search/translations`, { params: { q, ...opts } }),
};

export type DonationCurrency = 'usd' | 'pkr' | 'eur' | 'gbp';
export type DonationInterval = 'month' | 'week' | 'year';

export interface DonationConfig {
  configured: boolean;
  demoMode?: boolean;
  publishableKey: string | null;
  currencies: DonationCurrency[];
  presets: Record<DonationCurrency, number[]>;
  intervals: { id: DonationInterval; label: string }[];
}

export const donationsApi = {
  config: () => api<DonationConfig>('/donations/config'),
  checkout: (body: {
    amount: number;
    currency: DonationCurrency;
    mode: 'once' | 'recurring';
    interval?: DonationInterval;
    dedicate?: boolean;
    dedicationName?: string;
    customerEmail?: string;
    customerName?: string;
    country?: string;
    hideName?: boolean;
    asOrganization?: boolean;
    organizationName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }) =>
    api<{ url: string; sessionId: string; demo?: boolean }>('/donations/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  paymentIntent: (body: {
    amount: number;
    currency: DonationCurrency;
    mode: 'once' | 'recurring';
    interval?: DonationInterval;
    dedicate?: boolean;
    dedicationName?: string;
    customerEmail?: string;
    customerName?: string;
    country?: string;
    hideName?: boolean;
    asOrganization?: boolean;
    organizationName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }) =>
    api<{
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      currency: string;
      mode?: 'once' | 'recurring';
      subscriptionId?: string;
      demo?: boolean;
    }>('/donations/payment-intent', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  paymentIntentStatus: (paymentIntentId: string) =>
    api<{
      id: string;
      status: string;
      amount: number | null;
      currency: string | null;
      customerEmail: string | null;
      demo?: boolean;
    }>(`/donations/payment-intent/${paymentIntentId}`),
  session: (sessionId: string) =>
    api<{
      id: string;
      status: string | null;
      paymentStatus: string;
      mode: string | null;
      amountTotal: number | null;
      currency: string | null;
      customerEmail: string | null;
      demo?: boolean;
    }>(`/donations/session/${sessionId}`),
} as const;

export const aiApi = {
  config: () =>
    api<{
      configured: boolean;
      provider: string;
      model: string;
      voiceSupported: boolean;
      promptLimit: number;
      promptsUsed: number;
      promptsRemaining: number | null;
    }>('/ai/config'),
  ask: (body: {
    question: string;
    locale?: string;
    verseKey?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }) =>
    api<{
      answer: string;
      model: string;
      promptLimit?: number;
      promptsUsed?: number;
      promptsRemaining?: number | null;
    }>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
} as const;

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
  kind?: 'reciter' | 'translation';
  languageCode?: string;
  languageName?: string;
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

export interface WordTimingsResponse {
  surahNumber: number;
  reciterSlug: string;
  available: boolean;
  ayahs: Record<number, Array<{ position: number; startMs: number; endMs: number }>>;
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
