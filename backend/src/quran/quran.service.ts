import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { AyahsBySurahQueryDto, AyahsByPageQueryDto } from './dto/query.dto';
import { vocalizedSurahName } from './surah-arabic';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10);

@Injectable()
export class QuranService {
  private qfTokens = new Map<string, { token: string; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private getWordAudioUrl(surahNumber: number, ayahNumber: number, wordPosition: number) {
    const chapter = String(surahNumber).padStart(3, '0');
    const verse = String(ayahNumber).padStart(3, '0');
    const word = String(wordPosition).padStart(3, '0');
    const file = `${chapter}_${verse}_${word}.mp3`;
    const storageRoot = process.env.AUDIO_STORAGE_PATH || join(process.cwd(), 'storage', 'audio');
    if (existsSync(join(storageRoot, 'wbw', file))) {
      const publicBase = (process.env.AUDIO_PUBLIC_BASE_URL || 'http://localhost:4010/api/v1/audio/files').replace(/\/$/, '');
      return `${publicBase}/wbw/${file}`;
    }
    return `https://audio.qurancdn.com/wbw/${file}`;
  }

  private async getQuranFoundationToken(scope = 'content', force = false) {
    const cached = this.qfTokens.get(scope);
    if (!force && cached && Date.now() < cached.expiresAt) return cached.token;
    const clientId = process.env.QF_CLIENT_ID;
    const clientSecret = process.env.QF_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Quran Foundation credentials are not configured');
    const authBase = process.env.QF_AUTH_BASE_URL || 'https://oauth2.quran.foundation';
    const response = await axios.post<{ access_token: string; expires_in: number }>(
      `${authBase}/oauth2/token`,
      `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
      {
        auth: { username: clientId, password: clientSecret },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      },
    );
    this.qfTokens.set(scope, {
      token: response.data.access_token,
      expiresAt: Date.now() + Math.max(60, response.data.expires_in - 60) * 1000,
    });
    return response.data.access_token;
  }

  private async quranFoundationGet<T>(path: string, params?: Record<string, unknown>, retry = true, scope = 'content'): Promise<T> {
    const clientId = process.env.QF_CLIENT_ID;
    const apiBase = process.env.QF_API_BASE_URL || 'https://apis.quran.foundation';
    try {
      const token = await this.getQuranFoundationToken(scope);
      const response = await axios.get<T>(`${apiBase}${path}`, {
        params,
        headers: { 'x-auth-token': token, 'x-client-id': clientId, Accept: 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      if (retry && error?.response?.status === 401) {
        await this.getQuranFoundationToken(scope, true);
        return this.quranFoundationGet<T>(path, params, false, scope);
      }
      throw error;
    }
  }

  private withVocalizedArabic<T extends { number: number; nameArabic: string }>(surah: T): T {
    return {
      ...surah,
      nameArabic: vocalizedSurahName(surah.number, surah.nameArabic),
    };
  }

  async findAllSurahs() {
    const key = 'quran:surahs:all';
    const cached = await this.cache.get(key);
    if (cached) {
      const parsed = JSON.parse(cached) as Array<{ number: number; nameArabic: string }>;
      // Never trust empty caches (can happen if listed before seed completes)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((surah) => this.withVocalizedArabic(surah));
      }
    }
    const surahs = await this.prisma.surah.findMany({
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        nameArabic: true,
        nameSimple: true,
        nameComplex: true,
        revelationPlace: true,
        revelationOrder: true,
        numberOfAyahs: true,
      },
    });
    const withArabic = surahs.map((surah) => this.withVocalizedArabic(surah));
    if (withArabic.length > 0) {
      await this.cache.set(key, JSON.stringify(withArabic), CACHE_TTL);
    }
    return withArabic;
  }

  async findSurahByNumber(surahNumber: number) {
    const key = `quran:surah:${surahNumber}`;
    const cached = await this.cache.get(key);
    if (cached) return this.withVocalizedArabic(JSON.parse(cached));
    const surah = await this.prisma.surah.findUnique({
      where: { number: surahNumber },
      select: {
        id: true,
        number: true,
        nameArabic: true,
        nameSimple: true,
        nameComplex: true,
        revelationPlace: true,
        revelationOrder: true,
        numberOfAyahs: true,
      },
    });
    if (!surah) throw new NotFoundException(`Surah ${surahNumber} not found`);
    const withArabic = this.withVocalizedArabic(surah);
    await this.cache.set(key, JSON.stringify(withArabic), CACHE_TTL);
    return withArabic;
  }

  async findAyahsBySurah(
    surahNumber: number,
    query: AyahsBySurahQueryDto,
  ) {
    const surah = await this.prisma.surah.findUnique({ where: { number: surahNumber } });
    if (!surah) throw new NotFoundException(`Surah ${surahNumber} not found`);
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 286);
    const skip = (page - 1) * limit;
    const translationSlugs = query.translations?.split(',').map((s) => s.trim()).filter(Boolean) || [];
    const includeWords = !!query.words;

    const ayahs = await this.prisma.ayah.findMany({
      where: { surahId: surah.id },
      orderBy: { number: 'asc' },
      skip,
      take: limit,
      include: {
        words: includeWords
          ? { orderBy: { position: 'asc' }, include: { translations: { orderBy: { languageCode: 'asc' } } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true, name: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.find((item: any) => item.languageCode === 'en')?.text ?? w.translations?.[0]?.text,
            translations: Object.fromEntries((w.translations ?? []).map((item: any) => [item.languageCode, item.text])),
            audioUrl: this.getWordAudioUrl(surah.number, a.number, w.position),
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
        translatorName: t.translator.name,
        text: t.text,
      })),
    }));
  }

  async findAyahsByPage(pageNumber: number, query: AyahsByPageQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 50);
    const skip = (page - 1) * limit;
    const translationSlugs = query.translations?.split(',').map((s) => s.trim()).filter(Boolean) || [];
    const includeWords = !!query.words;

    const ayahs = await this.prisma.ayah.findMany({
      where: { page: pageNumber },
      orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
      skip,
      take: limit,
      include: {
        surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } },
        words: includeWords
          ? { orderBy: { position: 'asc' }, include: { translations: { orderBy: { languageCode: 'asc' } } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true, name: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string; languageCode?: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.find((item: any) => item.languageCode === 'en')?.text ?? w.translations?.[0]?.text,
            translations: Object.fromEntries((w.translations ?? []).map((item: any) => [item.languageCode, item.text])),
            audioUrl: this.getWordAudioUrl(a.surah.number, a.number, w.position),
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
        translatorName: t.translator.name,
        text: t.text,
      })),
    }));
  }

  async findAyahsByJuz(juzNumber: number, query: AyahsByPageQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 300);
    const skip = (page - 1) * limit;
    const translationSlugs = query.translations?.split(',').map((s) => s.trim()).filter(Boolean) || [];
    const includeWords = !!query.words;

    const ayahs = await this.prisma.ayah.findMany({
      where: { juz: juzNumber },
      orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
      skip,
      take: limit,
      include: {
        surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } },
        words: includeWords
          ? { orderBy: { position: 'asc' }, include: { translations: { orderBy: { languageCode: 'asc' } } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true, name: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string; languageCode?: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.find((item: any) => item.languageCode === 'en')?.text ?? w.translations?.[0]?.text,
            translations: Object.fromEntries((w.translations ?? []).map((item: any) => [item.languageCode, item.text])),
            audioUrl: this.getWordAudioUrl(a.surah.number, a.number, w.position),
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
        translatorName: t.translator.name,
        text: t.text,
      })),
    }));
  }

  async findOneAyah(surahNumber: number, ayahNumber: number, translations?: string, words?: boolean) {
    const surah = await this.prisma.surah.findUnique({ where: { number: surahNumber } });
    if (!surah) throw new NotFoundException(`Surah ${surahNumber} not found`);
    const translationSlugs = translations?.split(',').map((s) => s.trim()).filter(Boolean) || [];

    const ayah = await this.prisma.ayah.findFirst({
      where: { surahId: surah.id, number: ayahNumber },
      include: {
        surah: true,
        words: words ? { orderBy: { position: 'asc' }, include: { translations: { orderBy: { languageCode: 'asc' } } } } : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true, name: true } } },
              }
            : false,
      },
    });
    if (!ayah) throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    return {
      ...ayah,
      words: ayah.words
        ? (ayah.words as Array<{ translations?: Array<{ text: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.find((item: any) => item.languageCode === 'en')?.text ?? w.translations?.[0]?.text,
            translations: Object.fromEntries((w.translations ?? []).map((item: any) => [item.languageCode, item.text])),
            audioUrl: this.getWordAudioUrl(surah.number, ayah.number, w.position),
          }))
        : undefined,
      translations: ayah.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
        translatorName: t.translator.name,
        text: t.text,
      })),
    };
  }

  async getTranslators(languageCode?: string) {
    const where = languageCode ? { languageCode } : {};
    const translators = await this.prisma.translator.findMany({
      where,
      orderBy: [{ languageCode: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, languageCode: true, slug: true, _count: { select: { ayahTranslations: true } } },
    });
    // Exclude incomplete legacy/demo records. Official resources may omit a
    // handful of verses, so keep resources with near-complete Quran coverage.
    return translators
      .filter((translator) => translator.slug && translator._count.ayahTranslations >= 5000)
      .map(({ _count, ...translator }) => translator);
  }

  async getTafsir(ayahId: number, sourceSlug?: string) {
    const where: { ayahId: number; sourceId?: number } = { ayahId };
    if (sourceSlug) {
      const source = await this.prisma.tafsirSource.findUnique({ where: { slug: sourceSlug } });
      if (source) where.sourceId = source.id;
    }
    const tafsirs = await this.prisma.tafsir.findMany({
      where,
      include: { source: { select: { id: true, name: true, slug: true, languageCode: true, author: true } } },
    });
    return tafsirs;
  }

  async getTafsirSources() {
    const local = await this.prisma.tafsirSource.findMany({
      orderBy: [{ languageCode: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, languageCode: true, author: true },
    });
    if (local.length > 0) return local;
    return [];
  }

  async getOfficialTafsirResources(language = 'en') {
    const local = await this.prisma.tafsirSource.findMany({
      where: { externalId: { not: null } },
      orderBy: [{ languageCode: 'asc' }, { name: 'asc' }],
    });
    if (local.length > 0) {
      const LANGUAGE_NAMES: Record<string, string> = {
        en: 'english', ar: 'arabic', ur: 'urdu', fa: 'persian', bn: 'bengali',
        id: 'indonesian', tr: 'turkish', fr: 'french', de: 'german', ru: 'russian',
        bs: 'bosnian', sq: 'albanian', ms: 'malay', hi: 'hindi',
      };
      const wanted = language.replace(/[^a-z-]/gi, '').toLowerCase();
      const mapped = local.map((source) => {
        const languageName = LANGUAGE_NAMES[source.languageCode] || source.languageCode;
        return {
          id: source.externalId as number,
          name: source.name,
          author_name: source.author,
          slug: source.slug,
          language_name: languageName,
          translated_name: { name: source.name, language_name: languageName },
        };
      });
      // `language` is UI locale for names, not a content filter — return every source.
      void wanted;
      return mapped;
    }

    const normalized = language.replace(/[^a-z-]/gi, '').toLowerCase() || 'en';
    const cacheKey = `quran:official-tafsir-resources:${normalized}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    try {
      const data = await this.quranFoundationGet<{ tafsirs: unknown[] }>(
        '/content/api/v4/resources/tafsirs', { language: normalized },
      );
      await this.cache.set(cacheKey, JSON.stringify(data.tafsirs || []), CACHE_TTL);
      return data.tafsirs || [];
    } catch {
      throw new BadGatewayException('Tafsir resources are temporarily unavailable');
    }
  }

  async getOfficialTafsir(surahNumber: number, ayahNumber: number, resourceId: number) {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1 || resourceId < 1) {
      throw new BadRequestException('Invalid Tafsir request');
    }

    const source = await this.prisma.tafsirSource.findUnique({
      where: { externalId: resourceId },
    });
    if (source) {
      const ayah = await this.prisma.ayah.findFirst({
        where: { number: ayahNumber, surah: { number: surahNumber } },
        select: { id: true },
      });
      if (!ayah) throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
      const row = await this.prisma.tafsir.findUnique({
        where: { ayahId_sourceId: { ayahId: ayah.id, sourceId: source.id } },
      });
      if (row) {
        const verseKey = `${surahNumber}:${ayahNumber}`;
        return {
          verses: { [verseKey]: { id: ayah.id } },
          resource_id: resourceId,
          resource_name: source.name,
          language_id: 0,
          slug: source.slug,
          text: row.text,
        };
      }
    }

    const verseKey = `${surahNumber}:${ayahNumber}`;
    const cacheKey = `quran:official-tafsir:${resourceId}:${verseKey}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    try {
      const data = await this.quranFoundationGet<{ tafsir: unknown }>(
        `/content/api/v4/tafsirs/${resourceId}/by_ayah/${encodeURIComponent(verseKey)}`,
      );
      await this.cache.set(cacheKey, JSON.stringify(data.tafsir), CACHE_TTL);
      return data.tafsir;
    } catch {
      throw new BadGatewayException('Tafsir is temporarily unavailable');
    }
  }

  private async findAyahId(surahNumber: number, ayahNumber: number) {
    const ayah = await this.prisma.ayah.findFirst({
      where: { number: ayahNumber, surah: { number: surahNumber } },
      select: { id: true },
    });
    if (!ayah) throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    return ayah.id;
  }

  private paginate<T>(items: T[], page: number, limit: number) {
    const start = (page - 1) * limit;
    return {
      slice: items.slice(start, start + limit),
      hasMore: start + limit < items.length,
      total: items.length,
    };
  }

  async getHadiths(
    surahNumber: number,
    ayahNumber: number,
    language = 'en',
    page = 1,
    limit = 4,
  ) {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
      throw new BadRequestException('Invalid verse key');
    }

    const surah = await this.prisma.surah.findUnique({
      where: { number: surahNumber },
      select: { numberOfAyahs: true },
    });
    if (!surah || ayahNumber > surah.numberOfAyahs) {
      throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    }

    const normalizedLanguage = language === 'ar' ? 'ar' : 'en';
    const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const normalizedLimit = Number.isFinite(limit) ? Math.min(10, Math.max(1, Math.floor(limit))) : 4;
    const direction = normalizedLanguage === 'ar' ? 'rtl' : 'ltr';

    const ayahId = await this.findAyahId(surahNumber, ayahNumber);
    const local = await this.prisma.ayahStudySnapshot.findUnique({
      where: { ayahId_kind_language: { ayahId, kind: 'hadith', language: normalizedLanguage } },
    });
    if (local) {
      const hadiths = Array.isArray((local.payload as { hadiths?: unknown[] })?.hadiths)
        ? (local.payload as { hadiths: unknown[] }).hadiths
        : [];
      const { slice, hasMore } = this.paginate(hadiths, normalizedPage, normalizedLimit);
      return {
        hadiths: slice,
        page: normalizedPage,
        limit: normalizedLimit,
        has_more: hasMore,
        language: normalizedLanguage,
        direction,
      };
    }

    const verseKey = `${surahNumber}:${ayahNumber}`;
    const cacheKey = `quran:hadiths:${verseKey}:${normalizedLanguage}:${normalizedPage}:${normalizedLimit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const data = await this.quranFoundationGet(
        `/content/api/v4/hadith_references/by_ayah/${encodeURIComponent(verseKey)}/hadiths`,
        { language: normalizedLanguage, page: normalizedPage, limit: normalizedLimit },
      );
      await this.cache.set(cacheKey, JSON.stringify(data), CACHE_TTL);
      return data;
    } catch {
      throw new BadGatewayException('Hadith references are temporarily unavailable');
    }
  }

  async getLessons(surahNumber: number, ayahNumber: number, languageId = 2, page = 1, limit = 10) {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
      throw new BadRequestException('Invalid verse key');
    }
    const surah = await this.prisma.surah.findUnique({
      where: { number: surahNumber },
      select: { numberOfAyahs: true },
    });
    if (!surah || ayahNumber > surah.numberOfAyahs) {
      throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    }

    const normalizedLanguage = Number.isFinite(languageId) ? Math.max(1, Math.floor(languageId)) : 2;
    const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const normalizedLimit = Number.isFinite(limit) ? Math.min(20, Math.max(1, Math.floor(limit))) : 10;

    const ayahId = await this.findAyahId(surahNumber, ayahNumber);
    const local = await this.prisma.ayahStudySnapshot.findUnique({
      where: {
        ayahId_kind_language: { ayahId, kind: 'lesson', language: String(normalizedLanguage) },
      },
    });
    if (local) {
      const data = Array.isArray((local.payload as { data?: unknown[] })?.data)
        ? (local.payload as { data: unknown[] }).data
        : [];
      const { slice, total } = this.paginate(data, normalizedPage, normalizedLimit);
      return {
        total,
        currentPage: normalizedPage,
        limit: normalizedLimit,
        pages: Math.max(1, Math.ceil(total / normalizedLimit)),
        data: slice,
      };
    }

    const cacheKey = `quran:lessons:${surahNumber}:${ayahNumber}:${normalizedLanguage}:${normalizedPage}:${normalizedLimit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const data = await this.quranFoundationGet(
        '/quran-reflect/v1/posts/feed',
        {
          tab: 'qdc',
          languages: normalizedLanguage,
          page: normalizedPage,
          limit: normalizedLimit,
          'filter[references][0][chapterId]': surahNumber,
          'filter[references][0][from]': ayahNumber,
          'filter[references][0][to]': ayahNumber,
          'filter[postTypeIds]': 2,
          'filter[verifiedOnly]': true,
        },
        true,
        'post.read',
      );
      await this.cache.set(cacheKey, JSON.stringify(data), CACHE_TTL);
      return data;
    } catch {
      throw new BadGatewayException('Lessons are temporarily unavailable');
    }
  }

  async getRelatedContent(surahNumber: number, ayahNumber: number, language = 'en', page = 1, limit = 10) {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
      throw new BadRequestException('Invalid verse key');
    }
    const surah = await this.prisma.surah.findUnique({ where: { number: surahNumber }, select: { numberOfAyahs: true } });
    if (!surah || ayahNumber > surah.numberOfAyahs) throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    const normalizedLanguage = language === 'ar' ? 'ar' : 'en';
    const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const normalizedLimit = Number.isFinite(limit) ? Math.min(10, Math.max(1, Math.floor(limit))) : 10;

    const ayahId = await this.findAyahId(surahNumber, ayahNumber);
    const local = await this.prisma.ayahStudySnapshot.findUnique({
      where: { ayahId_kind_language: { ayahId, kind: 'related', language: normalizedLanguage } },
    });
    if (local) {
      const questions = Array.isArray((local.payload as { questions?: unknown[] })?.questions)
        ? (local.payload as { questions: unknown[] }).questions
        : [];
      const { slice, total } = this.paginate(questions, normalizedPage, normalizedLimit);
      return { questions: slice, totalCount: total };
    }

    const verseKey = `${surahNumber}:${ayahNumber}`;
    const cacheKey = `quran:related-content:${verseKey}:${normalizedLanguage}:${normalizedPage}:${normalizedLimit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    try {
      const data = await this.quranFoundationGet(
        `/content/api/v4/answers/by_ayah/${encodeURIComponent(verseKey)}`,
        { language: normalizedLanguage, page: normalizedPage, pageSize: normalizedLimit },
      );
      await this.cache.set(cacheKey, JSON.stringify(data), CACHE_TTL);
      return data;
    } catch {
      throw new BadGatewayException('Related content is temporarily unavailable');
    }
  }
}
