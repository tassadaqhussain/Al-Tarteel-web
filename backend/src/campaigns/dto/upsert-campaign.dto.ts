import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CAMPAIGN_CHANNELS, DESTINATION_KINDS } from '../campaigns.constants';

export class UpsertCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  headline!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(2000)
  body!: string;

  @ApiProperty({ example: 'Start reading' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  ctaLabel!: string;

  @ApiProperty({ example: '/tajweed' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  destination!: string;

  @ApiProperty({ example: 'tajweed' })
  @IsString()
  @IsIn([...DESTINATION_KINDS])
  destinationKind!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ type: [String], example: ['in_app_global', 'whatsapp', 'x'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn([...CAMPAIGN_CHANNELS], { each: true })
  channels!: string[];
}

export class PublishCampaignDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsIn([...CAMPAIGN_CHANNELS], { each: true })
  channels?: string[];
}
