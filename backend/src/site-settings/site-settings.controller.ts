import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';

@ApiTags('Site')
@Controller('site')
export class SiteSettingsController {
  constructor(private readonly siteSettings: SiteSettingsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Public SEO / analytics site config (no secrets)' })
  getConfig() {
    return this.siteSettings.getPublicSettings();
  }
}
