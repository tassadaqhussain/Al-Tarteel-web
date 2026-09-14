import Link from 'next/link';
import type { Surah } from '@/lib/api';
import {
  getSurahArabicName,
  getSurahMeaning,
  getSurahPath,
  getAyahPath,
  SURAH_SIMPLE_NAMES,
} from '@/lib/surah-meta';
import { ayahSeo } from '@/lib/seo';
import { SURAH_COLLECTIONS } from '@/lib/seo/surah-collections';

const JUZ_START_SURAHS = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

function surahMeta(number: number, surahs: Surah[]) {
  const row = surahs.find((s) => s.number === number);
  const name = row?.nameSimple || SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
  const ayahs = row?.numberOfAyahs;
  const meaning = getSurahMeaning(number);
  return { name, ayahs, meaning, arabic: getSurahArabicName(number) };
}

function SurahLinkList({
  numbers,
  surahs,
}: {
  numbers: number[];
  surahs: Surah[];
}) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {numbers.map((number) => {
        const meta = surahMeta(number, surahs);
        return (
          <li key={number}>
            <Link
              href={getSurahPath(number)}
              className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm hover:border-brand/30 hover:bg-surface-2"
            >
              <span className="min-w-0">
                <span className="font-semibold text-ink">
                  {number}. {meta.name}
                </span>
                {meta.meaning ? (
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">{meta.meaning}</span>
                ) : null}
                {meta.ayahs ? (
                  <span className="mt-0.5 block text-xs text-ink-faint">{meta.ayahs} verses</span>
                ) : null}
              </span>
              <span className="shrink-0 text-base text-ink-3">{meta.arabic}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SurahDirectorySections({ surahs }: { surahs: Surah[] }) {
  return (
    <div className="mt-8 space-y-10">
      <section aria-labelledby="featured-verses">
        <h2 id="featured-verses" className="text-xl font-bold text-ink sm:text-2xl">
          Featured Quran verses
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2 sm:text-base">
          Read Ayatul Kursi, the Light Verse, and the final two verses of Al-Baqarah
          with Arabic text, English translation, and audio.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[[2, 255], [24, 35], [2, 285], [2, 286]].map(([surah, ayah]) => (
            <li key={`${surah}:${ayah}`}>
              <Link
                href={getAyahPath(surah, ayah)}
                className="block rounded-lg border border-line bg-surface px-3 py-3 text-sm font-semibold text-ink hover:border-brand/30 hover:bg-surface-2"
              >
                {ayahSeo(surah, ayah).heading}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {SURAH_COLLECTIONS.map((collection) => (
        <section key={collection.id} aria-labelledby={`collection-${collection.id}`}>
          <h2 id={`collection-${collection.id}`} className="text-xl font-bold text-ink sm:text-2xl">
            {collection.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2 sm:text-base">
            {collection.description}
          </p>
          <SurahLinkList numbers={collection.numbers} surahs={surahs} />
        </section>
      ))}

      <section aria-labelledby="collection-juz">
        <h2 id="collection-juz" className="text-xl font-bold text-ink sm:text-2xl">
          Surahs by Juz
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2 sm:text-base">
          The Quran is divided into 30 ajza (parts). Open any juz to read its surahs in order, or jump to the
          opening chapter of each juz below.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {JUZ_START_SURAHS.map((startSurah, index) => {
            const juz = index + 1;
            const meta = surahMeta(startSurah, surahs);
            return (
              <li key={juz}>
                <Link
                  href={`/juz/${juz}`}
                  className="block rounded-lg border border-line bg-surface px-3 py-2.5 text-sm hover:border-brand/30 hover:bg-surface-2"
                >
                  <span className="font-semibold text-ink">Juz {juz}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">
                    Starts {meta.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="translation-hubs" className="rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-5 sm:p-6">
        <h2 id="translation-hubs" className="text-xl font-bold text-ink">
          Quran translations
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Read the Quran in English, Urdu, or Pashto — each language has a dedicated hub with all 114 surah pages
          server-rendered in that translation.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <li>
            <Link href="/quran-english-translation" className="text-brand hover:underline">
              English (Saheeh International)
            </Link>
          </li>
          <li>
            <Link href="/quran-urdu-translation" hrefLang="ur" className="text-brand hover:underline">
              Urdu translation
            </Link>
          </li>
          <li>
            <Link href="/quran-pashto-translation" hrefLang="ps" className="text-brand hover:underline">
              Pashto translation
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
