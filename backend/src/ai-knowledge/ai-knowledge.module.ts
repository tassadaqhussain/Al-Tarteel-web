import { Module } from '@nestjs/common';
import { AiKnowledgeController } from './ai-knowledge.controller';
import { KnowledgeSourceService } from './knowledge-source.service';
import { QuranIndexerService } from './quran-indexer.service';
import { SemanticSearchService } from './semantic-search.service';
import { GeminiEmbeddingProvider } from '../ai/providers/gemini-embedding.provider';
import { EmbeddingService } from '../ai/providers/embedding.service';

@Module({
  controllers: [AiKnowledgeController],
  providers: [
    KnowledgeSourceService,
    QuranIndexerService,
    SemanticSearchService,
    GeminiEmbeddingProvider,
    EmbeddingService,
  ],
  exports: [KnowledgeSourceService, QuranIndexerService, SemanticSearchService, EmbeddingService],
})
export class AiKnowledgeModule {}
