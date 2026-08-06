import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_TTL = 86400; // 24h for reciters

/** Known CDN verse folders (SSSAAA.mp3). Prefer these over stale imported URLs. */
const RECITER_CDN_BASE: Record<string, string> = {
  alafasy: 'https://audio.qurancdn.com/Alafasy/mp3',
  'abdul-basit-murattal': 'https://audio.qurancdn.com/AbdulBaset/Murattal/mp3',
  'abdul-basit-mujawwad': 'https://audio.qurancdn.com/AbdulBaset/Mujawwad/mp3',
  'minshawi-murattal': 'https://audio.qurancdn.com/Minshawi/Murattal/mp3',
  'minshawi-mujawwad': 'https://audio.qurancdn.com/Minshawi/Mujawwad/mp3',
  husary: 'https://everyayah.com/data/Husary_128kbps',
  'husary-mujawwad': 'https://everyayah.com/data/Husary_Mujawwad_64kbps',
  'husary-muallim': 'https://everyayah.com/data/Husary_Muallim_128kbps',
  sudais: 'https://audio.qurancdn.com/Sudais/mp3',
  shuraim: 'https://audio.qurancdn.com/Shuraym/mp3',
  rifai: 'https://audio.qurancdn.com/Rifai/mp3',
  shaatree: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps',
  jibreel: 'https://audio.qurancdn.com/Jibreel/mp3',
  tunaiji: 'https://audio.qurancdn.com/Tunaiji/mp3',
  ghamdi: 'https://everyayah.com/data/Ghamadi_40kbps',
  ajamy: 'https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
  muaiqly: 'https://everyayah.com/data/MaherAlMuaiqly128kbps',
  hudhaify: 'https://everyayah.com/data/Hudhaify_128kbps',
  ayyoub: 'https://everyayah.com/data/Muhammad_Ayyoub_128kbps',
  basfar: 'https://everyayah.com/data/Abdullah_Basfar_192kbps',
  dussary: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps',
  alqatami: 'https://everyayah.com/data/Nasser_Alqatami_128kbps',
  juhaynee: 'https://everyayah.com/data/Abdullaah_3awwaad_Al-Juhaynee_128kbps',
  'ali-jaber': 'https://everyayah.com/data/Ali_Jaber_64kbps',
  'fares-abbad': 'https://everyayah.com/data/Fares_Abbad_64kbps',
  budair: 'https://everyayah.com/data/Salah_Al_Budair_128kbps',
  'muhsin-qasim': 'https://everyayah.com/data/Muhsin_Al_Qasim_192kbps',
  tablawi: 'https://everyayah.com/data/Mohammad_al_Tablaway_128kbps',
  'mustafa-ismail': 'https://everyayah.com/data/Mustafa_Ismail_48kbps',
  matroud: 'https://everyayah.com/data/Abdullah_Matroud_128kbps',
  neana: 'https://everyayah.com/data/Ahmed_Neana_128kbps',
  akhdar: 'https://everyayah.com/data/Ibrahim_Akhdar_32kbps',
  parhizgar: 'https://everyayah.com/data/Parhizgar_48kbps',
  'ayman-sowaid': 'https://everyayah.com/data/Ayman_Sowaid_64kbps',
  'sahl-yassin': 'https://everyayah.com/data/Sahl_Yassin_128kbps',
  'warsh-abdul-basit': 'https://everyayah.com/data/warsh/warsh_Abdul_Basit_128kbps',
  'warsh-aldosary': 'https://everyayah.com/data/warsh/warsh_ibrahim_aldosary_128kbps',
  'warsh-yassin': 'https://everyayah.com/data/warsh/warsh_yassin_al_jazaery_64kbps',
};

/** Map our reciter slugs to QuranCDN audio reciter IDs (for word segments). */
const RECITER_TIMING_IDS: Record<string, number> = {
  alafasy: 7,
  'abdul-basit-murattal': 2,
  'abdul-basit-mujawwad': 1,
  'minshawi-murattal': 9,
  'minshawi-mujawwad': 8,
  husary: 6,
  'husary-muallim': 12,
  sudais: 3,
  shuraim: 10,
  rifai: 5,
  shaatree: 4,
  tunaiji: 161,
  dussary: 97,
  tablawi: 11,
};

