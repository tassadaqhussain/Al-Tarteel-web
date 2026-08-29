import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiKnowledgeModule } from '../ai-knowledge/ai-knowledge.module';

@Module({
  imports: [AiKnowledgeModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
