import { createHash } from 'crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { EmbeddingService } from '../ai/providers/embedding.service';

export type SemanticSearchResult = {
  id: number;
  surahNumber: number | null;
  ayahNumber: number | null;
  ayahId: number | null;
  documentType: string;
  language: string;
  text: string;
  sourceReference: string;
  score: number;
  surah?: {
    number: number;
    nameArabic: string;
    nameSimple: string;
  } | null;
  arabicText?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class SemanticSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly embeddings: EmbeddingService,
    private readonly cache: CacheService,
  ) {}

  isEnabled() {
    if (this.config.get<string>('AI_SEMANTIC_SEARCH_ENABLED') === 'false') return false;
    return this.embeddings.isConfigured();
  }

  private getMinScore() {
    const raw = this.config.get<string>('AI_SEMANTIC_MIN_SCORE')?.trim();
    const n = raw ? Number(raw) : 0.55;
    return Number.isFinite(n) ? n : 0.55;
  }

  private getCacheTtl() {
    const raw = this.config.get<string>('AI_SEMANTIC_CACHE_TTL')?.trim();
    const n = raw ? Number(raw) : 3600;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3600;
  }

  private cacheKey(query: string, language: string, limit: number, documentType?: string) {
    const hash = createHash('sha256')
      .update([query.trim().toLowerCase(), language, String(limit), documentType ?? ''].join('|'))
      .digest('hex')
      .slice(0, 24);
    return `ai:search:${hash}`;
  }

  async search(
    query: string,
    options: {
      limit?: number;
      language?: string;
      documentType?: string;
      surahNumber?: number;
    } = {},
  ) {
    const q = query?.trim();
    if (!q) return { enabled: this.isEnabled(), results: [] as SemanticSearchResult[] };

    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        'Semantic search is not available. Configure GEMINI_API_KEY and run npm run ai:index.',
      );
    }

    const limit = Math.min(options.limit ?? 20, 50);
    const language = options.language ?? 'en';
    const documentType = options.documentType ?? 'translation';
    const cacheKey = this.cacheKey(q, language, limit, documentType);

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as { enabled: boolean; results: SemanticSearchResult[]; cached: boolean };
      } catch {
        // ignore bad cache
      }
    }

    const queryVector = await this.embeddings.embedOne(q);
    const vectorLiteral = this.embeddings.formatVector(queryVector);
    const minScore = this.getMinScore();

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: number;
        surah_number: number | null;
        ayah_number: number | null;
        ayah_id: number | null;
        document_type: string;
        language: string;
        text: string;
        source_reference: string;
        metadata: Prisma.JsonValue;
        score: number;
      }>
    >(Prisma.sql`
      SELECT
        d.id,
        d.surah_number,
        d.ayah_number,
        d.ayah_id,
        d.document_type,
        d.language,
        d.text,
        d.source_reference,
        d.metadata,
        1 - (d.embedding <=> ${vectorLiteral}::vector) AS score
      FROM quran_documents d
      INNER JOIN knowledge_sources s ON s.id = d.source_id
      WHERE d.embedding IS NOT NULL
        AND s.status = 'approved'
        AND d.document_type = ${documentType}
        AND d.language = ${language}
        ${options.surahNumber ? Prisma.sql`AND d.surah_number = ${options.surahNumber}` : Prisma.empty}
      ORDER BY d.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `);

    const filtered = rows.filter((row) => row.score >= minScore);

    const ayahIds = filtered.map((r) => r.ayah_id).filter((id): id is number => id != null);
    const ayahs = ayahIds.length
      ? await this.prisma.ayah.findMany({
          where: { id: { in: ayahIds } },
          include: { surah: { select: { number: true, nameArabic: true, nameSimple: true } } },
        })
      : [];
    const ayahMap = new Map(ayahs.map((a) => [a.id, a]));

    const results: SemanticSearchResult[] = filtered.map((row) => {
      const ayah = row.ayah_id ? ayahMap.get(row.ayah_id) : null;
      return {
        id: row.id,
        surahNumber: row.surah_number,
        ayahNumber: row.ayah_number,
        ayahId: row.ayah_id,
        documentType: row.document_type,
        language: row.language,
        text: row.text,
        sourceReference: row.source_reference,
        score: Number(row.score.toFixed(4)),
        surah: ayah?.surah ?? null,
        arabicText: ayah?.textUthmani ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? null,
      };
    });

    const payload = { enabled: true, results, cached: false };
    await this.cache.set(cacheKey, JSON.stringify(payload), this.getCacheTtl());
    return payload;
  }
}
