import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsString()
  role!: 'user' | 'assistant';

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  content!: string;
}

export class AskAiDto {
  @ApiProperty({ description: 'User question about Quran / Islam', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  question!: string;

  @ApiPropertyOptional({ type: [ChatMessageDto], description: 'Prior turns for context' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @ApiPropertyOptional({ description: 'UI locale hint, e.g. en, ar, ur', maxLength: 12 })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  locale?: string;

  @ApiPropertyOptional({ description: 'Optional verse context, e.g. 2:255', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  verseKey?: string;
}
