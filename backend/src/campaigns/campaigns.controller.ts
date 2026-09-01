import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CampaignsService } from './campaigns.service';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(ThrottlerGuard)
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get('active')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Active in-app campaign for a surface' })
  active(@Query('surface') surface?: string) {
    return this.campaigns.getActive(surface);
  }
}
