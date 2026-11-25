import type { ContentLocale } from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';

/**
 * Short, descriptive intros for featured ayah pages (Ayatul Kursi, 2:285–286, …).
 *
 * Deliberately neutral: they say where the verse sits and what the page offers. They make no
 * rulings, virtue claims or hadith attributions, and never touch the Quranic text itself.
 * Needs a native-speaker pass before treating wording as final.
 */
export function ayahIntro(
  locale: ContentLocale,
  surah: number,
  ayah: number,
  name: string,
): { heading: string; body: string } {
  const ref = `${surah}:${ayah}`;
  if (locale === 'ur') {
    const s = getSurahLocalizedName(surah, 'ur');
    return {
      heading: `${name} — تعارف`,
      body: `${name}: یہ سورہ ${s} کی آیت ${ayah} (${ref}) ہے۔ اس صفحے پر عربی عثمانی متن، اردو ترجمہ اور آیت کی تلاوت کے ساتھ اسے پڑھیں اور سنیں؛ پچھلی اور اگلی آیات اور پوری سورت کے لنک بھی نیچے دیے گئے ہیں۔`,
    };
  }
  if (locale === 'ps') {
    const s = getSurahLocalizedName(surah, 'ps');
    return {
      heading: `${name} — پېژندنه`,
      body: `${name}: دا د سورت ${s} آیت ${ayah} (${ref}) دی. په دې پاڼه کې دا آیت له عربي عثماني متن، پښتو ژباړې او تلاوت سره ولولئ او واورئ؛ مخکینی او راتلونکي آیتونه او بشپړ سورت ته لینکونه هم لاندې ورکړل شوي دي.`,
    };
  }
  if (locale === 'fa') {
    const s = getSurahLocalizedName(surah, 'fa');
    return {
      heading: `${name} — معرفی`,
      body: `${name}: این آیه ${ayah} سوره ${s} (${ref}) است. در این صفحه آن را با متن عربی عثمانی، ترجمه فارسی و تلاوت بخوانید و بشنوید؛ پیوند آیه‌های قبل و بعد و کل سوره نیز در ادامه آمده است.`,
    };
  }
  const s = SURAH_SIMPLE_NAMES[surah] || `Surah ${surah}`;
  return {
    heading: `About ${name}`,
    body: `${name} is verse ${ayah} of Surah ${s} (${ref}). Read it here with the Arabic Uthmani text, English translation and verse audio; links to the previous and next verses and the full surah are below.`,
  };
}

/** Localized "Ayah" word for breadcrumbs. */
export function ayahWord(locale: ContentLocale): string {
  if (locale === 'ur' || locale === 'ps') return 'آیت';
  if (locale === 'fa') return 'آیه';
  return 'Ayah';
}
