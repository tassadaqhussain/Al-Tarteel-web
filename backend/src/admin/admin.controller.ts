import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { UpsertMotivationDto } from './dto/upsert-motivation.dto';
import { isAdminEmail } from './admin.util';

type AuthedRequest = { user?: { userId: number; email?: string | null; name?: string | null } };

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('me')
  @ApiOperation({ summary: 'Verify admin session' })
  me(@Req() req: AuthedRequest) {
    const email = req.user?.email ?? null;
    return {
      isAdmin: isAdminEmail(email),
      email,
      name: req.user?.name ?? null,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Registration and engagement summary' })
  stats() {
    return this.admin.getStats();
  }

  @Get('feedback')
  @ApiOperation({ summary: 'List site feedback submissions' })
  listFeedback(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.admin.listFeedback({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category: category || undefined,
    });
  }

  @Delete('feedback/:id')
  @ApiOperation({ summary: 'Delete a feedback submission' })
  deleteFeedback(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteFeedback(id);
  }

  @Get('motivational-messages')
  @ApiOperation({ summary: 'List motivational messages (all statuses)' })
  listMotivationalMessages(@Query('language') language?: string) {
    return this.admin.listMotivationalMessages(language || undefined);
  }

  @Post('motivational-messages')
  @ApiOperation({ summary: 'Create a motivational message' })
  createMotivationalMessage(@Body() dto: UpsertMotivationDto) {
    return this.admin.createMotivationalMessage(dto);
  }

  @Patch('motivational-messages/:id')
  @ApiOperation({ summary: 'Update a motivational message' })
  updateMotivationalMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertMotivationDto,
  ) {
    return this.admin.updateMotivationalMessage(id, dto);
  }

  @Delete('motivational-messages/:id')
  @ApiOperation({ summary: 'Delete a motivational message' })
  deleteMotivationalMessage(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteMotivationalMessage(id);
  }
}
