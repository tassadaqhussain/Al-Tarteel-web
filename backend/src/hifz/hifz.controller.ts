import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { HifzService } from './hifz.service';
import { CheckHifzDto, RecordHifzAttemptDto, SetHifzStatusDto } from './dto/hifz.dto';

type AuthedRequest = { user: { userId: number } };

@ApiTags('Hifz')
@Controller('hifz')
export class HifzController {
  constructor(private readonly hifz: HifzService) {}

  private uid(req: AuthedRequest): number {
    const id = req.user?.userId;
    if (!id) throw new UnauthorizedException();
    return id;
  }

  @Post('check')
  @ApiOperation({ summary: 'Compare a recite attempt against the ayah text (public)' })
  check(@Body() body: CheckHifzDto) {
    return this.hifz.check(body);
  }

  @Post('attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a hifz attempt and update daily accuracy' })
  record(@Request() req: AuthedRequest, @Body() body: RecordHifzAttemptDto) {
    return this.hifz.recordAttempt(this.uid(req), body);
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Day-by-day hifz accuracy' })
  daily(@Request() req: AuthedRequest, @Query('days') days?: string) {
    return this.hifz.dailyStats(this.uid(req), days ? parseInt(days, 10) : 14);
  }

  @Get('progress/:surahNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Per-ayah mastery for a surah' })
  progress(
    @Request() req: AuthedRequest,
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
  ) {
    return this.hifz.surahProgress(this.uid(req), surahNumber);
  }

  @Post('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark an ayah or inclusive range as learning/practicing/reviewed' })
  setStatus(@Request() req: AuthedRequest, @Body() body: SetHifzStatusDto) {
    return this.hifz.setStatus(this.uid(req), body);
  }

  @Get('status/:surahNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Memorisation status of the signed-in user's marked ayahs in a surah" })
  getStatuses(
    @Request() req: AuthedRequest,
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
  ) {
    return this.hifz.getStatuses(this.uid(req), surahNumber);
  }

}
