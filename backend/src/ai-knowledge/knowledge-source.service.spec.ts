import { KnowledgeSourceService } from './knowledge-source.service';

describe('KnowledgeSourceService', () => {
  const prisma = {
    knowledgeSource: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    quranDocument: {
      count: jest.fn(),
    },
  };

  const service = new KnowledgeSourceService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it('generates stable content hashes', () => {
    const hash1 = service.contentHash(['translation', 'en-sahih-international', '2', '255', 'Allah!']);
    const hash2 = service.contentHash(['translation', 'en-sahih-international', '2', '255', 'Allah!']);
    const hash3 = service.contentHash(['translation', 'en-sahih-international', '2', '256', 'Allah!']);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('seeds default knowledge sources', async () => {
    prisma.knowledgeSource.upsert.mockResolvedValue({});
    await service.seedDefaults();
    expect(prisma.knowledgeSource.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.knowledgeSource.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'sahih-international' } }),
    );
  });
});
