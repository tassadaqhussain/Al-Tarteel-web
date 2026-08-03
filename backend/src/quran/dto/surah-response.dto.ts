import { ApiProperty } from '@nestjs/swagger';

export class SurahResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() number: number;
  @ApiProperty() nameArabic: string;
  @ApiProperty() nameSimple: string;
  @ApiProperty({ nullable: true }) nameComplex: string | null;
  @ApiProperty() revelationPlace: string;
  @ApiProperty({ nullable: true }) revelationOrder: number | null;
  @ApiProperty() numberOfAyahs: number;
}

export class AyahResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() surahId: number;
  @ApiProperty() number: number;
  @ApiProperty({ nullable: true }) numberInQuran: number | null;
  @ApiProperty({ nullable: true }) juz: number | null;
  @ApiProperty({ nullable: true }) hizb: number | null;
  @ApiProperty({ nullable: true }) ruku: number | null;
  @ApiProperty({ nullable: true }) page: number | null;
  @ApiProperty() textUthmani: string;
}

export class WordResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() ayahId: number;
  @ApiProperty() position: number;
  @ApiProperty() textArabic: string;
  @ApiProperty() textUthmani: string;
  @ApiProperty({ nullable: true }) rootArabic: string | null;
}

export class WordWithTranslationDto extends WordResponseDto {
  @ApiProperty({ required: false }) translation?: string;
}

export class AyahWithWordsDto extends AyahResponseDto {
  @ApiProperty({ type: [WordResponseDto], required: false }) words?: WordResponseDto[];
}

export class AyahWithTranslationsDto extends AyahResponseDto {
  @ApiProperty({ required: false }) translations?: { translatorId: number; translatorSlug: string; text: string }[];
}

export class AyahFullDto extends AyahResponseDto {
  @ApiProperty({ type: [WordWithTranslationDto], required: false }) words?: WordWithTranslationDto[];
  @ApiProperty({ required: false }) translations?: { translatorId: number; translatorSlug: string; text: string }[];
}
