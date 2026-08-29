import { ConfigService } from '@nestjs/config';
import { SemanticSearchService } from './semantic-search.service';

describe('SemanticSearchService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    ayah: { findMany: jest.fn() },
  };
  const config = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        AI_SEMANTIC_SEARCH_ENABLED: 'true',
        AI_SEMANTIC_MIN_SCORE: '0.55',
        AI_SEMANTIC_CACHE_TTL: '3600',
      };
      return map[key];
    }),
  } as unknown as ConfigService;

  const embeddings = {
    isConfigured: jest.fn().mockReturnValue(true),
    embedOne: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    formatVector: jest.fn().mockReturnValue('[0.1,0.2,0.3]'),
  };

  const cache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  const service = new SemanticSearchService(prisma as any, config, embeddings as any, cache as any);

  beforeEach(() => jest.clearAllMocks());

  it('returns empty results for blank query without calling embed', async () => {
    const result = await service.search('   ');
    expect(result.results).toEqual([]);
    expect(embeddings.embedOne).not.toHaveBeenCalled();
  });

  it('filters results below minimum score', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 1,
        surah_number: 2,
        ayah_number: 153,
        ayah_id: 10,
        document_type: 'translation',
        language: 'en',
        text: 'Seek help through patience and prayer.',
        source_reference: 'Al-Baqarah 2:153',
        metadata: {},
        score: 0.82,
      },
      {
        id: 2,
        surah_number: 3,
        ayah_number: 1,
        ayah_id: 11,
        document_type: 'translation',
        language: 'en',
        text: 'Unrelated',
        source_reference: 'Al-Imran 3:1',
        metadata: {},
        score: 0.4,
      },
    ]);
    prisma.ayah.findMany.mockResolvedValue([
      {
        id: 10,
        textUthmani: 'يَا أَيُّهَا',
        surah: { number: 2, nameArabic: 'البقرة', nameSimple: 'Al-Baqarah' },
      },
    ]);

    const result = await service.search('patience', { limit: 5, language: 'en' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].surahNumber).toBe(2);
    expect(result.results[0].score).toBeGreaterThanOrEqual(0.55);
  });

  it('reports disabled when embeddings not configured', () => {
    embeddings.isConfigured.mockReturnValue(false);
    expect(service.isEnabled()).toBe(false);
  });
});
