import { Controller, Get, Param, Query, ParseIntPipe, Req, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import type { Request, Response } from 'express';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

  @Get('files/:reciter/:file')
  @ApiOperation({ summary: 'Stream a locally stored ayah MP3 with byte-range support' })
  streamLocalAudio(
    @Param('reciter') reciter: string,
    @Param('file') file: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!/^[a-z0-9-]+$/.test(reciter) || !/^\d{6}\.mp3$/.test(file)) throw new NotFoundException('Audio not found');
    const root = process.env.AUDIO_STORAGE_PATH || join(process.cwd(), 'storage', 'audio');
    const path = join(root, reciter, file);
    if (!existsSync(path)) throw new NotFoundException('Audio not found');
    const size = statSync(path).size;
    const range = request.headers.range;
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (!range) {
      response.setHeader('Content-Length', size);
      return createReadStream(path).pipe(response);
    }
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) return response.status(416).setHeader('Content-Range', `bytes */${size}`).end();
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start > end || start >= size) return response.status(416).setHeader('Content-Range', `bytes */${size}`).end();
    response.status(206);
    response.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    response.setHeader('Content-Length', end - start + 1);
    return createReadStream(path, { start, end }).pipe(response);
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

  @Get('surah/:surahNumber/word-timings')
  @ApiOperation({ summary: 'Word-level timing segments for surah recitation highlight sync' })
  @ApiResponse({ status: 200 })
  getWordTimings(
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @Query('reciter') reciterSlug: string,
  ) {
    return this.audio.getWordTimingsForSurah(surahNumber, reciterSlug);
  }
}
