/**
 * One-off migration script to strip stray footnote markers glued to words in
 * existing `AyahTranslation` rows and flush Redis quran cache.
 *
 * Usage:
 *   npm run translations:clean
 */
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { cleanTranslationText } from '../src/quran/clean-translation';

const prisma = new PrismaClient();
const BATCH_SIZE = 2000;

async function main() {
  let cursorId: number | undefined;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const rows = await prisma.ayahTranslation.findMany({
      take: BATCH_SIZE,
      ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, text: true },
    });
    if (rows.length === 0) break;

    const updates: Array<{ id: number; text: string }> = [];
    for (const row of rows) {
      scanned += 1;
      const cleaned = cleanTranslationText(row.text);
      if (cleaned !== row.text) {
        updates.push({ id: row.id, text: cleaned });
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(
        updates.map((u) =>
          prisma.ayahTranslation.update({
            where: { id: u.id },
            data: { text: u.text },
          }),
        ),
      );
      updated += updates.length;
    }

    cursorId = rows[rows.length - 1].id;
  }

  console.log(`Scanned ${scanned} translation rows; cleaned ${updated} rows.`);

  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL);
    try {
      const keys = await redis.keys('quran:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} cached Redis keys.`);
      }
    } finally {
      await redis.quit();
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
