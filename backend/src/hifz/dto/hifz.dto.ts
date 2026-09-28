import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';

export class CheckHifzDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  ayahNumber!: number;

  @ApiProperty({ description: 'Spoken or typed attempt' })
  @IsString()
  @MaxLength(5000)
  transcript!: string;

  @ApiPropertyOptional({ enum: ['speech', 'type'] })
  @IsOptional()
  @IsIn(['speech', 'type'])
  mode?: 'speech' | 'type';
}

export class RecordHifzAttemptDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  ayahNumber!: number;

  @ApiProperty({ enum: ['speech', 'type'] })
  @IsIn(['speech', 'type'])
  mode!: 'speech' | 'type';

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  transcript!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({ example: '2026-08-08', description: 'YYYY-MM-DD in user timezone' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  practiceDate!: string;
}


export const HIFZ_STATUSES = ['learning', 'practicing', 'reviewed'] as const;
export type HifzStatus = (typeof HIFZ_STATUSES)[number];

export class SetHifzStatusDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber!: number;

  @ApiProperty({ description: 'First ayah to mark' })
  @IsInt()
  @Min(1)
  fromAyah!: number;

  @ApiPropertyOptional({ description: 'Last ayah to mark; defaults to fromAyah' })
  @IsOptional()
  @IsInt()
  @Min(1)
  toAyah?: number;

  @ApiProperty({ enum: HIFZ_STATUSES })
  @IsIn(HIFZ_STATUSES as unknown as string[])
  status!: HifzStatus;
}
