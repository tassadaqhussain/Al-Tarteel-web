import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@ApiTags('AI')
@Controller('ai')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  private clientKey(req: Request) {
    const xf = req.headers['x-forwarded-for'];
    const forwarded = Array.isArray(xf) ? xf[0] : xf?.split(',')[0]?.trim();
    return forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
  }

  @Get('config')
  @ApiOperation({ summary: 'Public AI readiness (no secrets)' })
  getConfig(@Req() req: Request) {
    return this.ai.getPublicConfig(this.clientKey(req));
  }

  @Post('ask')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Ask QuranPilot AI (Gemini)' })
  @ApiOkResponse({ description: 'Assistant answer' })
  async ask(@Body() dto: AskAiDto, @Req() req: Request) {
    const key = this.clientKey(req);
    this.ai.assertWithinPromptLimit(key);
    const result = await this.ai.ask(dto);
    const usage = this.ai.recordPrompt(key);
    return { ...result, ...usage };
  }
}
