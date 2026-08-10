/**
 * Executes a resolved VoiceIntent across QuranPilot navigation, player, settings, and bookmarks.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { getSurahHref, getSurahPath } from '@/lib/surah-meta';
import { VoiceIntent } from '@/lib/voice/parseVoiceIntent';

export interface ExecuteVoiceCommandOptions {
  intent: VoiceIntent;
  router: AppRouterInstance;
  onFeedback?: (message: string) => void;
}

export function executeVoiceCommand({
  intent,
  router,
  onFeedback,
}: ExecuteVoiceCommandOptions): boolean {
  switch (intent.type) {
    case 'OPEN_SURAH': {
      if (intent.surahNumber) {
        const path = getSurahPath(intent.surahNumber);
        onFeedback?.(`Opening ${intent.surahName || `Surah ${intent.surahNumber}`}`);
        router.push(path);
        return true;
      }
      break;
    }

    case 'OPEN_AYAH': {
      if (intent.surahNumber && intent.ayahNumber) {
        const href = getSurahHref(intent.surahNumber, { ayahNumber: intent.ayahNumber });
        onFeedback?.(`Opening ${intent.surahName || `Surah ${intent.surahNumber}`} Ayah ${intent.ayahNumber}`);
        router.push(href);
        return true;
      }
      break;
    }

    case 'NAVIGATION': {
      if (intent.destination === 'BACK') {
        onFeedback?.('Going back');
        router.back();
        return true;
      }
      if (intent.destination) {
        onFeedback?.(`Opening ${intent.destinationLabel || 'page'}`);
        router.push(intent.destination);
        return true;
      }
      break;
    }

    case 'PLAYER_COMMAND': {
      const audioStore = useAudioStore.getState();
      switch (intent.playerCommand) {
        case 'play': {
          audioStore.setPlaying(true);
          onFeedback?.('Playing audio');
          return true;
        }
        case 'pause': {
          audioStore.setPlaying(false);
          onFeedback?.('Paused audio');
          return true;
        }
        case 'continue': {
          audioStore.setPlaying(true);
          onFeedback?.('Resuming audio');
          return true;
        }
        case 'next': {
          audioStore.next();
          onFeedback?.('Next ayah');
          return true;
        }
        case 'prev': {
          audioStore.prev();
          onFeedback?.('Previous ayah');
          return true;
        }
        case 'repeat': {
          audioStore.setContinuous(true);
          audioStore.setPlaying(true);
          onFeedback?.('Repeating current ayah');
          return true;
        }
        case 'repeat_count': {
          audioStore.setContinuous(true);
          audioStore.setPlaying(true);
          onFeedback?.(`Repeating ayah ${intent.repeatCount || 3} times`);
          return true;
        }
      }
      break;
    }

    case 'TRANSLATION_COMMAND': {
      const settingsStore = useSettingsStore.getState();
      if (intent.translationAction === 'show') {
        settingsStore.setShowTranslation(true);
        onFeedback?.('Showing translation');
        return true;
      }
      if (intent.translationAction === 'hide') {
        settingsStore.setShowTranslation(false);
        onFeedback?.('Hiding translation');
        return true;
      }
      if (intent.translationAction === 'set_lang' && intent.language) {
        settingsStore.setShowTranslation(true);
        if (intent.language === 'ur') {
          settingsStore.setTranslationSlugs(['ur-maududi']);
          onFeedback?.('Activated Urdu translation');
        } else if (intent.language === 'en') {
          settingsStore.setTranslationSlugs(['en-sahih-international']);
          onFeedback?.('Activated English translation');
        }
        return true;
      }
      break;
    }

    case 'BOOKMARK_COMMAND': {
      const audioStore = useAudioStore.getState();
      const currentAyah = audioStore.getCurrentAyah();
      if (currentAyah) {
        const bookmarksStore = useBookmarksStore.getState();
        bookmarksStore.add({
          ayahId: currentAyah.ayahId,
          surahNumber: currentAyah.surahNumber,
          surahName: `Surah ${currentAyah.surahNumber}`,
          ayahNumber: currentAyah.ayahNumber,
          textUthmani: '',
          note: 'Saved via Voice Command',
          color: 'gold',
        });
        onFeedback?.(`Bookmarked Ayah ${currentAyah.surahNumber}:${currentAyah.ayahNumber}`);
        return true;
      } else {
        onFeedback?.('Open a Surah or play audio to bookmark');
        return true;
      }
    }

    case 'QURAN_SEARCH': {
      const q = intent.searchQuery || intent.query;
      if (q) {
        onFeedback?.(`Searching Quran for “${q}”`);
        router.push(`/search?q=${encodeURIComponent(q)}`);
        return true;
      }
      break;
    }
  }

  return false;
}
