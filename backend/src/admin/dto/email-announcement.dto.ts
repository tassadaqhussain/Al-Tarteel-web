import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class EmailAnnouncementDto {
  /** Defaults to a preview, so a real broadcast is always an explicit choice. */
  @ApiPropertyOptional({ default: true })
  @Transform(({ obj }) => obj.preview)
  @IsOptional()
  @IsBoolean()
  preview?: boolean;
}
