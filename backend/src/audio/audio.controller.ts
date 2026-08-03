import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AudioService } from './audio.service';

@ApiTags('Audio')
@Controller('audio')
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('reciters')
  @ApiOperation({ summary: 'List all reciters' })
  @ApiResponse({ status: 200 })
  getReciters() {
    return this.audio.getReciters();
  }

  @Get('ayah/:ayahId')
  @ApiOperation({ summary: 'Get audio file(s) for an ayah; optional reciter slug' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getAudioForAyah(
    @Param('ayahId', ParseIntPipe) ayahId: number,
    @Query('reciter') reciterSlug?: string,
  ) {
    return this.audio.getAudioForAyah(ayahId, reciterSlug);
  }

  @Get('surah/:surahNumber')
  @ApiOperation({ summary: 'Get audio metadata for all ayahs in a surah (verse-by-verse URLs)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getAudioForSurah(
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @Query('reciter') reciterSlug: string,
  ) {
    return this.audio.getAudioForSurah(surahNumber, reciterSlug);
  }
}
