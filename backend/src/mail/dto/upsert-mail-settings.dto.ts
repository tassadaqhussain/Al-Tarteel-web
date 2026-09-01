import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpsertMailSettingsDto {
  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  host!: string;

  @ApiPropertyOptional({ example: 587 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiProperty({ example: 'you@gmail.com' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  username!: string;

  @ApiPropertyOptional({ description: 'Leave blank to keep the current password' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  password?: string;

  @ApiPropertyOptional({ example: 'QuranPilot <you@gmail.com>' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notifyEmail?: string;
}
