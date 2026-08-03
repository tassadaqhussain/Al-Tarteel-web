import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

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
      translations: a.translations?.map((t: any) => ({ translatorSlug: t.translator.slug, text: t.text })) ?? [],
    }));
  }

  async searchTranslations(query: string, options: { limit?: number; translatorSlug?: string } = {}) {
    const limit = Math.min(options.limit ?? 20, 50);
    if (!query?.trim()) return [];
    const translatorSlug = options.translatorSlug;
    const translations = await this.prisma.ayahTranslation.findMany({
      where: {
        text: { contains: query.trim(), mode: 'insensitive' },
        ...(translatorSlug ? { translator: { slug: translatorSlug } } : {}),
      },
      take: limit,
      include: {
        ayah: { include: { surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } } } },
        translator: { select: { id: true, slug: true, name: true } },
      },
    });
    return translations.map((t: any) => ({
      ayahId: t.ayah.id,
      ayahNumber: t.ayah.number,
      surah: t.ayah.surah,
      text: t.text,
      translator: t.translator,
    }));
  }
}
