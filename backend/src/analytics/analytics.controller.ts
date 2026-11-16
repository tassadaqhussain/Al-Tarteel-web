import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';

class VisitDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  referrer?: string;
}

class SearchLogDto {
  @IsString()
  @MaxLength(120)
  query!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  resultsCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  source?: string;
}

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('visit')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record a page view (hashed visitor, no raw IP stored)' })
  visit(@Body() body: VisitDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ||
      req.ip;
    return this.analytics.recordVisit({
      ip,
      userAgent: req.headers['user-agent'],
      path: body.path,
      source: body.source,
      referrer: body.referrer,
    });
  }

  @Post('search')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record a site search query for top-searches analytics' })
  search(@Body() body: SearchLogDto, @Req() req: Request) {
    return this.analytics.recordSearch({
      userAgent: req.headers['user-agent'],
      query: body.query,
      resultsCount: body.resultsCount,
      source: body.source,
    });
  }
}
