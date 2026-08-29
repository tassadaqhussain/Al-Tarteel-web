import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type KnowledgeSourceType =
  | 'quran'
  | 'translation'
  | 'tafsir'
  | 'hadith'
  | 'vocabulary'
  | 'learning_content'
  | 'topic';

export const DEFAULT_KNOWLEDGE_SOURCES = [
  {
    name: 'Quran (Uthmani Arabic)',
    slug: 'quran-ar',
    sourceType: 'quran' as const,
    languageCode: 'ar',
    scholarOrPublisher: 'Canonical',
    reliabilityTier: 'canonical',
    status: 'approved' as const,
    externalRef: null,
  },
  {
    name: 'Sahih International',
    slug: 'sahih-international',
    sourceType: 'translation' as const,
    languageCode: 'en',
    scholarOrPublisher: 'Sahih International',
    reliabilityTier: 'approved',
    status: 'approved' as const,
    externalRef: 'en-sahih-international',
  },
];

@Injectable()
export class KnowledgeSourceService {
  constructor(private readonly prisma: PrismaService) {}

  contentHash(parts: string[]) {
    return createHash('sha256').update(parts.join('|')).digest('hex');
  }

  async seedDefaults() {
    for (const source of DEFAULT_KNOWLEDGE_SOURCES) {
      await this.prisma.knowledgeSource.upsert({
        where: { slug: source.slug },
        create: source,
        update: {
          name: source.name,
          sourceType: source.sourceType,
          languageCode: source.languageCode,
          scholarOrPublisher: source.scholarOrPublisher,
          reliabilityTier: source.reliabilityTier,
          status: source.status,
          externalRef: source.externalRef,
        },
      });
    }
  }

  async listApproved(options: { sourceType?: KnowledgeSourceType; languageCode?: string } = {}) {
    return this.prisma.knowledgeSource.findMany({
      where: {
        status: 'approved',
        ...(options.sourceType ? { sourceType: options.sourceType } : {}),
        ...(options.languageCode ? { languageCode: options.languageCode } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.knowledgeSource.findUnique({ where: { slug } });
  }

  async updateDocumentCount(sourceId: number) {
    const count = await this.prisma.quranDocument.count({ where: { sourceId } });
    await this.prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { documentCount: count, lastIndexedAt: new Date() },
    });
    return count;
  }
}
