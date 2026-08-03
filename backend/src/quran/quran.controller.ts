import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuranService } from './quran.service';
import { AyahsBySurahQueryDto, AyahsByPageQueryDto } from './dto/query.dto';

@ApiTags('Quran')
@Controller('quran')
export class QuranController {
  constructor(private readonly quran: QuranService) {}

  @Get('surahs')
  @ApiOperation({ summary: 'List all 114 surahs' })
  @ApiResponse({ status: 200, description: 'List of surahs' })
  findAllSurahs() {
    return this.quran.findAllSurahs();
  }

  @Get('surahs/:number')
  @ApiOperation({ summary: 'Get surah metadata by number (1-114)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findSurahByNumber(@Param('number', ParseIntPipe) number: number) {
    return this.quran.findSurahByNumber(number);
  }

  @Get('surahs/:number/ayahs')
  @ApiOperation({ summary: 'Get ayahs of a surah with optional translations and words' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findAyahsBySurah(
    @Param('number', ParseIntPipe) number: number,
    @Query() query: AyahsBySurahQueryDto,
  ) {
    return this.quran.findAyahsBySurah(number, query);
  }

  @Get('pages/:pageNumber/ayahs')
  @ApiOperation({ summary: 'Get ayahs by Madani page (1-604)' })
  @ApiResponse({ status: 200 })
  findAyahsByPage(
    @Param('pageNumber', ParseIntPipe) pageNumber: number,
    @Query() query: AyahsByPageQueryDto,
  ) {
    return this.quran.findAyahsByPage(pageNumber, query);
  }

  @Get('juz/:juzNumber/ayahs')
  @ApiOperation({ summary: 'Get ayahs by Juz (1-30)' })
  @ApiResponse({ status: 200 })
  findAyahsByJuz(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Query() query: AyahsByPageQueryDto,
  ) {
    return this.quran.findAyahsByJuz(juzNumber, query);
  }

  @Get('surahs/:surahNumber/ayahs/:ayahNumber')
  @ApiOperation({ summary: 'Get single ayah with optional translations and words' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOneAyah(
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @Param('ayahNumber', ParseIntPipe) ayahNumber: number,
    @Query('translations') translations?: string,
    @Query('words') words?: string,
  ) {
    return this.quran.findOneAyah(surahNumber, ayahNumber, translations, words === 'true');
  }

  @Get('translators')
  @ApiOperation({ summary: 'List translators; optional language filter' })
  @ApiResponse({ status: 200 })
  getTranslators(@Query('language') languageCode?: string) {
    return this.quran.getTranslators(languageCode);
  }

  @Get('ayahs/:ayahId/tafsir')
  @ApiOperation({ summary: 'Get tafsir for an ayah; optional source slug' })
  @ApiResponse({ status: 200 })
  getTafsir(
    @Param('ayahId', ParseIntPipe) ayahId: number,
    @Query('source') sourceSlug?: string,
  ) {
    return this.quran.getTafsir(ayahId, sourceSlug);
  }

  @Get('tafsir/sources')
  @ApiOperation({ summary: 'List tafsir sources' })
  @ApiResponse({ status: 200 })
  getTafsirSources() {
    return this.quran.getTafsirSources();
  }
}
