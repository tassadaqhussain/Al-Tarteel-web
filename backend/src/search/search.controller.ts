import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get('ayahs')
  @ApiOperation({ summary: 'Search by Arabic (Uthmani) text' })
  @ApiResponse({ status: 200 })
  searchAyahs(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('surah') surahNumber?: string,
    @Query('translator') translatorSlug?: string,
  ) {
    return this.search.searchAyahs(q || '', {
      limit: limit ? parseInt(limit, 10) : undefined,
      surahNumber: surahNumber ? parseInt(surahNumber, 10) : undefined,
      translatorSlug,
    });
  }

  @Get('translations')
  @ApiOperation({ summary: 'Search by translation text' })
  @ApiResponse({ status: 200 })
  searchTranslations(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('translator') translatorSlug?: string,
  ) {
    return this.search.searchTranslations(q || '', {
      limit: limit ? parseInt(limit, 10) : undefined,
      translatorSlug,
    });
  }

  @Get('semantic')
  @ApiOperation({ summary: 'Semantic concept search over indexed Quran translations' })
  @ApiResponse({ status: 200 })
  searchSemantic(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('language') language?: string,
    @Query('documentType') documentType?: string,
    @Query('surah') surahNumber?: string,
  ) {
    return this.search.searchSemantic(q || '', {
      limit: limit ? parseInt(limit, 10) : undefined,
      language: language || 'en',
      documentType: documentType || 'translation',
      surahNumber: surahNumber ? parseInt(surahNumber, 10) : undefined,
    });
  }
}
