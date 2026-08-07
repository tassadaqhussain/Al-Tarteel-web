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

  async getActiveDailyGoal(userId: number) {
    return this.prisma.userDailyGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async setDailyGoal(
    userId: number,
    body: { goalType: string; goalValue: number },
  ) {
    await this.prisma.userDailyGoal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    return this.prisma.userDailyGoal.create({
      data: {
        userId,
        goalType: body.goalType,
        goalValue: Math.max(1, Math.min(body.goalValue || 5, 500)),
        isActive: true,
      },
    });
  }

  async clearDailyGoal(userId: number) {
    await this.prisma.userDailyGoal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    return { ok: true as const };
  }

  async getDailyProgress(userId: number, date: string) {
    const row = await this.prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date } },
    });
    return (
      row ?? {
        userId,
        date,
        ayahsRead: 0,
        minutesRead: 0,
        tajweedPracticed: false,
        goalCompleted: false,
      }
    );
  }

  async upsertDailyProgress(
    userId: number,
    body: {
      date: string;
      ayahsRead?: number;
      minutesRead?: number;
      tajweedPracticed?: boolean;
      incrementAyahs?: number;
      incrementMinutes?: number;
    },
  ) {
    const date = body.date;
    const existing = await this.prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date } },
    });
    const ayahsRead = Math.max(
      0,
      (body.ayahsRead ?? existing?.ayahsRead ?? 0) + (body.incrementAyahs ?? 0),
    );
    const minutesRead = Math.max(
      0,
      (body.minutesRead ?? existing?.minutesRead ?? 0) + (body.incrementMinutes ?? 0),
    );
    const tajweedPracticed = body.tajweedPracticed ?? existing?.tajweedPracticed ?? false;

    const goal = await this.getActiveDailyGoal(userId);
    let goalCompleted = existing?.goalCompleted ?? false;
    if (goal) {
      if (goal.goalType === 'read_ayahs' && ayahsRead >= goal.goalValue) goalCompleted = true;
      if (goal.goalType === 'read_minutes' && minutesRead >= goal.goalValue) goalCompleted = true;
      if (goal.goalType === 'tajweed_rule' && tajweedPracticed) goalCompleted = true;
      if (goal.goalType === 'listen' && (ayahsRead > 0 || minutesRead > 0)) goalCompleted = true;
      if (goal.goalType === 'read_page' && ayahsRead >= Math.max(1, goal.goalValue) * 15)
        goalCompleted = true;
    }

    return this.prisma.dailyProgress.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        ayahsRead,
        minutesRead,
        tajweedPracticed,
        goalCompleted,
      },
      update: {
        ayahsRead,
        minutesRead,
        tajweedPracticed,
        goalCompleted,
      },
    });
  }

  async getMotivationPreferences(userId: number) {
    return (
      (await this.prisma.userMotivationPreference.findUnique({ where: { userId } })) ?? {
        userId,
        reminderEnabled: false,
        reminderSlot: null,
        reminderTime: null,
        timezone: 'UTC',
      }
    );
  }

  async setMotivationPreferences(
    userId: number,
    body: {
      reminderEnabled?: boolean;
      reminderSlot?: string | null;
      reminderTime?: string | null;
      timezone?: string;
    },
  ) {
    return this.prisma.userMotivationPreference.upsert({
      where: { userId },
      create: {
        userId,
        reminderEnabled: body.reminderEnabled ?? false,
        reminderSlot: body.reminderSlot ?? null,
        reminderTime: body.reminderTime ?? null,
        timezone: body.timezone ?? 'UTC',
      },
      update: {
        reminderEnabled: body.reminderEnabled,
        reminderSlot: body.reminderSlot,
        reminderTime: body.reminderTime,
        timezone: body.timezone,
      },
    });
  }

  async listApprovedMotivationalMessages(language = 'en') {
    return this.prisma.motivationalMessage.findMany({
      where: { isActive: true, status: 'approved', language },
      orderBy: { id: 'asc' },
      select: { id: true, message: true, category: true, language: true },
    });
  }
}
