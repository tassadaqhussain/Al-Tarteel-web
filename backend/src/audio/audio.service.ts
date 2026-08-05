import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_TTL = 86400; // 24h for reciters

@Injectable()
export class AudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private getVerifiedAyahAudioUrl(reciterSlug: string, surahNumber: number, ayahNumber: number) {
    const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
    // The legacy AbdulBasitAbdulSamad path now returns 404. Quran CDN's current
    // catalog uses AbdulBaset, so keep this mapping server-side and testable.
    if (reciterSlug === 'abdul-basit-murattal') {
      return `https://audio.qurancdn.com/AbdulBaset/Murattal/mp3/${file}`;
    }
    return null;
  }

  private getLocalAyahAudioUrl(reciterSlug: string, surahNumber: number, ayahNumber: number) {
    const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
    const storageRoot = process.env.AUDIO_STORAGE_PATH || join(process.cwd(), 'storage', 'audio');
    if (!existsSync(join(storageRoot, reciterSlug, file))) return null;
    const publicBase = process.env.AUDIO_PUBLIC_BASE_URL || 'http://localhost:4010/api/v1/audio/files';
    return `${publicBase.replace(/\/$/, '')}/${encodeURIComponent(reciterSlug)}/${file}`;
  }

  async getReciters() {
    const key = 'audio:reciters';
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);
    const reciters = await this.prisma.reciter.findMany({
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        nameArabic: true,
        slug: true,
        style: true,
        baseUrl: true,
        isDefault: true,
        sortOrder: true,
      },
    });
    await this.cache.set(key, JSON.stringify(reciters), CACHE_TTL);
    return reciters;
  }

  async getAudioForAyah(ayahId: number, reciterSlug?: string) {
    const where: { ayahId: number; reciterId?: number } = { ayahId };
    if (reciterSlug) {
      const reciter = await this.prisma.reciter.findUnique({ where: { slug: reciterSlug } });
      if (reciter) where.reciterId = reciter.id;
    }
    const files = await this.prisma.audioFile.findMany({
      where,
      include: {
        reciter: { select: { id: true, name: true, slug: true } },
        ayah: { select: { number: true, surah: { select: { number: true } } } },
      },
    });
    if (files.length === 0) throw new NotFoundException('No audio found for this ayah');
    return files.map((file) => ({
      ...file,
      url: this.getLocalAyahAudioUrl(file.reciter.slug, file.ayah.surah.number, file.ayah.number)
        ?? this.getVerifiedAyahAudioUrl(file.reciter.slug, file.ayah.surah.number, file.ayah.number)
        ?? file.url,
    }));
  }

  async getAudioForSurah(surahNumber: number, reciterSlug: string) {
    const surah = await this.prisma.surah.findUnique({ where: { number: surahNumber } });
    if (!surah) throw new NotFoundException(`Surah ${surahNumber} not found`);
    const reciter = await this.prisma.reciter.findUnique({ where: { slug: reciterSlug } });
    if (!reciter) throw new NotFoundException(`Reciter ${reciterSlug} not found`);
    const ayahs = await this.prisma.ayah.findMany({
      where: { surahId: surah.id },
      orderBy: { number: 'asc' },
      select: { id: true, number: true, surahId: true },
    });
    const audioFiles = await this.prisma.audioFile.findMany({
      where: {
        ayahId: { in: ayahs.map((a) => a.id) },
        reciterId: reciter.id,
      },
      include: { ayah: { select: { id: true, number: true, surahId: true } } },
    });
    const byAyah = new Map(audioFiles.map((f) => [f.ayah.id, f]));
    return ayahs.map((a) => {
      const stored = byAyah.get(a.id);
      // Prefer a verified current CDN route over stale imported URLs.
      let url: string | null = this.getLocalAyahAudioUrl(reciter.slug, surahNumber, a.number)
        ?? this.getVerifiedAyahAudioUrl(reciter.slug, surahNumber, a.number);
      if (!url) url = stored?.url ?? null;
      if (!url && reciter.baseUrl) {
        const s = String(surahNumber).padStart(3, '0');
        const v = String(a.number).padStart(3, '0');
        url = `${reciter.baseUrl.replace(/\/?$/, '/')}${s}${v}.mp3`;
      }
      return {
        ayahId: a.id,
        ayahNumber: a.number,
        surahNumber: surah.number,
        url,
        duration: stored?.duration ?? null,
      };
    });
  }
}
