import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 286 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(286)
  limit?: number = 20;
}

export class AyahsBySurahQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Translation language slug(s), comma-separated' })
  @IsOptional()
  translations?: string;

  @ApiPropertyOptional({ description: 'Include word-by-word data' })
  @IsOptional()
  words?: boolean;
}

export class AyahsByPageQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  translations?: string;
  @IsOptional()
  words?: boolean;
}
