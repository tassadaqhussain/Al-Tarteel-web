/**
 * Optional practice-mode voice commands. Recognition only listens for a small
 * set of navigation words; nothing is recorded or stored by QuranPilot.
 */
import type { UiLocale } from '@/stores/settingsStore';

export type NamazVoiceCommand = 'next' | 'back' | 'repeat' | 'pause' | 'play';

/** English always works; the learner's language is added on top. */
const WORDS: Partial<Record<UiLocale, Record<NamazVoiceCommand, string[]>>> = {
  en: {
    next: ['next', 'continue', 'forward'],
    back: ['back', 'previous', 'go back'],
    repeat: ['repeat', 'again', 'replay'],
    pause: ['pause', 'stop', 'wait'],
    play: ['play', 'resume', 'start'],
  },
  ar: {
    next: ['التالي', 'التالية', 'استمر'],
    back: ['السابق', 'رجوع', 'ارجع'],
    repeat: ['كرر', 'أعد', 'اعد', 'مرة أخرى'],
    pause: ['توقف', 'قف', 'انتظر'],
    play: ['تشغيل', 'شغل', 'ابدأ'],
  },
  ur: {
    next: ['اگلا', 'آگے', 'اگلی'],
    back: ['پیچھے', 'پچھلا', 'واپس'],
    repeat: ['دوبارہ', 'پھر سے', 'دہرائیں'],
    pause: ['رکیں', 'روکیں', 'رکو'],
    play: ['چلائیں', 'شروع', 'چلاؤ'],
  },
  fr: {
    next: ['suivant', 'continuer'],
    back: ['retour', 'précédent', 'precedent'],
    repeat: ['répéter', 'repeter', 'encore'],
    pause: ['pause', 'arrête', 'arrete'],
    play: ['lecture', 'reprendre', 'jouer'],
  },
  es: {
    next: ['siguiente', 'continuar'],
    back: ['atrás', 'atras', 'anterior'],
    repeat: ['repetir', 'otra vez'],
    pause: ['pausa', 'para', 'detener'],
    play: ['reproducir', 'continúa', 'seguir'],
  },
  id: {
    next: ['selanjutnya', 'lanjut', 'berikutnya'],
    back: ['kembali', 'sebelumnya'],
    repeat: ['ulangi', 'lagi'],
    pause: ['jeda', 'berhenti'],
    play: ['putar', 'mulai'],
  },
  ms: {
    next: ['seterusnya', 'teruskan'],
    back: ['kembali', 'sebelum'],
    repeat: ['ulang', 'lagi'],
    pause: ['jeda', 'berhenti'],
    play: ['main', 'mula'],
  },
  tr: {
    next: ['sonraki', 'ileri', 'devam'],
    back: ['geri', 'önceki', 'onceki'],
    repeat: ['tekrar', 'yinele'],
    pause: ['duraklat', 'dur', 'bekle'],
    play: ['oynat', 'başlat', 'baslat'],
  },
};

/** BCP-47 tag for speech recognition in the learner's language. */
export const RECOGNITION_LANG: Record<UiLocale, string> = {
  en: 'en-US', ar: 'ar-SA', bn: 'bn-BD', fa: 'fa-IR', fr: 'fr-FR', hi: 'hi-IN', id: 'id-ID',
  it: 'it-IT', nl: 'nl-NL', ps: 'ps-AF', pt: 'pt-BR', ru: 'ru-RU', sq: 'sq-AL', th: 'th-TH',
  tr: 'tr-TR', ur: 'ur-PK', zh: 'zh-CN', ms: 'ms-MY', es: 'es-ES', sw: 'sw-KE', vi: 'vi-VN',
};

/** Only offer recognition in a language we have command words for. */
export function voiceCommandLocale(locale: UiLocale): UiLocale {
  return WORDS[locale] ? locale : 'en';
}

export function voiceCommandWords(locale: UiLocale): Record<NamazVoiceCommand, string[]> {
  return WORDS[voiceCommandLocale(locale)] ?? WORDS.en!;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, '') // Arabic diacritics
    .replace(/[.,!?؟،]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match a recognised phrase to a command. Uses the last matching word so
 * "no, go back" resolves to `back`. Returns null for anything else.
 */
export function parseNamazVoiceCommand(transcript: string, locale: UiLocale): NamazVoiceCommand | null {
  const text = normalize(transcript);
  if (!text) return null;
  const tables = [WORDS.en!, ...(locale !== 'en' && WORDS[locale] ? [WORDS[locale]!] : [])];
  let best: { command: NamazVoiceCommand; index: number } | null = null;
  for (const table of tables) {
    for (const command of Object.keys(table) as NamazVoiceCommand[]) {
      for (const word of table[command]) {
        const needle = normalize(word);
        const pattern = new RegExp(`(^|\\s)${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'g');
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text))) {
          const index = match.index + match[1].length;
          if (!best || index > best.index) best = { command, index };
        }
      }
    }
  }
  return best?.command ?? null;
}
