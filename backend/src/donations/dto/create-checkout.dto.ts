import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const DONATION_CURRENCIES = ['usd', 'pkr', 'eur', 'gbp'] as const;
export const DONATION_INTERVALS = ['month', 'week', 'year'] as const;

export class CreateCheckoutDto {
  @ApiProperty({ example: 25, description: 'Major currency units (e.g. 25 = $25 or PKR 25)' })
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  amount!: number;

  @ApiProperty({ enum: DONATION_CURRENCIES, example: 'usd' })
  @IsString()
  @IsIn(DONATION_CURRENCIES)
  currency!: (typeof DONATION_CURRENCIES)[number];

  @ApiProperty({ enum: ['once', 'recurring'], example: 'once' })
  @IsString()
  @IsIn(['once', 'recurring'])
  mode!: 'once' | 'recurring';

  @ApiPropertyOptional({ enum: DONATION_INTERVALS, default: 'month' })
  @IsOptional()
  @IsString()
  @IsIn(DONATION_INTERVALS)
  interval?: (typeof DONATION_INTERVALS)[number];

  @ApiPropertyOptional({ description: 'Dedicate this donation' })
  @IsOptional()
  @IsBoolean()
  dedicate?: boolean;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  dedicationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hideName?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  asOrganization?: boolean;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  organizationName?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  zip?: string;
}
