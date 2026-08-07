import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { getSurahArabicName, getSurahHref } from '@/lib/surah-meta';

// Curated list of well-known ayah IDs (global ayah IDs from the database)
// Each entry: [surahNumber, ayahNumber, globalId]
const CURATED_AYAHS: [number, number, number][] = [
  [2, 255, 269],   // Ayat al-Kursi
  [1, 1, 1],       // Al-Fatiha 1
  [1, 2, 2],       // Al-Fatiha 2
  [2, 286, 300],   // Al-Baqarah last
  [3, 18, 353],    // Shahada
  [3, 185, 520],   // Every soul shall taste death
  [4, 36, 560],    // Worship Allah
  [13, 28, 1707],  // Hearts find rest
  [14, 7, 1714],   // Gratitude
  [17, 9, 2089],   // Quran guides to right
  [18, 10, 2267],  // Cave youth
  [20, 14, 2466],  // I am Allah
  [24, 35, 2862],  // Light verse
  [33, 56, 3793],  // Salah on Prophet
  [36, 1, 3834],   // Ya-Sin
  [39, 53, 4244],  // Do not despair
  [40, 60, 4363],  // Call on Me
  [49, 13, 4927],  // People are nations
  [55, 1, 5140],   // Al-Rahman
  [56, 77, 5262],  // Noble Quran
  [57, 4, 5349],   // He is with you
  [59, 22, 5403],  // Allah is He
  [62, 9, 5516],   // Friday prayer
  [67, 1, 5673],   // Sovereignty
  [73, 20, 5768],  // Last of Al-Muzzammil
  [76, 1, 5831],   // Man
  [78, 1, 5874],   // What are they asking
  [87, 1, 6130],   // Glorify the name
  [93, 1, 6230],   // Ad-Duha
  [94, 1, 6238],   // Ash-Sharh
  [112, 1, 6372],  // Al-Ikhlas
  [113, 1, 6376],  // Al-Falaq
  [114, 1, 6380],  // An-Nas
];

function getDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % CURATED_AYAHS.length;
}

export async function DailyVerse() {
  const idx = getDayIndex();
  const [surahNumber, ayahNumber, _globalId] = CURATED_AYAHS[idx];

  let ayah;
  let surah;
  try {
    [ayah, surah] = await Promise.all([
      quranApi.ayah(surahNumber, ayahNumber, { translations: 'en-sahih-international' }),
      quranApi.surah(surahNumber),
    ]);
  } catch {
    return null;
  }

  const translation = ayah.translations?.[0]?.text;

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-emerald-900/60 via-emerald-950 to-emerald-900/30 p-8">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl" />

        {/* Header */}
        <div className="relative mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-500">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Verse of the Day</p>
            <p className="text-sm font-medium text-slate-300">
              {surah.nameSimple} &middot; Ayah {ayahNumber}
            </p>
          </div>
        </div>

        {/* Arabic text */}
        <p
          className="relative mb-6 font-arabic text-2xl leading-loose text-white sm:text-3xl"
          dir="rtl"
          lang="ar"
        >
          {ayah.textUthmani}
        </p>

        {/* Translation */}
        {translation && (
          <p className="relative mb-6 text-sm leading-relaxed text-slate-300 sm:text-base">
            &ldquo;{translation}&rdquo;
          </p>
        )}

        {/* Footer */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-500">
              {getSurahArabicName(surah.number, surah.nameArabic)}
            </span>
            {ayah.juz && (
              <span className="rounded-full border border-emerald-800 bg-emerald-900/50 px-3 py-1 text-xs text-slate-400">
                Juz {ayah.juz}
              </span>
            )}
          </div>
          <Link
            href={getSurahHref(surahNumber, { ayahId: ayah.id })}
            className="group flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-500 transition-all hover:bg-gold-500/20"
          >
            <BookOpen className="h-4 w-4" />
            Read in context
          </Link>
        </div>
      </div>
    </section>
  );
}
