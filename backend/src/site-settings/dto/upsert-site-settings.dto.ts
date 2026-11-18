import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const PROVIDERS = ['', 'ga4', 'plausible', 'umami'] as const;

export class UpsertSiteSettingsDto {
  @ApiPropertyOptional({ enum: PROVIDERS })
  @IsOptional()
  @IsString()
  @IsIn(PROVIDERS)
  analyticsProvider?: string;

  @ApiPropertyOptional({ example: 'G-XXXXXXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  gaMeasurementId?: string;

  @ApiPropertyOptional({ example: 'quranpilot.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  plausibleDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  plausibleScriptSrc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  umamiWebsiteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  umamiScriptSrc?: string;

  @ApiPropertyOptional({ description: 'Google Search Console HTML tag content value' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  googleSiteVerification?: string;

  @ApiPropertyOptional({ description: 'Bing Webmaster msvalidate.01 content value' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bingSiteVerification?: string;
}
