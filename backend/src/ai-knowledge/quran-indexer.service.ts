import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/providers/embedding.service';
import { KnowledgeSourceService } from './knowledge-source.service';

type IndexStats = {
  sourcesProcessed: number;
  documentsUpserted: number;
  embeddingsGenerated: number;
  skipped: number;
};

@Injectable()
export class QuranIndexerService {
  private readonly logger = new Logger(QuranIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly knowledgeSources: KnowledgeSourceService,
    private readonly embeddings: EmbeddingService,
  ) {}

  private getBatchSize() {
    const raw = this.config.get<string>('AI_INDEX_BATCH_SIZE')?.trim();
    const n = raw ? Number(raw) : 32;
    return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 100) : 32;
  }

  private getTranslatorSlugs(): string[] {
    const raw = this.config.get<string>('AI_INDEX_TRANSLATORS')?.trim();
    if (raw) {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return ['en-sahih-international', 'sahih-international'];
  }

  async indexTranslations(options: { translatorSlugs?: string[]; embed?: boolean } = {}) {
    const stats: IndexStats = {
      sourcesProcessed: 0,
      documentsUpserted: 0,
      embeddingsGenerated: 0,
      skipped: 0,
    };

    await this.knowledgeSources.seedDefaults();
    const slugs = options.translatorSlugs ?? this.getTranslatorSlugs();

    for (const slug of slugs) {
      const translator = await this.prisma.translator.findUnique({ where: { slug } });
      if (!translator) {
        this.logger.warn(`Translator not found: ${slug}`);
        stats.skipped += 1;
        continue;
      }

      let source = await this.prisma.knowledgeSource.findFirst({
        where: { externalRef: slug, sourceType: 'translation' },
      });

      if (!source) {
        source = await this.prisma.knowledgeSource.create({
          data: {
            name: translator.name,
            slug: slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
            sourceType: 'translation',
            languageCode: translator.languageCode,
            scholarOrPublisher: translator.name,
            reliabilityTier: 'approved',
            status: 'approved',
            externalRef: slug,
          },
        });
      }

      stats.sourcesProcessed += 1;
      const upserted = await this.upsertTranslationDocuments(
        source.id,
        translator.id,
        slug,
        translator.languageCode,
      );
      stats.documentsUpserted += upserted;
      await this.knowledgeSources.updateDocumentCount(source.id);
    }

    if (options.embed !== false && this.embeddings.isConfigured()) {
      stats.embeddingsGenerated = await this.embedPendingDocuments();
    }

    return stats;
  }

  private async upsertTranslationDocuments(
    sourceId: number,
    translatorId: number,
    translatorSlug: string,
    languageCode: string,
  ) {
    const batchSize = 500;
    let offset = 0;
    let upserted = 0;

    while (true) {
      const rows = await this.prisma.ayahTranslation.findMany({
        where: { translatorId },
        include: {
          ayah: { include: { surah: { select: { number: true, nameSimple: true } } } },
        },
        orderBy: [{ ayah: { surahId: 'asc' } }, { ayah: { number: 'asc' } }],
        skip: offset,
        take: batchSize,
      });

      if (!rows.length) break;

      for (const row of rows) {
        const surahNumber = row.ayah.surah.number;
        const ayahNumber = row.ayah.number;
        const text = row.text.trim();
        if (!text) continue;

        const contentHash = this.knowledgeSources.contentHash([
          'translation',
          translatorSlug,
          String(surahNumber),
          String(ayahNumber),
          text,
        ]);

        const sourceReference = `${row.ayah.surah.nameSimple} ${surahNumber}:${ayahNumber} (${translatorSlug})`;

        await this.prisma.quranDocument.upsert({
          where: { contentHash },
          create: {
            surahNumber,
            ayahNumber,
            ayahId: row.ayahId,
            documentType: 'translation',
            language: languageCode,
            text,
            sourceId,
            sourceReference,
            contentHash,
            metadata: {
              translatorSlug,
              surahName: row.ayah.surah.nameSimple,
            },
          },
          update: {
            text,
            sourceReference,
            ayahId: row.ayahId,
            metadata: {
              translatorSlug,
              surahName: row.ayah.surah.nameSimple,
            },
          },
        });
        upserted += 1;
      }

      offset += rows.length;
      if (rows.length < batchSize) break;
    }

    return upserted;
  }

  async embedPendingDocuments(limit = 5000) {
    if (!this.embeddings.isConfigured()) return 0;

    const batchSize = this.getBatchSize();
    let total = 0;

    while (total < limit) {
      const pending = await this.prisma.$queryRaw<
        Array<{ id: number; text: string }>
      >`
        SELECT id, text
        FROM quran_documents
        WHERE embedding IS NULL
        ORDER BY id ASC
        LIMIT ${batchSize}
      `;

      if (!pending.length) break;

      const vectors = await this.embeddings.embed(pending.map((row) => row.text));

      for (let i = 0; i < pending.length; i += 1) {
        const row = pending[i];
        const vector = vectors[i];
        if (!vector?.length) continue;

        const vectorLiteral = this.embeddings.formatVector(vector);
        await this.prisma.$executeRawUnsafe(
          `UPDATE quran_documents SET embedding = $1::vector, indexed_at = NOW(), updated_at = NOW() WHERE id = $2`,
          vectorLiteral,
          row.id,
        );
        total += 1;
      }

      this.logger.log(`Embedded ${total} documents so far...`);

      if (pending.length < batchSize) break;
    }

    return total;
  }

  async getIndexStatus() {
    const [total, embedded, sources] = await Promise.all([
      this.prisma.quranDocument.count(),
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM quran_documents WHERE embedding IS NOT NULL
      `,
      this.prisma.knowledgeSource.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          sourceType: true,
          languageCode: true,
          status: true,
          documentCount: true,
          lastIndexedAt: true,
        },
      }),
    ]);

    return {
      documentsTotal: total,
      documentsEmbedded: Number(embedded[0]?.count ?? 0),
      sources,
      embedding: this.embeddings.getPublicConfig(),
    };
  }
}
