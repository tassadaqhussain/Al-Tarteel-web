import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type AuthedRequest = { user: { userId: number } };

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  private uid(req: AuthedRequest): number {
    const id = req.user?.userId;
    if (!id) throw new UnauthorizedException();
    return id;
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get authenticated user bookmarks' })
  getBookmarks(@Request() req: AuthedRequest) {
    return this.users.getBookmarks(this.uid(req));
  }

  @Post('bookmarks')
  @ApiOperation({ summary: 'Add bookmark for authenticated user' })
  @ApiResponse({ status: 201 })
  addBookmark(
    @Request() req: AuthedRequest,
    @Body() body: { ayahId: number; note?: string },
  ) {
    return this.users.addBookmark(this.uid(req), body.ayahId, body.note);
  }

  @Delete('bookmarks/:ayahId')
  @ApiOperation({ summary: 'Remove bookmark for authenticated user' })
  removeBookmark(
    @Request() req: AuthedRequest,
    @Param('ayahId', ParseIntPipe) ayahId: number,
  ) {
    return this.users.removeBookmark(this.uid(req), ayahId);
  }

  @Get('reading-history')
  @ApiOperation({ summary: 'Get reading history for authenticated user' })
  getReadingHistory(
    @Request() req: AuthedRequest,
    @Query('limit') limit?: string,
  ) {
    return this.users.getReadingHistory(
      this.uid(req),
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('reading-history')
  @ApiOperation({ summary: 'Record reading position for authenticated user' })
  recordReading(
    @Request() req: AuthedRequest,
    @Body() body: { ayahId: number; surahNumber?: number; ayahNumber?: number; page?: number },
  ) {
    return this.users.recordReading(this.uid(req), body);
  }

  @Get('last-read')
  @ApiOperation({ summary: 'Get last read position for authenticated user' })
  getLastRead(@Request() req: AuthedRequest) {
    return this.users.getLastRead(this.uid(req));
  }

  @Get('daily-goal')
  @ApiOperation({ summary: 'Get active daily goal' })
  getDailyGoal(@Request() req: AuthedRequest) {
    return this.users.getActiveDailyGoal(this.uid(req));
  }

  @Post('daily-goal')
  @ApiOperation({ summary: 'Set active daily goal (disables previous)' })
  setDailyGoal(
    @Request() req: AuthedRequest,
    @Body() body: { goalType: string; goalValue: number },
  ) {
    return this.users.setDailyGoal(this.uid(req), body);
  }

  @Delete('daily-goal')
  @ApiOperation({ summary: 'Clear active daily goal' })
  clearDailyGoal(@Request() req: AuthedRequest) {
    return this.users.clearDailyGoal(this.uid(req));
  }

  @Get('daily-progress')
  @ApiOperation({ summary: 'Get progress for a calendar day (YYYY-MM-DD)' })
  getDailyProgress(@Request() req: AuthedRequest, @Query('date') date: string) {
    const d = date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date().toISOString().slice(0, 10);
    return this.users.getDailyProgress(this.uid(req), d);
  }

  @Post('daily-progress')
  @ApiOperation({ summary: 'Upsert / increment daily progress' })
  upsertDailyProgress(
    @Request() req: AuthedRequest,
    @Body()
    body: {
      date: string;
      ayahsRead?: number;
      minutesRead?: number;
      tajweedPracticed?: boolean;
      incrementAyahs?: number;
      incrementMinutes?: number;
    },
  ) {
    const d = body.date?.match(/^\d{4}-\d{2}-\d{2}$/)
      ? body.date
      : new Date().toISOString().slice(0, 10);
    return this.users.upsertDailyProgress(this.uid(req), { ...body, date: d });
  }

  @Get('motivation-preferences')
  @ApiOperation({ summary: 'Get opt-in motivation/reminder preferences' })
  getMotivationPreferences(@Request() req: AuthedRequest) {
    return this.users.getMotivationPreferences(this.uid(req));
  }

  @Post('motivation-preferences')
  @ApiOperation({ summary: 'Update opt-in reminder preferences (never auto-enabled)' })
  setMotivationPreferences(
    @Request() req: AuthedRequest,
    @Body()
    body: {
      reminderEnabled?: boolean;
      reminderSlot?: string | null;
      reminderTime?: string | null;
      timezone?: string;
    },
  ) {
    return this.users.setMotivationPreferences(this.uid(req), body);
  }

  @Get('motivational-messages')
  @ApiOperation({ summary: 'List approved motivational messages for a language' })
  listMotivationalMessages(@Query('language') language?: string) {
    return this.users.listApprovedMotivationalMessages(language || 'en');
  }
}
