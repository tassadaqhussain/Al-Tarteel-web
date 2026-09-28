import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';

type AuthedRequest = { user?: { userId: number } };

class MarkReadDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  ids!: string[];
}

class EmailPreferenceDto {
  // Validate the raw value: implicit conversion would turn any string into `true`.
  @Transform(({ obj }) => obj.featureEmails)
  @IsBoolean()
  featureEmails!: boolean;
}

class UnsubscribeDto {
  @IsString()
  @MaxLength(200)
  token!: string;
}

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  private uid(req: AuthedRequest): number {
    const id = req.user?.userId;
    if (!id) throw new UnauthorizedException();
    return id;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "What's new: feature announcements with read state" })
  list(@Request() req: AuthedRequest) {
    return this.announcements.listForUser(this.uid(req));
  }

  @Post('read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark announcements as read' })
  markRead(@Request() req: AuthedRequest, @Body() dto: MarkReadDto) {
    return this.announcements.markRead(this.uid(req), dto.ids.slice(0, 50));
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark every published announcement as read' })
  markAllRead(@Request() req: AuthedRequest) {
    return this.announcements.markAllRead(this.uid(req));
  }

  @Get('email-preference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Whether the user receives new-feature emails' })
  getPreference(@Request() req: AuthedRequest) {
    return this.announcements.getEmailPreference(this.uid(req));
  }

  @Patch('email-preference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Turn new-feature emails on or off' })
  setPreference(@Request() req: AuthedRequest, @Body() dto: EmailPreferenceDto) {
    return this.announcements.setEmailPreference(this.uid(req), dto.featureEmails);
  }

  /** Signed link from the email footer; works without signing in. */
  @Post('unsubscribe')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Unsubscribe from new-feature emails via emailed token' })
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.announcements.unsubscribe(dto.token);
  }
}

