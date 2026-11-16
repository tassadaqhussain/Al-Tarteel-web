import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SemanticSearchService } from '../ai-knowledge/semantic-search.service';
import { cleanTranslationText } from '../quran/clean-translation';

function expandEnglishSearchTerms(raw: string): string[] {
  const q = raw.trim();
  const terms = new Set<string>([q]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  for (const lower of words) {
    if (!/^[a-z]{4,}$/.test(lower)) continue;
    terms.add(lower);
    if (lower.endsWith('ence')) terms.add(lower.slice(0, -4) + 'ent');
    else if (lower.endsWith('ent')) terms.add(lower.slice(0, -3) + 'ence');
    else if (lower.endsWith('ance')) terms.add(lower.slice(0, -4) + 'ant');
    else if (lower.endsWith('ant')) terms.add(lower.slice(0, -3) + 'ance');
    else if (lower === 'mercy') terms.add('merciful');
    else if (lower === 'merciful') terms.add('mercy');
    else if (lower.endsWith('ness')) terms.add(lower.slice(0, -4));
    else if (lower.endsWith('ies')) terms.add(lower.slice(0, -3) + 'y');
    else if (lower.endsWith('ing')) terms.add(lower.slice(0, -3));
    else if (lower.endsWith('ed')) terms.add(lower.slice(0, -2));
    else if (lower.endsWith('ly')) terms.add(lower.slice(0, -2));
    else if (lower.endsWith('s') && !lower.endsWith('ss')) terms.add(lower.slice(0, -1));
  }
  return Array.from(terms);
}

@Injectable()
export class SearchService {
  private readonly trCache = new Map<
    string,
    {
      expiresAt: number;
      data: Array<{
        ayahId: number;
        ayahNumber: number;
        surah: { id: number; number: number; nameArabic: string; nameSimple: string };
        text: string;
        translator: { id: number; slug: string; name: string };
      }>;
    }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly semanticSearch: SemanticSearchService,
  ) {}

  async searchAyahs(
    query: string,
    options: { limit?: number; page?: number; surahNumber?: number; translatorSlug?: string } = {},
  ) {
    const pageSize = Math.min(Math.max(options.limit ?? 30, 1), 100);
    const page = Math.max(options.page ?? 1, 1);
    const skip = (page - 1) * pageSize;
    const where: { textUthmani?: { contains: string; mode: 'insensitive' }; surahId?: number } = {};
    if (query?.trim()) {
      where.textUthmani = { contains: query.trim(), mode: 'insensitive' };
    }
    if (options.surahNumber) {
      const surah = await this.prisma.surah.findUnique({ where: { number: options.surahNumber } });
      if (surah) where.surahId = surah.id;
    }
    const [total, ayahs] = await Promise.all([
      this.prisma.ayah.count({ where }),
      this.prisma.ayah.findMany({
        where,
        take: pageSize,
        skip,
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
      }),
    ]);
    const results = ayahs.map((a) => ({
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
    return { results, total, page, pageSize };
  }

  async searchTranslations(
    query: string,
    options: { limit?: number; page?: number; translatorSlug?: string } = {},
  ) {
    const pageSize = Math.min(Math.max(options.limit ?? 30, 1), 100);
    const page = Math.max(options.page ?? 1, 1);
    const trimmed = query?.trim();
    if (!trimmed) {
      return { results: [], total: 0, page, pageSize };
    }

    const isAscii = /^[\x00-\x7F]+$/.test(trimmed);
    const translatorSlug =
      options.translatorSlug || (isAscii ? 'en-sahih-international' : undefined);
    const cacheKey = `${translatorSlug || 'all'}:${trimmed.toLowerCase()}`;

    let allMatches = this.trCache.get(cacheKey);
    if (!allMatches || allMatches.expiresAt <= Date.now()) {
      const terms = expandEnglishSearchTerms(trimmed);
      let translations;

      if (isAscii) {
        const words = trimmed.split(/\s+/).filter(Boolean);
        const searchTerms = words.length <= 1 ? terms : [trimmed];
        const ilikeClauses = searchTerms.map(
          (term) => Prisma.sql`t.text ILIKE ${`%${term}%`}`,
        );
        const tsClauses = searchTerms.map(
          (term) =>
            Prisma.sql`to_tsvector('english', t.text) @@ plainto_tsquery('english', ${term})`,
        );
        const combinedCond = Prisma.join([...tsClauses, ...ilikeClauses], ' OR ');
        const matchedRows = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
          SELECT t.id
          FROM ayah_translations t
          JOIN translators tr ON tr.id = t.translator_id
          WHERE (${translatorSlug ? Prisma.sql`tr.slug = ${translatorSlug}` : Prisma.sql`TRUE`})
            AND (${combinedCond})
          ORDER BY t.ayah_id ASC
        `);
        const matchedIds = matchedRows.map((r) => r.id);
        translations =
          matchedIds.length > 0
            ? await this.prisma.ayahTranslation.findMany({
                where: { id: { in: matchedIds } },
                orderBy: { ayahId: 'asc' },
                include: {
                  ayah: {
                    include: {
                      surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } },
                    },
                  },
                  translator: { select: { id: true, slug: true, name: true } },
                },
              })
            : [];
      } else {
        translations = await this.prisma.ayahTranslation.findMany({
          where: {
            OR: terms.map((term) => ({
              text: { contains: term, mode: 'insensitive' as const },
            })),
            ...(translatorSlug ? { translator: { slug: translatorSlug } } : {}),
          },
          orderBy: { ayahId: 'asc' },
          include: {
            ayah: {
              include: {
                surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } },
              },
            },
            translator: { select: { id: true, slug: true, name: true } },
          },
        });
      }

      const exactPhrase = trimmed.toLowerCase();
      const escaped = exactPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const exactWordRe = new RegExp(`\\b${escaped}\\b`, 'i');

      const mapped = translations
        .map((t: any) => ({
          ayahId: t.ayah.id,
          ayahNumber: t.ayah.number,
          surah: t.ayah.surah,
          text: cleanTranslationText(t.text),
          translator: t.translator,
        }))
        .sort((a, b) => {
          const aLower = a.text.toLowerCase();
          const bLower = b.text.toLowerCase();
          const aTier = exactWordRe.test(aLower) ? 0 : aLower.includes(exactPhrase) ? 1 : 2;
          const bTier = exactWordRe.test(bLower) ? 0 : bLower.includes(exactPhrase) ? 1 : 2;
          if (aTier !== bTier) return aTier - bTier;
          return a.ayahId - b.ayahId;
        });

      if (this.trCache.size >= 200) {
        const oldestKey = this.trCache.keys().next().value;
        if (oldestKey) this.trCache.delete(oldestKey);
      }
      allMatches = { expiresAt: Date.now() + 5 * 60 * 1000, data: mapped };
      this.trCache.set(cacheKey, allMatches);
    }

    const total = allMatches.data.length;
    const skip = (page - 1) * pageSize;
    const results = allMatches.data.slice(skip, skip + pageSize);

    return { results, total, page, pageSize };
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
