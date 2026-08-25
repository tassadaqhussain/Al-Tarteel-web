import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EMAIL_LAYOUTS } from '../../mail/user-email.template';

export class SendUserEmailDto {
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

  @ApiPropertyOptional({ type: [Number], description: 'User ids to email. Empty = all registered users.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsInt({ each: true })
  userIds?: number[];

  @ApiPropertyOptional({ description: 'Send only to the signed-in admin address' })
  @IsOptional()
  @IsBoolean()
  preview?: boolean;

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

  @ApiPropertyOptional({ enum: EMAIL_LAYOUTS })
  @IsOptional()
  @IsIn([...EMAIL_LAYOUTS])
  layout?: (typeof EMAIL_LAYOUTS)[number];
}
