import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compareRecitation } from './arabic-compare';
import { CheckHifzDto, RecordHifzAttemptDto } from './dto/hifz.dto';

@Injectable()
export class HifzService {
  constructor(private readonly prisma: PrismaService) {}

  async check(dto: CheckHifzDto) {
    const ayah = await this.findAyah(dto.surahNumber, dto.ayahNumber);
    return {
      surahNumber: dto.surahNumber,
      ayahNumber: dto.ayahNumber,
      ayahId: ayah.id,
      expected: ayah.textUthmani,
      ...compareRecitation(ayah.textUthmani, dto.transcript),
      mode: dto.mode ?? 'type',
    };
  }

  async recordAttempt(userId: number, dto: RecordHifzAttemptDto) {
    const ayah = await this.findAyah(dto.surahNumber, dto.ayahNumber);
    const result = compareRecitation(ayah.textUthmani, dto.transcript);
    const accuracy = dto.accuracy ?? result.accuracy;
    const isCorrect = dto.isCorrect ?? result.isCorrect;

    const attempt = await this.prisma.hifzAttempt.create({
      data: {
        userId,
        surahNumber: dto.surahNumber,
        ayahNumber: dto.ayahNumber,
        ayahId: ayah.id,
        mode: dto.mode,
        transcript: dto.transcript,
        accuracy,
        isCorrect,
        practiceDate: dto.practiceDate,
      },
    });

    await this.bumpDailyStat(userId, dto.practiceDate, accuracy, isCorrect);

    return {
      attempt,
      check: {
        expected: ayah.textUthmani,
        ...result,
        accuracy,
        isCorrect,
      },
    };
  }

  async dailyStats(userId: number, days = 14) {
    const limit = Math.min(Math.max(days, 1), 90);
    const rows = await this.prisma.hifzDailyStat.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    return rows.reverse();
  }

  async surahProgress(userId: number, surahNumber: number) {
    const attempts = await this.prisma.hifzAttempt.findMany({
      where: { userId, surahNumber },
      orderBy: { createdAt: 'desc' },
    });

    const bestByAyah = new Map<
      number,
      { ayahNumber: number; accuracy: number; isCorrect: boolean; attempts: number }
    >();

    for (const a of attempts) {
      const cur = bestByAyah.get(a.ayahNumber);
      if (!cur) {
        bestByAyah.set(a.ayahNumber, {
          ayahNumber: a.ayahNumber,
          accuracy: a.accuracy,
          isCorrect: a.isCorrect,
          attempts: 1,
        });
      } else {
        cur.attempts += 1;
        if (a.accuracy > cur.accuracy) {
          cur.accuracy = a.accuracy;
          cur.isCorrect = a.isCorrect;
        } else if (a.isCorrect) {
          cur.isCorrect = true;
        }
      }
    }

    const ayahs = [...bestByAyah.values()].sort((x, y) => x.ayahNumber - y.ayahNumber);
    const mastered = ayahs.filter((a) => a.isCorrect).length;
    return {
      surahNumber,
      mastered,
      practiced: ayahs.length,
      ayahs,
    };
  }

  private async bumpDailyStat(
    userId: number,
    date: string,
    accuracy: number,
    isCorrect: boolean,
  ) {
    const existing = await this.prisma.hifzDailyStat.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!existing) {
      await this.prisma.hifzDailyStat.create({
        data: {
          userId,
          date,
          attempts: 1,
          correct: isCorrect ? 1 : 0,
          accuracySum: accuracy,
          avgAccuracy: accuracy,
        },
      });
      return;
    }
    const attempts = existing.attempts + 1;
    const correct = existing.correct + (isCorrect ? 1 : 0);
    const accuracySum = existing.accuracySum + accuracy;
    await this.prisma.hifzDailyStat.update({
      where: { id: existing.id },
      data: {
        attempts,
        correct,
        accuracySum,
        avgAccuracy: Math.round((accuracySum / attempts) * 10) / 10,
      },
    });
  }

  private async findAyah(surahNumber: number, ayahNumber: number) {
    const surah = await this.prisma.surah.findUnique({ where: { number: surahNumber } });
    if (!surah) throw new NotFoundException(`Surah ${surahNumber} not found`);
    const ayah = await this.prisma.ayah.findUnique({
      where: { surahId_number: { surahId: surah.id, number: ayahNumber } },
    });
    if (!ayah) {
      throw new NotFoundException(`Ayah ${surahNumber}:${ayahNumber} not found`);
    }
    return ayah;
  }
}
