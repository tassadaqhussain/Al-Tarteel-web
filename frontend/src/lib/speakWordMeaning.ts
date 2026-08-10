/** Map WBW language codes to BCP-47 tags for SpeechSynthesis. */
const LOCALE_SPEECH_TAGS: Record<string, string[]> = {
  en: ['en-US', 'en-GB', 'en'],
  ur: ['ur-PK', 'ur'],
  bn: ['bn-BD', 'bn-IN', 'bn'],
  id: ['id-ID', 'id'],
  tr: ['tr-TR', 'tr'],
  fa: ['fa-IR', 'fa'],
  hi: ['hi-IN', 'hi'],
};

function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = LOCALE_SPEECH_TAGS[langCode] ?? [langCode];
  for (const tag of preferred) {
    const exact = voices.find((v) => v.lang.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
  }
  for (const tag of preferred) {
    const prefix = tag.split('-')[0].toLowerCase();
    const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (partial) return partial;
  }
  return null;
}

/** Ensure voices are loaded (Chrome loads them asynchronously). */
export function warmSpeechVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  void window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    void window.speechSynthesis.getVoices();
  };
}

export function cancelWordMeaningSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * Speak a word-by-word meaning in the chosen language using the browser TTS engine.
 * Quality depends on OS-installed voices (EN is usually strong; UR/FA/BN/etc. vary by device).
 */
export function speakWordMeaning(text: string, langCode: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const cleaned = text?.trim();
  if (!cleaned) return false;

  cancelWordMeaningSpeech();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const tags = LOCALE_SPEECH_TAGS[langCode] ?? [langCode];
  utterance.lang = tags[0];
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voice = pickVoice(langCode);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function canSpeakWordMeanings(): boolean {
  return typeof window !== 'undefined' && Boolean(window.speechSynthesis);
}
