import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compareRecitation } from './arabic-compare';
import { CheckHifzDto, RecordHifzAttemptDto, SetHifzStatusDto } from './dto/hifz.dto';

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


  /**
   * Set the memorisation status for one ayah or an inclusive range.
   *
   * Upserts rather than appends: this is the ayah's current state, unlike
   * HifzAttempt which is an append-only practice log. Re-marking an ayah
   * overwrites it, so a user can move a verse back to 'practicing' freely.
   */
  async setStatus(userId: number, dto: SetHifzStatusDto) {
    const surah = await this.prisma.surah.findUnique({
      where: { number: dto.surahNumber },
    });
    if (!surah) throw new NotFoundException(`Surah ${dto.surahNumber} not found`);

    const from = dto.fromAyah;
    const to = dto.toAyah ?? from;
    if (to < from) {
      throw new BadRequestException('toAyah must not be before fromAyah');
    }
    if (to > surah.numberOfAyahs) {
      throw new BadRequestException(
        `Surah ${dto.surahNumber} has ${surah.numberOfAyahs} ayahs`,
      );
    }

    const ayahNumbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    await this.prisma.$transaction(
      ayahNumbers.map((ayahNumber) =>
        this.prisma.hifzAyahStatus.upsert({
          where: {
            userId_surahNumber_ayahNumber: {
              userId,
              surahNumber: dto.surahNumber,
              ayahNumber,
            },
          },
          create: {
            userId,
            surahNumber: dto.surahNumber,
            ayahNumber,
            status: dto.status,
          },
          update: { status: dto.status },
        }),
      ),
    );

    return { ok: true, surahNumber: dto.surahNumber, from, to, status: dto.status };
  }

  /** Current status of every marked ayah in a surah, for this user only. */
  async getStatuses(userId: number, surahNumber: number) {
    const rows = await this.prisma.hifzAyahStatus.findMany({
      where: { userId, surahNumber },
      select: { ayahNumber: true, status: true, updatedAt: true },
      orderBy: { ayahNumber: 'asc' },
    });
    return rows;
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
