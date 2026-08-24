import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertMotivationDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(2000)
  message!: string;

  @ApiProperty({ example: 'READING' })
  @IsString()
  @MaxLength(40)
  category!: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ enum: ['draft', 'approved'] })
  @IsOptional()
  @IsIn(['draft', 'approved'])
  status?: 'draft' | 'approved';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
