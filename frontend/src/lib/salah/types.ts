/**
 * Core type definitions for the Learn Salah guided lesson system.
 * Designed according to Hanafi Fiqh standards with gender-specific postures,
 * multi-language support (Urdu, English, Pashto), and rigorous scholarly review metadata.
 */

export type FiqhMethod = 'Hanafi';
export type LearnerGender = 'male' | 'female';
export type InstructionLanguage = 'ur' | 'en' | 'ps';
export type LessonMode = 'guided' | 'practice';
export type ReviewStatus = 'reviewed' | 'draft';

export type SalahLessonId =
  | 'two-rakah-fard'
  | 'three-rakah-fard'
  | 'four-rakah-fard'
  | 'hanafi-witr';

export type SalahPose =
  | 'prepare'
  | 'takbir'
  | 'recite'
  | 'ruku'
  | 'itidal'
  | 'sujood'
  | 'jalsa'
  | 'sujood-2'
  | 'stand'
  | 'tashahhud'
  | 'witr-qunoot-takbir'
  | 'witr-qunoot'
  | 'tasleem-right'
  | 'tasleem-left'
  | 'complete';

export interface StepRecitation {
  id: string;
  label: Record<InstructionLanguage, string>;
  arabicText: string;
  transliteration: string;
  translation: Record<InstructionLanguage, string>;
  repeatCount?: number;
  isOptional?: boolean;
  audioUrl?: string;
  audioAssetId: string;
}

export interface LessonStep {
  stepIndex: number;
  stepNumberLabel: string;
  title: Record<InstructionLanguage, string>;
  titleArabic: string;
  transliteration?: string;
  instruction: Record<InstructionLanguage, string>;
  spokenNarration: Record<InstructionLanguage, string>;
  malePose: SalahPose;
  femalePose: SalahPose;
  poseDescription: Record<LearnerGender, Record<InstructionLanguage, string>>;
  pngAssetId?: string;
  hasPngAsset: boolean;
  imageSrc?: string;
  recitations: StepRecitation[];
  isOptional?: boolean;
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  checkpoints?: string[];
  commonMistakes?: string[];
}

export interface LessonMetadata {
  id: SalahLessonId;
  title: Record<InstructionLanguage, string>;
  subtitle: Record<InstructionLanguage, string>;
  fiqhMethod: FiqhMethod;
  prayerType: 'Fard' | 'Wajib' | 'Sunnah';
  rakahs: number;
  description: Record<InstructionLanguage, string>;
  reviewStatus: ReviewStatus;
  reviewedBy: string;
  sourceReferences: string[];
  lastReviewedDate: string;
}

export interface SalahLesson {
  metadata: LessonMetadata;
  steps: LessonStep[];
}
