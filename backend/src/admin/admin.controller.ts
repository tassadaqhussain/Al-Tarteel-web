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
import { CampaignsService } from '../campaigns/campaigns.service';
import { UpsertMotivationDto } from './dto/upsert-motivation.dto';
import { PublishCampaignDto, UpsertCampaignDto } from '../campaigns/dto/upsert-campaign.dto';
import { SendUserEmailDto } from './dto/send-user-email.dto';
import { UpsertMailSettingsDto } from '../mail/dto/upsert-mail-settings.dto';
import { UpsertMailTemplateDto } from '../mail/dto/upsert-mail-template.dto';
import { isAdminEmail } from './admin.util';

type AuthedRequest = { user?: { userId: number; email?: string | null; name?: string | null } };

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly campaigns: CampaignsService,
  ) {}

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

  @Get('campaigns')
  @ApiOperation({ summary: 'List ad campaigns' })
  listCampaigns() {
    return this.campaigns.list();
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a campaign with channel copy' })
  getCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaigns.get(id);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create an ad campaign' })
  createCampaign(@Body() dto: UpsertCampaignDto) {
    return this.campaigns.create(dto);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update an ad campaign' })
  updateCampaign(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertCampaignDto) {
    return this.campaigns.update(id, dto);
  }

  @Post('campaigns/:id/publish')
  @ApiOperation({ summary: 'Publish one ad to selected channels' })
  publishCampaign(@Param('id', ParseIntPipe) id: number, @Body() dto: PublishCampaignDto) {
    return this.campaigns.publish(id, dto.channels);
  }

  @Post('campaigns/:id/pause')
  @ApiOperation({ summary: 'Pause a live campaign' })
  pauseCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaigns.pause(id);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete a campaign' })
  deleteCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.campaigns.remove(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List registered users' })
  listUsers() {
    return this.admin.listRegisteredUsers();
  }

  @Get('mail/status')
  @ApiOperation({ summary: 'Whether SMTP is configured' })
  mailStatus() {
    return this.admin.mailStatus();
  }

  @Get('mail/settings')
  @ApiOperation({ summary: 'Get SMTP settings (password never returned)' })
  getMailSettings() {
    return this.admin.getMailSettings();
  }

  @Patch('mail/settings')
  @ApiOperation({ summary: 'Save SMTP settings to the database' })
  saveMailSettings(@Body() dto: UpsertMailSettingsDto) {
    return this.admin.saveMailSettings(dto);
  }

  @Get('mail/templates')
  @ApiOperation({ summary: 'List saved email templates' })
  listMailTemplates() {
    return this.admin.listMailTemplates();
  }

  @Post('mail/templates')
  @ApiOperation({ summary: 'Create an email template' })
  createMailTemplate(@Body() dto: UpsertMailTemplateDto) {
    return this.admin.createMailTemplate(dto);
  }

  @Patch('mail/templates/:id')
  @ApiOperation({ summary: 'Update an email template' })
  updateMailTemplate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertMailTemplateDto) {
    return this.admin.updateMailTemplate(id, dto);
  }

  @Delete('mail/templates/:id')
  @ApiOperation({ summary: 'Delete an email template' })
  deleteMailTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteMailTemplate(id);
  }

  @Post('mail/send')
  @ApiOperation({ summary: 'Email registered users' })
  sendUserEmail(@Req() req: AuthedRequest, @Body() dto: SendUserEmailDto) {
    return this.admin.sendUserEmail(dto, req.user?.email);
  }
}
