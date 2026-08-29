import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';

class VisitDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;
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
    });
  }
}
