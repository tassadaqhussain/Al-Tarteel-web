import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { OptionalJwtAuthGuard } from './guards/optional-jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('bookmarks')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookmarks (optional auth)' })
  getBookmarks(@Request() req: { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (!userId) return [];
    return this.users.getBookmarks(userId);
  }

  @Post('bookmarks')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add bookmark (optional auth)' })
  @ApiResponse({ status: 201 })
  addBookmark(
    @Request() req: { user?: { userId: number } },
    @Body() body: { ayahId: number; note?: string },
  ) {
    const userId = req.user?.userId;
    if (!userId) return { ok: false, message: 'Authentication required' };
    return this.users.addBookmark(userId, body.ayahId, body.note);
  }

  @Delete('bookmarks/:ayahId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove bookmark (optional auth)' })
  removeBookmark(
    @Request() req: { user?: { userId: number } },
    @Param('ayahId', ParseIntPipe) ayahId: number,
  ) {
    const userId = req.user?.userId;
    if (!userId) return { ok: false, message: 'Authentication required' };
    return this.users.removeBookmark(userId, ayahId);
  }

  @Get('reading-history')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reading history (optional auth)' })
  getReadingHistory(
    @Request() req: { user?: { userId: number } },
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) return [];
    return this.users.getReadingHistory(userId, limit ? parseInt(limit, 10) : undefined);
  }

  @Post('reading-history')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record reading position (optional auth)' })
  recordReading(
    @Request() req: { user?: { userId: number } },
    @Body() body: { ayahId: number; surahNumber?: number; ayahNumber?: number; page?: number },
  ) {
    const userId = req.user?.userId;
    if (!userId) return { ok: false, message: 'Authentication required' };
    return this.users.recordReading(userId, body);
  }

  @Get('last-read')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get last read position (optional auth)' })
  getLastRead(@Request() req: { user?: { userId: number } }) {
    const userId = req.user?.userId;
    if (!userId) return null;
    return this.users.getLastRead(userId);
  }
}
