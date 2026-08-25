import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EMAIL_LAYOUTS } from '../user-email.template';

export class UpsertMailTemplateDto {
  @ApiProperty({ example: 'Welcome' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ enum: EMAIL_LAYOUTS })
  @IsIn([...EMAIL_LAYOUTS])
  layout!: (typeof EMAIL_LAYOUTS)[number];

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(8000)
  body!: string;

  @ApiPropertyOptional({ example: 'Open QuranPilot' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ctaLabel?: string;

  @ApiPropertyOptional({ example: 'https://quranpilot.com' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaUrl?: string;
}