@Injectable()
export class AudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private verseFileName(surahNumber: number, ayahNumber: number) {
    return `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  }

  private getVerifiedAyahAudioUrl(reciterSlug: string, surahNumber: number, ayahNumber: number) {
    const base = RECITER_CDN_BASE[reciterSlug];
    if (!base) return null;
    return `${base}/${this.verseFileName(surahNumber, ayahNumber)}`;
  }

  private getLocalAyahAudioUrl(reciterSlug: string, surahNumber: number, ayahNumber: number) {
    const file = this.verseFileName(surahNumber, ayahNumber);
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
    const ayah = await this.prisma.ayah.findUnique({
      where: { id: ayahId },
      select: { id: true, number: true, surah: { select: { number: true } } },
    });
    if (!ayah) throw new NotFoundException('Ayah not found');

    const where: { ayahId: number; reciterId?: number } = { ayahId };
    let reciter =
      reciterSlug
        ? await this.prisma.reciter.findUnique({ where: { slug: reciterSlug } })
        : await this.prisma.reciter.findFirst({ where: { isDefault: true } })
          ?? await this.prisma.reciter.findFirst({ orderBy: { sortOrder: 'asc' } });

    if (reciterSlug && !reciter) throw new NotFoundException(`Reciter ${reciterSlug} not found`);
    if (reciter) where.reciterId = reciter.id;

    const files = await this.prisma.audioFile.findMany({
      where,
      include: {
        reciter: { select: { id: true, name: true, slug: true } },
        ayah: { select: { number: true, surah: { select: { number: true } } } },
      },
    });

    if (files.length > 0) {
      return files.map((file) => ({
        ...file,
        url: this.getLocalAyahAudioUrl(file.reciter.slug, file.ayah.surah.number, file.ayah.number)
          ?? this.getVerifiedAyahAudioUrl(file.reciter.slug, file.ayah.surah.number, file.ayah.number)
          ?? file.url,
      }));
    }

    if (!reciter) throw new NotFoundException('No audio found for this ayah');
    const url =
      this.getLocalAyahAudioUrl(reciter.slug, ayah.surah.number, ayah.number)
      ?? this.getVerifiedAyahAudioUrl(reciter.slug, ayah.surah.number, ayah.number)
      ?? (reciter.baseUrl
        ? `${reciter.baseUrl.replace(/\/$/, '/')}${this.verseFileName(ayah.surah.number, ayah.number)}`
        : null);
    if (!url) throw new NotFoundException('No audio found for this ayah');
    return [{
      id: 0,
      ayahId: ayah.id,
      reciterId: reciter.id,
      url,
      duration: null,
      format: 'mp3',
      reciter: { id: reciter.id, name: reciter.name, slug: reciter.slug },
      ayah: { number: ayah.number, surah: { number: ayah.surah.number } },
    }];
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

  async getWordTimingsForSurah(surahNumber: number, reciterSlug: string) {
    const timingReciterId = RECITER_TIMING_IDS[reciterSlug];
    if (!timingReciterId) {
      return {
        surahNumber,
        reciterSlug,
        available: false,
        ayahs: {} as Record<number, Array<{ position: number; startMs: number; endMs: number }>>,
      };
    }

    const cacheKey = `audio:timings:${reciterSlug}:${surahNumber}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = `https://api.qurancdn.com/api/qdc/audio/reciters/${timingReciterId}/audio_files?chapter=${surahNumber}&segments=true`;
    const response = await axios.get<{
      audio_files?: Array<{
        verse_timings?: Array<{
          verse_key: string;
          timestamp_from: number;
          timestamp_to: number;
          segments?: number[][];
        }>;
      }>;
    }>(url, { timeout: 30_000 });

    const verseTimings = response.data.audio_files?.[0]?.verse_timings ?? [];
    const ayahs: Record<number, Array<{ position: number; startMs: number; endMs: number }>> = {};

    for (const verse of verseTimings) {
      const ayahNumber = Number(String(verse.verse_key).split(':')[1]);
      if (!ayahNumber) continue;
      const verseStart = verse.timestamp_from ?? 0;
      const words: Array<{ position: number; startMs: number; endMs: number }> = [];
      for (const segment of verse.segments ?? []) {
        // QDC may interleave incomplete markers like [1] among timed triples
        // [position, startMsAbs, endMsAbs].
        if (!Array.isArray(segment) || segment.length < 3) continue;
        const position = Number(segment[0]);
        const startAbs = Number(segment[1]);
        const endAbs = Number(segment[2]);
        if (!Number.isFinite(position) || position < 1) continue;
        if (!Number.isFinite(startAbs) || !Number.isFinite(endAbs)) continue;
        const startMs = Math.max(0, startAbs - verseStart);
        const endMs = Math.max(startMs + 1, endAbs - verseStart);
        words.push({ position, startMs, endMs });
      }
      words.sort((a, b) => a.position - b.position);
      if (words.length) ayahs[ayahNumber] = words;
    }

    const payload = { surahNumber, reciterSlug, available: Object.keys(ayahs).length > 0, ayahs };
    await this.cache.set(cacheKey, JSON.stringify(payload), CACHE_TTL);
    return payload;
  }
}
