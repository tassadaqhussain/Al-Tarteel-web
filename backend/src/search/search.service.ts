import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemanticSearchService } from '../ai-knowledge/semantic-search.service';
import { cleanTranslationText } from '../quran/clean-translation';

function expandEnglishSearchTerms(raw: string): string[] {
  const q = raw.trim();
  const terms = new Set<string>([q]);
  const lower = q.toLowerCase();
  if (/^[a-z]{5,}$/.test(lower)) {
    if (lower.endsWith('ence')) terms.add(lower.slice(0, -4) + 'ent');
    else if (lower.endsWith('ance')) terms.add(lower.slice(0, -4) + 'ant');
    else if (lower.endsWith('ness')) terms.add(lower.slice(0, -4));
    else if (lower.endsWith('ies')) terms.add(lower.slice(0, -3) + 'y');
    else if (lower.endsWith('ing')) terms.add(lower.slice(0, -3));
    else if (lower.endsWith('ed')) terms.add(lower.slice(0, -2));
    else if (lower.endsWith('s') && !lower.endsWith('ss')) terms.add(lower.slice(0, -1));
  }
  return Array.from(terms);
}

@Injectable()
export class SearchService {
  private readonly trCache = new Map<string, { expiresAt: number; data: unknown }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly semanticSearch: SemanticSearchService,
  ) {}

  async searchAyahs(query: string, options: { limit?: number; surahNumber?: number; translatorSlug?: string } = {}) {
    const limit = Math.min(options.limit ?? 20, 50);
    const where: { textUthmani?: { contains: string; mode: 'insensitive' }; surahId?: number } = {};
    if (query?.trim()) {
      where.textUthmani = { contains: query.trim(), mode: 'insensitive' };
    }
    if (options.surahNumber) {
      const surah = await this.prisma.surah.findUnique({ where: { number: options.surahNumber } });
      if (surah) where.surahId = surah.id;
    }
    const ayahs = await this.prisma.ayah.findMany({
      where,
      take: limit,
      orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
      include: {
        surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } },
        translations: options.translatorSlug
          ? {
              where: { translator: { slug: options.translatorSlug } },
              include: { translator: { select: { id: true, slug: true } } },
            }
          : false,
      },
    });
    return ayahs.map((a) => ({
      id: a.id,
      number: a.number,
      numberInQuran: a.numberInQuran,
      textUthmani: a.textUthmani,
      surah: a.surah,
      translations: a.translations?.map((t: any) => ({
        translatorSlug: t.translator.slug,
        text: cleanTranslationText(t.text),
      })) ?? [],
    }));
  }

  async searchTranslations(query: string, options: { limit?: number; translatorSlug?: string } = {}) {
    const limit = Math.min(options.limit ?? 50, 100);
    const trimmed = query?.trim();
    if (!trimmed) return [];

    const isAscii = /^[\x00-\x7F]+$/.test(trimmed);
    const translatorSlug = options.translatorSlug || (isAscii ? 'en-sahih-international' : undefined);
    const cacheKey = `${limit}:${translatorSlug || 'all'}:${trimmed.toLowerCase()}`;
    const cached = this.trCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const terms = expandEnglishSearchTerms(trimmed);
    const translations = await this.prisma.ayahTranslation.findMany({
      where: {
        OR: terms.map((term) => ({
          text: { contains: term, mode: 'insensitive' as const },
        })),
        ...(translatorSlug ? { translator: { slug: translatorSlug } } : {}),
      },
      take: limit,
      orderBy: { ayahId: 'asc' },
      include: {
        ayah: { include: { surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } } } },
        translator: { select: { id: true, slug: true, name: true } },
      },
    });
    const result = translations.map((t: any) => ({
      ayahId: t.ayah.id,
      ayahNumber: t.ayah.number,
      surah: t.ayah.surah,
      text: cleanTranslationText(t.text),
      translator: t.translator,
    }));

    if (this.trCache.size >= 200) {
      const oldestKey = this.trCache.keys().next().value;
      if (oldestKey) this.trCache.delete(oldestKey);
    }
    this.trCache.set(cacheKey, { expiresAt: Date.now() + 5 * 60 * 1000, data: result });
    return result;
  }

  async searchSemantic(
    query: string,
    options: {
      limit?: number;
      language?: string;
      documentType?: string;
      surahNumber?: number;
    } = {},
  ) {
    return this.semanticSearch.search(query, options);
  }
}
