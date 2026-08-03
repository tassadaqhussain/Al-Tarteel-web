import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { AyahsBySurahQueryDto, AyahsByPageQueryDto } from './dto/query.dto';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10);

@Injectable()
export class QuranService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private getWordAudioUrl(surahNumber: number, ayahNumber: number, wordPosition: number) {
    const chapter = String(surahNumber).padStart(3, '0');
    const verse = String(ayahNumber).padStart(3, '0');
    const word = String(wordPosition).padStart(3, '0');
    return `https://audio.qurancdn.com/wbw/${chapter}_${verse}_${word}.mp3`;
  }

  async findAllSurahs() {
    const key = 'quran:surahs:all';
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);
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
    await this.cache.set(key, JSON.stringify(surahs), CACHE_TTL);
    return surahs;
  }

  async findSurahByNumber(surahNumber: number) {
    const key = `quran:surah:${surahNumber}`;
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);
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
    await this.cache.set(key, JSON.stringify(surah), CACHE_TTL);
    return surah;
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
          ? { orderBy: { position: 'asc' }, include: { translations: { where: { languageCode: 'en' }, take: 1 } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.[0]?.text,
            audioUrl: this.getWordAudioUrl(surah.number, a.number, w.position),
            translations: undefined,
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
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
          ? { orderBy: { position: 'asc' }, include: { translations: { where: { languageCode: 'en' }, take: 1 } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.[0]?.text,
            audioUrl: this.getWordAudioUrl(a.surah.number, a.number, w.position),
            translations: undefined,
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
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
          ? { orderBy: { position: 'asc' }, include: { translations: { where: { languageCode: 'en' }, take: 1 } } }
          : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true } } },
              }
            : false,
      },
    });

    return ayahs.map((a) => ({
      ...a,
      words: a.words
        ? (a.words as Array<{ translations?: Array<{ text: string }> }>).map((w: any) => ({
            ...w,
            translation: w.translations?.[0]?.text,
            audioUrl: this.getWordAudioUrl(a.surah.number, a.number, w.position),
            translations: undefined,
          }))
        : undefined,
      translations: a.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
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
        words: words ? { orderBy: { position: 'asc' }, include: { translations: { where: { languageCode: 'en' } } } } : false,
        translations:
          translationSlugs.length > 0
            ? {
                where: { translator: { slug: { in: translationSlugs } } },
                include: { translator: { select: { id: true, slug: true } } },
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
            translation: w.translations?.[0]?.text,
            audioUrl: this.getWordAudioUrl(surah.number, ayah.number, w.position),
            translations: undefined,
          }))
        : undefined,
      translations: ayah.translations?.map((t: any) => ({
        translatorId: t.translator.id,
        translatorSlug: t.translator.slug,
        text: t.text,
      })),
    };
  }

  async getTranslators(languageCode?: string) {
    const where = languageCode ? { languageCode } : {};
    return this.prisma.translator.findMany({
      where,
      orderBy: [{ languageCode: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, languageCode: true, slug: true },
    });
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
    return this.prisma.tafsirSource.findMany({
      orderBy: [{ languageCode: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, languageCode: true, author: true },
    });
  }
}
