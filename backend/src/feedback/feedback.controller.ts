import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(ThrottlerGuard)
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit public site feedback' })
  create(
    @Body() dto: CreateFeedbackDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: Request & { user?: { userId?: number } },
  ) {
    return this.feedback.create(dto, {
      userAgent,
      userId: req?.user?.userId,
    });
  }
}
