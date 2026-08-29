import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuranIndexerService } from './quran-indexer.service';
import { EmbeddingService } from '../ai/providers/embedding.service';

@ApiTags('AI Knowledge')
@Controller('ai/knowledge')
export class AiKnowledgeController {
  constructor(
    private readonly indexer: QuranIndexerService,
    private readonly embeddings: EmbeddingService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Embedding index status (public read)' })
  status() {
    return this.indexer.getIndexStatus();
  }

  @Get('config')
  @ApiOperation({ summary: 'Semantic search configuration' })
  config() {
    return {
      semanticSearchEnabled: this.embeddings.isConfigured(),
      embedding: this.embeddings.getPublicConfig(),
    };
  }
}
