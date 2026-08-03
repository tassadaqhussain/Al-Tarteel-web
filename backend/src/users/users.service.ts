import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    const list = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        ayah: {
          include: { surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } } },
        },
      },
    });
    return list.map((b) => ({
      id: b.id,
      ayahId: b.ayahId,
      note: b.note,
      createdAt: b.createdAt,
      ayah: b.ayah,
      surah: b.ayah.surah,
    }));
  }

  async addBookmark(userId: number, ayahId: number, note?: string) {
    await this.prisma.bookmark.upsert({
      where: { userId_ayahId: { userId, ayahId } },
      create: { userId, ayahId, note },
      update: { note },
    });
    return { ok: true, ayahId };
  }

  async removeBookmark(userId: number, ayahId: number) {
    await this.prisma.bookmark.deleteMany({ where: { userId, ayahId } });
    return { ok: true };
  }

  async getReadingHistory(userId: number, limit = 50) {
    const history = await this.prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { readAt: 'desc' },
      take: limit,
      include: {
        ayah: {
          include: { surah: { select: { id: true, number: true, nameArabic: true, nameSimple: true } } },
        },
      },
    });
    return history.map((h) => ({
      ayahId: h.ayahId,
      readAt: h.readAt,
      ayah: h.ayah,
      surah: h.ayah.surah,
    }));
  }

  async recordReading(
    userId: number,
    body: { ayahId: number; surahNumber?: number; ayahNumber?: number; page?: number },
  ) {
    await this.prisma.readingHistory.create({
      data: { userId, ayahId: body.ayahId },
    });
    if (body.surahNumber != null || body.ayahNumber != null || body.page != null) {
      let lastReadSurahId: number | undefined;
      if (body.surahNumber) {
        const surah = await this.prisma.surah.findUnique({ where: { number: body.surahNumber } });
        if (surah) lastReadSurahId = surah.id;
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastReadSurahId,
          lastReadAyahNumber: body.ayahNumber ?? undefined,
          lastReadPage: body.page ?? undefined,
        },
      });
    }
    return { ok: true };
  }

  async getLastRead(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastReadSurahId: true,
        lastReadAyahNumber: true,
        lastReadPage: true,
        lastReadSurah: { select: { number: true, nameArabic: true, nameSimple: true } },
      },
    });
    if (!user) return null;
    return {
      surahNumber: user.lastReadSurah?.number,
      ayahNumber: user.lastReadAyahNumber,
      page: user.lastReadPage,
      surah: user.lastReadSurah,
    };
  }
}
