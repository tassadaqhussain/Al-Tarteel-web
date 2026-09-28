/**
 * Content schema for the Learn Namaz module.
 *
 * Everything the learner sees (instructions, Arabic, transliteration,
 * translations, audio, school-specific notes and sources) lives in data that
 * follows these types, so reviewed content can be updated without touching
 * the interface. Keep this file free of runtime imports so the content and
 * lesson builder can be tested with plain Node.
 */
import type { UiLocale } from '@/stores/settingsStore';

/** English is required; other locales are added only once reviewed. */
export type LocalizedText = { en: string } & Partial<Record<UiLocale, string>>;

/**
 * `needs-review`: sourced, but not yet signed off by a qualified reviewer.
 * The UI shows a visible notice for anything not `reviewed`.
 */
export type ReviewStatus = 'reviewed' | 'needs-review';

export type SchoolId = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
/** `general` shows the shared baseline plus every reviewed variation note. */
export type SchoolPreference = SchoolId | 'general';

export type PositionId =
  | 'standing'
  | 'takbir'
  | 'folded'
  | 'bowing'
  | 'rising'
  | 'prostrating'
  | 'sitting'
  | 'salamRight'
  | 'salamLeft';

export type NamazSource = {
  id: string;
  title: string;
  kind: 'quran' | 'hadith' | 'reference';
  /** Base URL; a `{ref}` placeholder is replaced with the locator. */
  url?: string;
};

export type SourceRef = {
  sourceId: string;
  /** Hadith number, ayah key, or section — shown next to the source title. */
  locator: string;
};

export type RecordedAudio = {
  url: string;
  credit: string;
  review: ReviewStatus;
};

/** A supplication or formula recited in salah (not Quran text). */
export type Dhikr = {
  id: string;
  label: LocalizedText;
  arabic: string;
  transliteration: string;
  translation: LocalizedText;
  sources: SourceRef[];
  /** How many times it is commonly said, when relevant. */
  repeat?: { count: number; note: LocalizedText };
  /** Only set once a recording has been reviewed; never synthesised. */
  audio?: RecordedAudio;
  review: ReviewStatus;
};

/**
 * Quran passages are never stored here: Arabic, word transliteration,
 * translation and recitation audio load from QuranPilot's verified Quran API.
 */
export type QuranPassage = {
  id: string;
  label: LocalizedText;
  surah: number;
  fromAyah: number;
  toAyah: number;
};

/** `quran:short-surah` resolves to the learner's chosen short surah at runtime. */
export type RecitationRef =
  | { kind: 'dhikr'; id: string; optional?: boolean }
  | { kind: 'quran'; id: string; optional?: boolean }
  | { kind: 'short-surah'; optional?: boolean };

export type Variation = {
  /** Schools this note describes. Empty = a general note that practice varies. */
  schools: SchoolId[];
  text: LocalizedText;
  review: ReviewStatus;
};

export type StepTemplate = {
  id: string;
  position: PositionId;
  title: LocalizedText;
  /** What to do, in plain language. */
  action: LocalizedText;
  /** Spoken guidance (read aloud). Avoid the words "pause" and "stop". */
  guidance: LocalizedText;
  recitations: RecitationRef[];
  variations: Variation[];
  sources: SourceRef[];
  review: ReviewStatus;
};

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type Prayer = {
  id: PrayerId;
  name: LocalizedText;
  arabicName: string;
  /** Obligatory (fard) rak'ahs. */
  rakahs: number;
  /** Rak'ahs where the recitation is audible when leading or (per school) alone. */
  audibleRakahs: number[];
  note: LocalizedText;
};

export type Prerequisite = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  sources: SourceRef[];
  /** Internal QuranPilot link (e.g. an ayah page) for further reading. */
  learnMore?: { href: string; label: LocalizedText };
  review: ReviewStatus;
};

export type NamazContent = {
  version: string;
  sources: NamazSource[];
  dhikr: Dhikr[];
  quran: QuranPassage[];
  shortSurahOptions: { surah: number; ayahCount: number; name: LocalizedText }[];
  steps: StepTemplate[];
  prayers: Prayer[];
  prerequisites: Prerequisite[];
  schools: { id: SchoolId; name: LocalizedText }[];
};

export type LessonPhase = 'prepare' | 'rakah' | 'final';

/** One concrete step in a built lesson for a specific prayer. */
export type LessonStep = {
  key: string;
  templateId: string;
  phase: LessonPhase;
  /** 1-based rak'ah this step belongs to; null for preparation. */
  rakah: number | null;
  /** Context-specific note, e.g. "3rd rak'ah: Al-Fatihah only". */
  contextNote?: LocalizedText;
};
